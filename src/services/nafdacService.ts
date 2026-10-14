/**
 * TrustLens NAFDAC Forensic Verification Service
 * Direct integration with NAFDAC Greenbook & Offline Index
 */

export interface NafdacProduct {
  productId: number;
  nrn: string;
  normalizedNrn: string;
  lookupKey: string;
  productName: string;
  status: 'Active' | 'Inactive' | string;
  category: string;
  categoryId?: number;
  ingredientName: string;
  strength: string;
  dosageForm: string;
  routeOfAdmin: string;
  applicantName: string;
  approvalDate: string | null;
  expiryDate: string | null;
  composition: string;
  productDescription: string;
  packSize: string;
  atcCode: string | null;
  smpcUrl: string | null;
}

export interface NafdacIndexItem {
  productId: number;
  nrn: string;
  name: string;
  status: string;
  ingredient: string;
  strength: string;
  dosageForm: string;
  applicant: string;
  expiryDate: string | null;
}

export interface NafdacVerificationResult {
  isVerified: boolean;
  status: 'AUTHENTIC_ACTIVE' | 'EXPIRED_OR_INACTIVE' | 'CLONED_OR_MISMATCH' | 'UNREGISTERED';
  regulatoryBadge: string;
  confidenceScore: number;
  officialProduct?: Partial<NafdacProduct>;
  warnings: string[];
  forensicNotes: string[];
  summary: string;
}

export class NafdacService {
  private static localIndex: Record<string, NafdacIndexItem> | null = null;
  private static localPrefixIndex: Record<string, { nrn: string; name: string; status: string }[]> | null = null;
  private static isIndexLoaded = false;

  private static cleanKey(text: string): string {
    if (!text) return '';
    return text.toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  /**
   * Lazily loads the local index for offline instant verification
   */
  public static async loadLocalIndex(): Promise<void> {
    if (this.isIndexLoaded) return;
    try {
      // Dynamic import of the index dataset
      const indexData = await import('../data/nafdac-index.json');
      this.localIndex = (indexData as any).byNrn ?? {};
      this.localPrefixIndex = (indexData as any).byPrefix ?? {};
      this.isIndexLoaded = true;
    } catch {
      // Local index not generated yet or bundle split
      this.localIndex = {};
      this.localPrefixIndex = {};
      this.isIndexLoaded = true;
    }
  }

  /**
   * Live lookup against NAFDAC Greenbook API
   */
  public static async fetchLiveFromGreenbook(query: string): Promise<NafdacProduct[]> {
    try {
      const cleanQuery = query.trim();
      const url = `https://greenbook.nafdac.gov.ng/?draw=1&start=0&length=10&search%5Bvalue%5D=${encodeURIComponent(cleanQuery)}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        return [];
      }

      const json = await response.json();
      const items = json.data || [];

      return items.map((raw: any) => ({
        productId: raw.product_id,
        nrn: (raw.NAFDAC || '').trim(),
        normalizedNrn: (raw.NAFDAC || '').trim().toUpperCase().replace(/\s+/g, ''),
        lookupKey: this.cleanKey(raw.NAFDAC || ''),
        productName: (raw.product_name || '').replace(/[#*]+/g, '').trim(),
        status: (raw.status || 'Active').trim(),
        category: raw.category_name || raw.product_category?.name || 'Drugs',
        categoryId: raw.product_category_id,
        ingredientName: raw.ingredient_name || raw.ingredient?.ingredient_name || '',
        strength: raw.strength || '',
        dosageForm: raw.form_name || raw.form?.name || '',
        routeOfAdmin: raw.route_name || raw.route?.name || '',
        applicantName: raw.applicant_name || raw.applicant?.name || '',
        approvalDate: raw.approval_date || null,
        expiryDate: raw.expiry_date || null,
        composition: raw.composition || '',
        productDescription: raw.product_description || '',
        packSize: raw.pack_size || '',
        atcCode: raw.atc || null,
        smpcUrl: raw.smpc || null,
      }));
    } catch (e) {
      console.warn('Live NAFDAC Greenbook query skipped/offline:', e);
      return [];
    }
  }

  /**
   * Verify a NAFDAC Registration Number (NRN)
   * e.g. "B4-4561", "04-1234", "A4-6099"
   */
  public static async verifyNrn(nrnInput: string): Promise<NafdacVerificationResult> {
    const rawKey = this.cleanKey(nrnInput);
    if (!rawKey || rawKey.length < 3) {
      return {
        isVerified: false,
        status: 'UNREGISTERED',
        regulatoryBadge: 'INVALID NRN FORMAT',
        confidenceScore: 0,
        warnings: ['Provided NAFDAC number is too short or invalid.'],
        forensicNotes: ['Please provide a valid NAFDAC registration code (e.g., A4-1234 or 04-5678).'],
        summary: 'Invalid registration number format.',
      };
    }

    await this.loadLocalIndex();

    // 1. Check local fast index
    const localHit = this.localIndex?.[rawKey];
    if (localHit) {
      const isActive = localHit.status.toLowerCase() === 'active';
      return {
        isVerified: true,
        status: isActive ? 'AUTHENTIC_ACTIVE' : 'EXPIRED_OR_INACTIVE',
        regulatoryBadge: isActive ? 'NAFDAC VERIFIED ACTIVE' : 'NAFDAC INACTIVE / EXPIRED',
        confidenceScore: isActive ? 99 : 75,
        officialProduct: {
          productId: localHit.productId,
          nrn: localHit.nrn,
          productName: localHit.name,
          status: localHit.status,
          ingredientName: localHit.ingredient,
          strength: localHit.strength,
          dosageForm: localHit.dosageForm,
          applicantName: localHit.applicant,
          expiryDate: localHit.expiryDate,
        },
        warnings: isActive ? [] : ['NAFDAC registration is no longer active or may have expired.'],
        forensicNotes: [
          `Verified in official NAFDAC database as: "${localHit.name}".`,
          `Licensed applicant: ${localHit.applicant || 'N/A'}.`,
          `Dosage form: ${localHit.dosageForm || 'N/A'}, Strength: ${localHit.strength || 'N/A'}.`,
        ],
        summary: isActive
          ? `Authentic NAFDAC registered product: ${localHit.name} (${localHit.nrn}). Licensed to ${localHit.applicant}.`
          : `Registration found (${localHit.nrn}) but current NAFDAC status is ${localHit.status}.`,
      };
    }

    // 2. Fallback to live query for newly registered items
    const liveHits = await this.fetchLiveFromGreenbook(nrnInput);
    const matched = liveHits.find(h => this.cleanKey(h.nrn) === rawKey) || liveHits[0];

    if (matched && this.cleanKey(matched.nrn) === rawKey) {
      const isActive = matched.status.toLowerCase() === 'active';
      return {
        isVerified: true,
        status: isActive ? 'AUTHENTIC_ACTIVE' : 'EXPIRED_OR_INACTIVE',
        regulatoryBadge: isActive ? 'NAFDAC VERIFIED ACTIVE (LIVE)' : 'NAFDAC INACTIVE (LIVE)',
        confidenceScore: isActive ? 98 : 70,
        officialProduct: matched,
        warnings: isActive ? [] : ['Official NAFDAC record status is Inactive.'],
        forensicNotes: [
          `Matched live record for "${matched.productName}".`,
          `Applicant: ${matched.applicantName}.`,
          `Approval date: ${matched.approvalDate || 'Unknown'}, Expiry: ${matched.expiryDate || 'N/A'}.`,
        ],
        summary: `Verified via live NAFDAC Greenbook: ${matched.productName} (${matched.nrn}).`,
      };
    }

    // 3. Fallback to search by product name if query wasn't a strict NRN code
    const byName = await this.searchProductByName(nrnInput);
    if (byName) {
      const isActive = byName.status.toLowerCase() === 'active';
      return {
        isVerified: true,
        status: isActive ? 'AUTHENTIC_ACTIVE' : 'EXPIRED_OR_INACTIVE',
        regulatoryBadge: isActive ? 'NAFDAC VERIFIED ACTIVE' : 'NAFDAC INACTIVE / EXPIRED',
        confidenceScore: isActive ? 98 : 72,
        officialProduct: {
          productId: byName.productId,
          nrn: byName.nrn,
          productName: byName.name,
          status: byName.status,
          ingredientName: byName.ingredient,
          strength: byName.strength,
          dosageForm: byName.dosageForm,
          applicantName: byName.applicant,
          expiryDate: byName.expiryDate,
        },
        warnings: isActive ? [] : ['NAFDAC registration is no longer active or may have expired.'],
        forensicNotes: [
          `Matched official NAFDAC registered product: "${byName.name}".`,
          `Registration Number (NRN): ${byName.nrn}.`,
          `Licensed applicant: ${byName.applicant || 'N/A'}.`,
          `Dosage form: ${byName.dosageForm || 'N/A'}, Strength: ${byName.strength || 'N/A'}.`,
        ],
        summary: isActive
          ? `Authentic NAFDAC registered product found: ${byName.name} (${byName.nrn}). Licensed to ${byName.applicant}.`
          : `Registration found for ${byName.name} (${byName.nrn}) but current NAFDAC status is ${byName.status}.`,
      };
    }

    // 4. Not found in official database
    return {
      isVerified: false,
      status: 'UNREGISTERED',
      regulatoryBadge: 'UNREGISTERED / SUSPECT NRN',
      confidenceScore: 15,
      warnings: [
        `NAFDAC Reg. No. or product "${nrnInput}" was NOT found in the official NAFDAC Greenbook registry.`,
        'High risk of substandard or counterfeit product.',
      ],
      forensicNotes: [
        'Checked official pharmaceutical and health registry without match.',
        'Beware of counterfeit packaging attempting to display fabricated registration numbers.',
      ],
      summary: `Warning: "${nrnInput}" is not recognized in official NAFDAC records. Do not ingest without pharmacist verification.`,
    };
  }

  /**
   * Search local NAFDAC index (8,665 records) or live Greenbook by product name or brand keywords
   */
  public static async searchProductByName(productName: string): Promise<NafdacIndexItem | null> {
    const raw = (productName || '').trim().toLowerCase();
    if (!raw || raw.length < 2) return null;

    await this.loadLocalIndex();

    if (this.localIndex) {
      // 1. Direct exact or substring check
      for (const item of Object.values(this.localIndex)) {
        const itemNameLower = item.name.toLowerCase();
        if (itemNameLower === raw || itemNameLower.includes(raw) || raw.includes(itemNameLower)) {
          return item;
        }
      }

      // 2. Tokenized match
      const stopWords = new Set([
        'tablet', 'tablets', 'capsule', 'capsules', 'syrup', 'suspension',
        'mg', 'ml', 'linctus', 'drops', 'injection', 'cream', 'gel',
        'ointment', 'solution', 'extra', 'forte', 'infusion', 'check',
        'nrn', 'duplicate', 'syrup', 'cough'
      ]);
      const queryTokens = raw
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length >= 3 && !stopWords.has(t));

      if (queryTokens.length > 0) {
        let bestMatch: NafdacIndexItem | null = null;
        let highestScore = 0;

        for (const item of Object.values(this.localIndex)) {
          const itemNameLower = item.name.toLowerCase();
          let score = 0;
          for (const token of queryTokens) {
            if (itemNameLower.includes(token)) {
              score += token.length;
            }
          }
          if (score > highestScore && score >= 4) {
            highestScore = score;
            bestMatch = item;
          }
        }

        if (bestMatch && highestScore >= 4) {
          return bestMatch;
        }
      }
    }

    // 3. Fallback to live Greenbook API
    try {
      const live = await this.fetchLiveFromGreenbook(productName);
      if (live && live.length > 0) {
        const top = live[0];
        return {
          productId: top.productId,
          nrn: top.nrn,
          name: top.productName,
          status: top.status,
          ingredient: top.ingredientName,
          strength: top.strength,
          dosageForm: top.dosageForm,
          applicant: top.applicantName,
          expiryDate: top.expiryDate,
        };
      }
    } catch {
      // ignore
    }

    return null;
  }

  /**
   * Forensic Cross-Check:
   * Compares scanned physical package details against official NAFDAC records
   * to catch "NRN Cloning" (counterfeiters putting a real NAFDAC number of Drug A onto Drug B).
   */
  public static async crossExamineProduct(params: {
    scannedNrn?: string;
    scannedProductName?: string;
    scannedDosageForm?: string;
    scannedActiveIngredient?: string;
  }): Promise<{
    passed: boolean;
    cloningAnomalyDetected: boolean;
    notes: string[];
    officialRecord?: Partial<NafdacProduct>;
  }> {
    const { scannedNrn, scannedProductName, scannedDosageForm } = params;
    if (!scannedNrn) {
      return {
        passed: false,
        cloningAnomalyDetected: false,
        notes: ['No NAFDAC number was provided or extracted to cross-examine.'],
      };
    }

    const verification = await this.verifyNrn(scannedNrn);
    if (!verification.isVerified || !verification.officialProduct) {
      return {
        passed: false,
        cloningAnomalyDetected: false,
        notes: ['Product NRN is unverified in official database.'],
      };
    }

    const official = verification.officialProduct;
    const notes: string[] = [];
    let anomaly = false;

    // Check 1: Product Name Mismatch
    if (scannedProductName && official.productName) {
      const scanWords = scannedProductName.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      const officialLower = official.productName.toLowerCase();
      const hasMatch = scanWords.some(w => officialLower.includes(w));

      if (!hasMatch) {
        anomaly = true;
        notes.push(
          `CRITICAL CLONING MISMATCH: The scanned package says "${scannedProductName}", but NAFDAC registered NRN ${official.nrn} belongs to "${official.productName}".`
        );
      } else {
        notes.push(`Brand name matches official registered name: "${official.productName}".`);
      }
    }

    // Check 2: Dosage Form Mismatch
    if (scannedDosageForm && official.dosageForm) {
      const scanForm = scannedDosageForm.toLowerCase();
      const offForm = official.dosageForm.toLowerCase();
      if (!scanForm.includes(offForm) && !offForm.includes(scanForm)) {
        notes.push(`Formulation discrepancy: Label mentions "${scannedDosageForm}", official record registered as "${official.dosageForm}".`);
      }
    }

    return {
      passed: !anomaly,
      cloningAnomalyDetected: anomaly,
      notes,
      officialRecord: official,
    };
  }
}
