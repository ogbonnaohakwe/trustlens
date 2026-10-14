import { ScanHistoryRecord } from './database';

export interface UserProfileRecord {
  name: string;
  email: string;
  securityTier: string;
  age: number;
  gender: string;
  country: string;
  allergies: string;
  conditions: string;
  isLoggedIn?: number;
  hasGivenBirth?: string;
  childrenCount?: number;
  hadSurgery?: string;
  surgeryType?: string;
}

export class FirebaseApiService {
  private static readonly FIRESTORE_BASE_URL = 'https://firestore.googleapis.com';
  private static readonly FUNCTIONS_BASE_URL = 'https://us-central1-trustlens-ai.cloudfunctions.net';

  public static get PROJECT_ID(): string {
    return process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'trustlens-ai';
  }

  public static get API_KEY(): string {
    return process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '';
  }

  public static getDocumentId(email: string): string {
    return email.trim().toLowerCase().replace(/@/g, '_at_').replace(/\./g, '_dot_');
  }

  private static appendApiKey(url: string): string {
    if (this.API_KEY) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}key=${this.API_KEY}`;
    }
    return url;
  }

  // --------------------------------------------------------------------------
  // USER PROFILES
  // --------------------------------------------------------------------------

  /**
   * Fetch user profile from Google Cloud Firestore
   */
  public static async getUserProfile(email: string): Promise<UserProfileRecord | null> {
    const docId = this.getDocumentId(email);
    const url = this.appendApiKey(
      `${this.FIRESTORE_BASE_URL}/v1/projects/${this.PROJECT_ID}/databases/(default)/documents/users/${docId}`
    );

    try {
      const response = await fetch(url);
      if (response.status === 200) {
        const data = await response.json();
        const fields = data.fields;
        if (fields) {
          return {
            name: fields.name?.stringValue ?? 'Clinical Partner',
            email: fields.email?.stringValue ?? email,
            securityTier: fields.securityTier?.stringValue ?? 'Tier 3: Clinical Administrator',
            age: parseInt(fields.age?.stringValue ?? fields.age?.integerValue ?? '30', 10) || 30,
            gender: fields.gender?.stringValue ?? 'Unspecified',
            country: fields.country?.stringValue ?? 'Nigeria',
            allergies: fields.allergies?.stringValue ?? '',
            conditions: fields.conditions?.stringValue ?? '',
            isLoggedIn: 1,
            hasGivenBirth: fields.hasGivenBirth?.stringValue,
            childrenCount: fields.childrenCount?.integerValue ? parseInt(fields.childrenCount.integerValue, 10) : undefined,
            hadSurgery: fields.hadSurgery?.stringValue,
            surgeryType: fields.surgeryType?.stringValue,
          };
        }
      } else if (response.status === 404) {
        return null;
      }
      return null;
    } catch (e) {
      console.warn('Firestore getUserProfile failed:', e);
      return null;
    }
  }

  /**
   * Save or Patch user profile in Google Cloud Firestore
   */
  public static async saveUserProfile(profile: UserProfileRecord): Promise<boolean> {
    const docId = this.getDocumentId(profile.email);
    const url = this.appendApiKey(
      `${this.FIRESTORE_BASE_URL}/v1/projects/${this.PROJECT_ID}/databases/(default)/documents/users/${docId}`
    );

    const docData: any = {
      fields: {
        name: { stringValue: profile.name ?? '' },
        email: { stringValue: profile.email ?? '' },
        securityTier: { stringValue: profile.securityTier ?? 'Tier 3: Clinical Administrator' },
        age: { integerValue: (profile.age ?? 30).toString() },
        gender: { stringValue: profile.gender ?? 'Unspecified' },
        country: { stringValue: profile.country ?? 'Nigeria' },
        allergies: { stringValue: profile.allergies ?? '' },
        conditions: { stringValue: profile.conditions ?? '' },
        hasGivenBirth: { stringValue: profile.hasGivenBirth ?? '' },
        childrenCount: { integerValue: (profile.childrenCount ?? 0).toString() },
        hadSurgery: { stringValue: profile.hadSurgery ?? '' },
        surgeryType: { stringValue: profile.surgeryType ?? '' },
        updatedAt: { timestampValue: new Date().toISOString() },
      },
    };

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docData),
      });
      return response.ok;
    } catch (e) {
      console.warn('Firestore saveUserProfile failed:', e);
      return false;
    }
  }

  // --------------------------------------------------------------------------
  // SCAN RECORDS & REAL DATABASE ENTRIES
  // --------------------------------------------------------------------------

  /**
   * Save a real Scan History record to Firestore
   * Saves to both user-scoped collection and top-level scans repository
   */
  public static async saveScanRecord(
    scan: ScanHistoryRecord,
    userEmail?: string
  ): Promise<{ success: boolean; firestoreId?: string }> {
    const scanDocId = `scan_${scan.id}`;
    const userDocId = userEmail ? this.getDocumentId(userEmail) : 'anonymous';

    const url = this.appendApiKey(
      `${this.FIRESTORE_BASE_URL}/v1/projects/${this.PROJECT_ID}/databases/(default)/documents/users/${userDocId}/scans/${scanDocId}`
    );

    // Format arrays into Firestore arrayValues
    const formatArray = (arr: string[] = []) => ({
      arrayValue: {
        values: arr.map((item) => ({ stringValue: item })),
      },
    });

    const docData = {
      fields: {
        scanId: { integerValue: scan.id.toString() },
        productName: { stringValue: scan.productName || 'Unknown Product' },
        productSubtitle: { stringValue: scan.productSubtitle || '' },
        safetyScore: { integerValue: (scan.safetyScore || 0).toString() },
        safetyStatus: { stringValue: scan.safetyStatus || 'SAFE' },
        authenticityLabel: { stringValue: scan.authenticityLabel || 'Vetted' },
        allergenAlertMessage: { stringValue: scan.allergenAlertMessage || '' },
        avoidIngredients: formatArray(scan.avoidIngredients),
        cautionIngredients: formatArray(scan.cautionIngredients),
        safeIngredients: formatArray(scan.safeIngredients),
        summaryReport: { stringValue: scan.summaryReport || '' },
        nafdacNumber: { stringValue: scan.nafdacNumber || '' },
        nafdacVerified: { booleanValue: Boolean(scan.nafdacVerified) },
        imageUrl: { stringValue: scan.imageUrl || '' }, // Real Cloudflare R2 image URL
        timestamp: { integerValue: (scan.timestamp || Date.now()).toString() },
        createdAt: { timestampValue: new Date(scan.timestamp || Date.now()).toISOString() },
      },
    };

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docData),
      });

      if (response.ok) {
        return { success: true, firestoreId: scanDocId };
      }
      return { success: false };
    } catch (e) {
      console.warn('Firestore saveScanRecord failed:', e);
      return { success: false };
    }
  }

  /**
   * Fetch all real scans for a user from Google Cloud Firestore
   */
  public static async getUserScans(userEmail?: string): Promise<ScanHistoryRecord[]> {
    const userDocId = userEmail ? this.getDocumentId(userEmail) : 'anonymous';
    const url = this.appendApiKey(
      `${this.FIRESTORE_BASE_URL}/v1/projects/${this.PROJECT_ID}/databases/(default)/documents/users/${userDocId}/scans`
    );

    try {
      const response = await fetch(url);
      if (response.status === 200) {
        const data = await response.json();
        const documents: any[] = data.documents || [];

        return documents.map((doc: any) => {
          const f = doc.fields || {};
          const extractArray = (fieldObj: any): string[] => {
            const vals = fieldObj?.arrayValue?.values || [];
            return vals.map((v: any) => v.stringValue || '').filter(Boolean);
          };

          const rawId = f.scanId?.integerValue || doc.name?.split('/').pop()?.replace('scan_', '');
          const id = parseInt(rawId, 10) || Date.now();

          return {
            id,
            productName: f.productName?.stringValue || 'Scanned Formulation',
            productSubtitle: f.productSubtitle?.stringValue || '',
            safetyScore: parseInt(f.safetyScore?.integerValue || '85', 10),
            safetyStatus: (f.safetyStatus?.stringValue as any) || 'SAFE',
            authenticityLabel: f.authenticityLabel?.stringValue || 'Vetted',
            authenticityPercentage: 96,
            allergenAlertMessage: f.allergenAlertMessage?.stringValue || '',
            avoidIngredients: extractArray(f.avoidIngredients),
            cautionIngredients: extractArray(f.cautionIngredients),
            safeIngredients: extractArray(f.safeIngredients),
            summaryReport: f.summaryReport?.stringValue || '',
            nafdacNumber: f.nafdacNumber?.stringValue,
            nafdacVerified: f.nafdacVerified?.booleanValue ?? false,
            imageUrl: f.imageUrl?.stringValue || '',
            timestamp: parseInt(f.timestamp?.integerValue || Date.now().toString(), 10),
          };
        });
      }
      return [];
    } catch (e) {
      console.warn('Firestore getUserScans failed:', e);
      return [];
    }
  }

  /**
   * Delete a scan record from Firestore
   */
  public static async deleteScanRecord(scanId: number | string, userEmail?: string): Promise<boolean> {
    const userDocId = userEmail ? this.getDocumentId(userEmail) : 'anonymous';
    const scanDocId = `scan_${scanId}`;
    const url = this.appendApiKey(
      `${this.FIRESTORE_BASE_URL}/v1/projects/${this.PROJECT_ID}/databases/(default)/documents/users/${userDocId}/scans/${scanDocId}`
    );

    try {
      const response = await fetch(url, { method: 'DELETE' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Delete user account via Cloud Function REST endpoint
   */
  public static async deleteUserAccount(email: string): Promise<{ success: boolean; message?: string }> {
    const url = `${this.FUNCTIONS_BASE_URL}/deleteUserAccount`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.status === 200) {
        return await response.json();
      }
      return { success: false, message: `Cloud Function returned status ${response.status}` };
    } catch (e: any) {
      return { success: false, message: e?.message ?? 'Failed to reach cloud endpoint' };
    }
  }
}
