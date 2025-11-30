import { projectId, publicAnonKey } from './supabase/info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f`;

export interface GameData {
  balance: number;
  xp: number;
  level: number;
  boosts: any[];
  achievements: any[];
  stats: any;
  rollHistory?: any[];
  placedBets?: any[];
  gamePhase?: string;
  point?: number | null;
  lastSaved?: number;
}

/**
 * Retry helper for network requests with exponential backoff
 */
async function retryFetch(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  delayMs = 1000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      return response; // Success!
    } catch (error) {
      lastError = error as Error;
      console.log(`🔄 Fetch attempt ${attempt}/${maxRetries} failed:`, error);
      
      if (attempt === maxRetries) {
        throw lastError; // Last attempt failed
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const waitTime = delayMs * Math.pow(2, attempt - 1);
      console.log(`⏳ Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError || new Error('Retry failed');
}

/**
 * Save user game data to cloud storage
 */
export async function saveToCloud(email: string, data: GameData): Promise<boolean> {
  try {
    console.log('💾 Saving data to cloud for:', email);
    
    const response = await retryFetch(`${SERVER_URL}/user/save-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        email,
        data
      })
    }, 3, 1000); // 3 retries with 1s initial delay

    if (!response.ok) {
      throw new Error(`Failed to save data: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Data saved to cloud successfully');
    return result.success;
  } catch (error) {
    console.error('❌ Error saving to cloud:', error);
    // Still save to localStorage as backup
    localStorage.setItem(`cloud-backup-${email}`, JSON.stringify(data));
    return false;
  }
}

/**
 * Load user game data from cloud storage
 */
export async function loadFromCloud(email: string): Promise<GameData | null> {
  try {
    console.log('📥 Loading data from cloud for:', email);
    
    const response = await retryFetch(`${SERVER_URL}/user/load-data?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    }, 3, 1000); // 3 retries with 1s initial delay

    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      console.log('✅ Data loaded from cloud successfully');
      return result.data as GameData;
    } else {
      console.log('📂 No cloud data found, checking local backup...');
      // Try localStorage backup
      const backup = localStorage.getItem(`cloud-backup-${email}`);
      if (backup) {
        return JSON.parse(backup) as GameData;
      }
      return null;
    }
  } catch (error) {
    console.error('❌ Error loading from cloud:', error);
    // Fallback to localStorage
    const backup = localStorage.getItem(`cloud-backup-${email}`);
    if (backup) {
      console.log('📂 Using local backup data');
      return JSON.parse(backup) as GameData;
    }
    return null;
  }
}

/**
 * Auto-save lightweight data to cloud (called periodically)
 */
export async function autoSaveToCloud(email: string, data: Partial<GameData>): Promise<boolean> {
  try {
    const response = await retryFetch(`${SERVER_URL}/user/auto-save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        email,
        ...data
      })
    }, 2, 1000); // 2 retries for auto-save (less aggressive)

    if (!response.ok) {
      throw new Error(`Auto-save failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('❌ Auto-save error:', error);
    return false;
  }
}

/**
 * Sync local storage with cloud (merge strategy)
 */
export async function syncWithCloud(email: string, localData: GameData): Promise<GameData> {
  try {
    const cloudData = await loadFromCloud(email);
    
    if (!cloudData) {
      // No cloud data, save local to cloud
      await saveToCloud(email, localData);
      return localData;
    }

    // Compare timestamps to determine which is newer
    const localTime = localData.lastSaved || 0;
    const cloudTime = cloudData.lastSaved || 0;

    if (cloudTime > localTime) {
      console.log('☁️ Cloud data is newer, using cloud data');
      return cloudData;
    } else {
      console.log('💻 Local data is newer, uploading to cloud');
      await saveToCloud(email, localData);
      return localData;
    }
  } catch (error) {
    console.error('❌ Sync error:', error);
    return localData;
  }
}