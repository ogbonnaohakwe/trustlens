import { Platform } from 'react-native';
import { UserProfileRecord } from './firebaseApi';
import { ScannedProductAnalysis } from './productAnalysisEngine';

export interface ScanHistoryRecord extends ScannedProductAnalysis {
  id: number;
  imageUrl?: string;
  timestamp: number;
}

export interface AiChatHistoryRecord {
  id: string;
  query: string;
  response: string;
  timestamp: number;
}

const STORAGE_KEYS = {
  USER_PROFILE: 'trustlens_user_profile',
  ALL_USERS: 'trustlens_all_users',
  SCAN_HISTORY: 'trustlens_scan_history',
  THEME_MODE: 'trustlens_theme_mode',
  AI_CHAT_HISTORY: 'trustlens_ai_chat_history',
};

// In-memory cache for ultra-fast access
let memoryUserProfile: UserProfileRecord | null = null;
let memoryScanHistory: ScanHistoryRecord[] = [];
let memoryAiChatHistory: AiChatHistoryRecord[] = [];
let memoryUsersList: Record<string, UserProfileRecord> = {};
let memoryIsDarkMode: boolean | null = null;

class LocalDatabase {
  private isInitialized = false;

  private async getStorageItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    // On native, fallback to in-memory or global storage
    return (globalThis as any)[key] ?? null;
  }

  private async setStorageItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
    (globalThis as any)[key] = value;
  }

  public async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const storedProfile = await this.getStorageItem(STORAGE_KEYS.USER_PROFILE);
      if (storedProfile) {
        memoryUserProfile = JSON.parse(storedProfile);
      }

      const storedHistory = await this.getStorageItem(STORAGE_KEYS.SCAN_HISTORY);
      if (storedHistory) {
        memoryScanHistory = JSON.parse(storedHistory);
      }

      const storedUsers = await this.getStorageItem(STORAGE_KEYS.ALL_USERS);
      if (storedUsers) {
        memoryUsersList = JSON.parse(storedUsers);
      }

      const storedAiChat = await this.getStorageItem(STORAGE_KEYS.AI_CHAT_HISTORY);
      if (storedAiChat) {
        memoryAiChatHistory = JSON.parse(storedAiChat);
      }

      const storedTheme = await this.getStorageItem(STORAGE_KEYS.THEME_MODE);
      if (storedTheme !== null) {
        memoryIsDarkMode = false; // Always light mode
      }
    } catch (e) {
      console.warn('Database initialization warning:', e);
    }

    this.isInitialized = true;
  }

  // --- Theme Preference ---
  public async getThemePreference(): Promise<boolean | null> {
    await this.init();
    return memoryIsDarkMode;
  }

  public async saveThemePreference(isDark: boolean): Promise<void> {
    await this.init();
    memoryIsDarkMode = isDark;
    await this.setStorageItem(STORAGE_KEYS.THEME_MODE, isDark ? 'dark' : 'light');
  }

  // --- User Profile Operations ---
  public async getActiveUserProfile(): Promise<UserProfileRecord | null> {
    await this.init();
    if (memoryUserProfile && memoryUserProfile.isLoggedIn === 1) {
      return memoryUserProfile;
    }
    return null;
  }

  public async getUserProfile(email: string): Promise<UserProfileRecord | null> {
    await this.init();
    const cleanEmail = email.trim().toLowerCase();
    return memoryUsersList[cleanEmail] ?? null;
  }

  public async saveUserProfile(profile: UserProfileRecord): Promise<void> {
    await this.init();
    const cleanEmail = profile.email.trim().toLowerCase();
    const updated = { ...profile, email: cleanEmail };

    memoryUsersList[cleanEmail] = updated;
    await this.setStorageItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(memoryUsersList));

    if (updated.isLoggedIn === 1) {
      // Log out other users
      Object.keys(memoryUsersList).forEach(e => {
        if (e !== cleanEmail) {
          memoryUsersList[e].isLoggedIn = 0;
        }
      });
      memoryUserProfile = updated;
      await this.setStorageItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updated));
    }
  }

  // --- Scan History Operations ---
  public async getAllScans(): Promise<ScanHistoryRecord[]> {
    await this.init();
    return [...memoryScanHistory].sort((a, b) => b.timestamp - a.timestamp);
  }

  public async saveScan(analysis: ScannedProductAnalysis, imageUrl?: string): Promise<ScanHistoryRecord> {
    await this.init();
    const record: ScanHistoryRecord = {
      ...analysis,
      id: Date.now() + Math.floor(Math.random() * 1000),
      imageUrl: imageUrl ?? '',
      timestamp: Date.now(),
    };

    memoryScanHistory.unshift(record);
    await this.setStorageItem(STORAGE_KEYS.SCAN_HISTORY, JSON.stringify(memoryScanHistory));
    return record;
  }

  public async deleteScan(id: number): Promise<void> {
    await this.init();
    memoryScanHistory = memoryScanHistory.filter(s => s.id !== id);
    await this.setStorageItem(STORAGE_KEYS.SCAN_HISTORY, JSON.stringify(memoryScanHistory));
  }

  public async syncRemoteScans(remoteScans: ScanHistoryRecord[]): Promise<ScanHistoryRecord[]> {
    await this.init();
    const existingIds = new Set(memoryScanHistory.map(s => s.id));
    for (const remote of remoteScans) {
      if (!existingIds.has(remote.id)) {
        memoryScanHistory.push(remote);
        existingIds.add(remote.id);
      }
    }
    memoryScanHistory.sort((a, b) => b.timestamp - a.timestamp);
    await this.setStorageItem(STORAGE_KEYS.SCAN_HISTORY, JSON.stringify(memoryScanHistory));
    return [...memoryScanHistory];
  }

  public async clearHistory(): Promise<void> {
    await this.init();
    memoryScanHistory = [];
    await this.setStorageItem(STORAGE_KEYS.SCAN_HISTORY, JSON.stringify([]));
  }

  // --- AI Assistant Chat History ---
  public async getAiChatHistory(): Promise<AiChatHistoryRecord[]> {
    await this.init();
    return [...memoryAiChatHistory].sort((a, b) => b.timestamp - a.timestamp);
  }

  public async saveAiChatRecord(query: string, response: string): Promise<AiChatHistoryRecord> {
    await this.init();
    const record: AiChatHistoryRecord = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      query: query.trim(),
      response: response.trim(),
      timestamp: Date.now(),
    };
    memoryAiChatHistory.unshift(record);
    // Keep max 50 recent inquiries
    if (memoryAiChatHistory.length > 50) {
      memoryAiChatHistory = memoryAiChatHistory.slice(0, 50);
    }
    await this.setStorageItem(STORAGE_KEYS.AI_CHAT_HISTORY, JSON.stringify(memoryAiChatHistory));
    return record;
  }

  public async clearAiChatHistory(): Promise<void> {
    await this.init();
    memoryAiChatHistory = [];
    await this.setStorageItem(STORAGE_KEYS.AI_CHAT_HISTORY, JSON.stringify([]));
  }
}

export const DatabaseHelper = new LocalDatabase();
