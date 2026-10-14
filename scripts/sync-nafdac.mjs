/**
 * Automated Ingestion Pipeline for NAFDAC Greenbook Database
 * Source: https://greenbook.nafdac.gov.ng/
 *
 * Downloads all registered pharmaceutical and health products from NAFDAC Greenbook,
 * normalizes and cleans the records, and generates both a comprehensive database
 * and a high-speed indexed lookup table for TrustLens.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'src', 'data');

const BASE_URL = 'https://greenbook.nafdac.gov.ng/';
const BATCH_SIZE = 500;
const MAX_RETRIES = 4;
const RETRY_DELAY_MS = 2500;

function decodeHtmlEntities(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function cleanProductName(name) {
  if (!name) return '';
  return decodeHtmlEntities(name)
    .replace(/[#*]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeNrn(nrn) {
  if (!nrn) return '';
  return nrn.trim().toUpperCase().replace(/\s+/g, '');
}

function createNrnLookupKey(nrn) {
  if (!nrn) return '';
  // Strips hyphens, slashes, spaces for flexible search: "B4-4561" -> "B44561"
  return nrn.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      const response = await fetch(url, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
          'User-Agent': 'TrustLens-Ingestion-Pipeline/1.0 (+https://trustlens.ai)'
        },
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      return json;
    } catch (err) {
      if (attempt === retries) {
        throw new Error(`Failed after ${retries} attempts: ${err.message}`);
      }
      const backoff = RETRY_DELAY_MS * Math.pow(1.5, attempt - 1);
      console.warn(`  [Warning] Attempt ${attempt} failed: ${err.message}. Retrying in ${Math.round(backoff)}ms...`);
      await sleep(backoff);
    }
  }
}

async function runPipeline() {
  console.log('====================================================');
  console.log('  TrustLens NAFDAC Greenbook Automated Ingestion   ');
  console.log('====================================================');
  const startTime = Date.now();

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // 1. Fetch metadata and total record count
  console.log('🔍 Querying initial NAFDAC Greenbook metadata...');
  const initialQuery = await fetchWithRetry(`${BASE_URL}?draw=1&start=0&length=1`);
  const totalRecords = initialQuery.recordsTotal || 0;

  console.log(`✅ Total registered products in NAFDAC database: ${totalRecords.toLocaleString()}`);

  if (totalRecords === 0) {
    throw new Error('No records returned from NAFDAC Greenbook endpoint.');
  }

  const allProducts = [];
  const nrnIndex = {};
  const nameIndex = {};
  let activeCount = 0;
  let inactiveCount = 0;

  let currentStart = 0;
  let drawCount = 2;

  // 2. Paginated Fetching
  while (currentStart < totalRecords) {
    const batchLength = Math.min(BATCH_SIZE, totalRecords - currentStart);
    const progress = Math.min(100, Math.round(((currentStart + batchLength) / totalRecords) * 100));
    console.log(`📥 Fetching records ${currentStart + 1} - ${currentStart + batchLength} of ${totalRecords} (${progress}%)...`);

    const queryUrl = `${BASE_URL}?draw=${drawCount++}&start=${currentStart}&length=${batchLength}`;
    const response = await fetchWithRetry(queryUrl);
    const items = response.data || [];

    for (const raw of items) {
      const cleanName = cleanProductName(raw.product_name);
      const rawNrn = (raw.NAFDAC || '').trim();
      const normalizedNrn = normalizeNrn(rawNrn);
      const lookupKey = createNrnLookupKey(rawNrn);
      const status = (raw.status || 'Active').trim();

      if (status.toLowerCase() === 'active') {
        activeCount++;
      } else {
        inactiveCount++;
      }

      const product = {
        productId: raw.product_id,
        nrn: rawNrn,
        normalizedNrn,
        lookupKey,
        productName: cleanName,
        status: status,
        category: decodeHtmlEntities(raw.category_name || raw.product_category?.name || 'Drugs'),
        categoryId: raw.product_category_id,
        ingredientName: decodeHtmlEntities(raw.ingredient_name || raw.ingredient?.ingredient_name || ''),
        strength: decodeHtmlEntities(raw.strength || ''),
        dosageForm: decodeHtmlEntities(raw.form_name || raw.form?.name || ''),
        routeOfAdmin: decodeHtmlEntities(raw.route_name || raw.route?.name || ''),
        applicantName: decodeHtmlEntities(raw.applicant_name || raw.applicant?.name || ''),
        approvalDate: raw.approval_date || null,
        expiryDate: raw.expiry_date || null,
        composition: decodeHtmlEntities(raw.composition || ''),
        productDescription: decodeHtmlEntities(raw.product_description || ''),
        packSize: decodeHtmlEntities(raw.pack_size || ''),
        atcCode: raw.atc || null,
        smpcUrl: raw.smpc || null,
      };

      allProducts.push(product);

      // Fast Indexing by NRN Key (e.g. "B44561" -> product summary)
      if (lookupKey) {
        nrnIndex[lookupKey] = {
          productId: product.productId,
          nrn: product.nrn,
          name: product.productName,
          status: product.status,
          ingredient: product.ingredientName,
          strength: product.strength,
          dosageForm: product.dosageForm,
          applicant: product.applicantName,
          expiryDate: product.expiryDate,
        };
      }

      // Fast Indexing by Product Name prefix for fast autocomplete
      const simpleNameKey = cleanName.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
      const firstWord = simpleNameKey.split(' ')[0];
      if (firstWord && firstWord.length >= 3) {
        if (!nameIndex[firstWord]) {
          nameIndex[firstWord] = [];
        }
        if (nameIndex[firstWord].length < 10) {
          nameIndex[firstWord].push({
            nrn: product.nrn,
            name: product.productName,
            status: product.status,
          });
        }
      }
    }

    currentStart += batchLength;
    // Brief polite pause between chunks
    await sleep(400);
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  // 3. Write Normalized Full Dataset
  const fullDataset = {
    metadata: {
      source: 'NAFDAC Greenbook',
      sourceUrl: 'https://greenbook.nafdac.gov.ng/',
      syncTimestamp: new Date().toISOString(),
      totalRecords: allProducts.length,
      activeRecords: activeCount,
      inactiveRecords: inactiveCount,
      syncDurationSeconds: Number(durationSec),
    },
    products: allProducts,
  };

  const fullDataPath = path.join(DATA_DIR, 'nafdac-greenbook.json');
  fs.writeFileSync(fullDataPath, JSON.stringify(fullDataset, null, 2), 'utf-8');

  // 4. Write High-Speed Compact Lookup Index
  const indexDataset = {
    metadata: {
      syncTimestamp: new Date().toISOString(),
      totalNrnKeys: Object.keys(nrnIndex).length,
    },
    byNrn: nrnIndex,
    byPrefix: nameIndex,
  };

  const indexDataPath = path.join(DATA_DIR, 'nafdac-index.json');
  fs.writeFileSync(indexDataPath, JSON.stringify(indexDataset), 'utf-8');

  const fullSizeMb = (fs.statSync(fullDataPath).size / (1024 * 1024)).toFixed(2);
  const indexSizeMb = (fs.statSync(indexDataPath).size / (1024 * 1024)).toFixed(2);

  console.log('\n====================================================');
  console.log('🎉 INGESTION PIPELINE COMPLETED SUCCESSFULLY!');
  console.log(`⏱️  Elapsed Time: ${durationSec}s`);
  console.log(`📦 Processed Products: ${allProducts.length.toLocaleString()}`);
  console.log(`   - Active: ${activeCount.toLocaleString()}`);
  console.log(`   - Inactive: ${inactiveCount.toLocaleString()}`);
  console.log(`📁 Master Dataset: ${fullDataPath} (${fullSizeMb} MB)`);
  console.log(`⚡ Fast Index File: ${indexDataPath} (${indexSizeMb} MB)`);
  console.log('====================================================');
}

runPipeline().catch(err => {
  console.error('\n❌ PIPELINE FAILED:', err);
  process.exit(1);
});
