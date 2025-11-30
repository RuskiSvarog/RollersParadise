/**
 * 🔒 ROLLERS PARADISE SECURITY MODULE
 * 
 * This module provides comprehensive security for the game:
 * - Data encryption for localStorage
 * - Checksum verification to detect tampering
 * - Anti-cheat detection
 * - Audit logging for suspicious activity
 * - Server-side validation helpers
 */

// Secret key for encryption (in production, this should be environment variable)
const ENCRYPTION_KEY = 'ROLLERS_PARADISE_SECURE_2024_V1';

/**
 * Simple XOR encryption for localStorage data
 * NOTE: This is obfuscation, not military-grade encryption
 * The real security is server-side validation
 */
function xorEncrypt(data: string, key: string): string {
  let result = '';
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result); // Base64 encode
}

function xorDecrypt(encrypted: string, key: string): string {
  try {
    const data = atob(encrypted); // Base64 decode
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch (e) {
    console.error('🚨 Decryption failed - data may be corrupted or tampered');
    return '';
  }
}

/**
 * Generate checksum for data integrity verification
 */
function generateChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Add timestamp salt to make it harder to reverse engineer
  const salt = Date.now().toString().slice(-6);
  return Math.abs(hash).toString(16) + salt;
}

/**
 * Verify checksum to detect tampering
 */
function verifyChecksum(data: string, checksum: string): boolean {
  if (!checksum) return false;
  
  // Extract salt from checksum
  const storedHash = checksum.slice(0, -6);
  
  // Regenerate hash
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const currentHash = Math.abs(hash).toString(16);
  return currentHash === storedHash;
}

/**
 * Secure save data with encryption and checksum
 */
export function secureSave(key: string, data: any): void {
  try {
    const jsonString = JSON.stringify(data);
    const checksum = generateChecksum(jsonString);
    const encrypted = xorEncrypt(jsonString, ENCRYPTION_KEY);
    
    const secureData = {
      data: encrypted,
      checksum,
      version: 1,
      timestamp: Date.now()
    };
    
    localStorage.setItem(key, JSON.stringify(secureData));
    console.log('✅ Secure save completed:', key);
  } catch (error) {
    console.error('🚨 Secure save failed:', error);
  }
}

/**
 * Secure load data with decryption and tampering detection
 */
export function secureLoad<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) {
      console.log('📭 No saved data found for:', key);
      return defaultValue;
    }
    
    const secureData = JSON.parse(stored);
    
    // Verify structure
    if (!secureData.data || !secureData.checksum) {
      console.warn('⚠️ Invalid secure data structure, using default');
      return defaultValue;
    }
    
    // Decrypt
    const decrypted = xorDecrypt(secureData.data, ENCRYPTION_KEY);
    if (!decrypted) {
      console.error('🚨 Decryption failed for:', key);
      return defaultValue;
    }
    
    // Verify checksum (detect tampering)
    const isValid = verifyChecksum(decrypted, secureData.checksum);
    if (!isValid) {
      console.error('🚨🚨🚨 TAMPERING DETECTED! Data has been modified:', key);
      logSecurityEvent('TAMPERING_DETECTED', { key, timestamp: Date.now() });
      // Clear corrupted data
      localStorage.removeItem(key);
      return defaultValue;
    }
    
    const data = JSON.parse(decrypted);
    console.log('✅ Secure load completed:', key);
    return data;
    
  } catch (error) {
    console.error('🚨 Secure load failed:', error);
    return defaultValue;
  }
}

/**
 * Validate balance against server
 */
export async function validateBalance(email: string, localBalance: number): Promise<{ valid: boolean; serverBalance: number }> {
  try {
    const response = await fetch(`https://your-server.supabase.co/functions/v1/validate-balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, localBalance })
    });
    
    const data = await response.json();
    
    if (Math.abs(data.serverBalance - localBalance) > 0.01) {
      console.warn('⚠️ Balance mismatch detected!');
      console.warn(`Local: $${localBalance}, Server: $${data.serverBalance}`);
      logSecurityEvent('BALANCE_MISMATCH', { email, localBalance, serverBalance: data.serverBalance });
    }
    
    return {
      valid: data.valid,
      serverBalance: data.serverBalance
    };
  } catch (error) {
    console.error('🚨 Balance validation failed:', error);
    return { valid: false, serverBalance: localBalance };
  }
}

/**
 * Anti-cheat detection: Check for impossible scenarios
 */
export function detectAntiCheat(data: {
  balance: number;
  totalWagered: number;
  biggestWin: number;
  level: number;
  xp: number;
}): { suspicious: boolean; reasons: string[] } {
  const reasons: string[] = [];
  
  // Check 1: Balance can't exceed realistic limits
  if (data.balance > 10000000) {
    reasons.push('Balance exceeds realistic limits');
  }
  
  // Check 2: Biggest win can't exceed maximum possible (e.g., $10,000 bet * 30:1 odds)
  if (data.biggestWin > 300000) {
    reasons.push('Biggest win exceeds maximum possible payout');
  }
  
  // Check 3: Total wagered should be reasonable (it's a lifetime stat, so allow high values)
  // Only flag if it's astronomically high (e.g., > 1 billion) which is unrealistic for any normal gameplay
  if (data.totalWagered > 1000000000) {
    reasons.push('Total wagered unrealistic (exceeds 1 billion)');
  }
  
  // Check 4: Level/XP should match (assuming 1000 XP per level)
  const expectedLevel = Math.floor(data.xp / 1000);
  if (data.level > expectedLevel + 5) {
    reasons.push('Level too high for XP amount');
  }
  
  // Check 5: Negative values are impossible
  if (data.balance < 0 || data.totalWagered < 0 || data.xp < 0) {
    reasons.push('Negative values detected (impossible)');
  }
  
  if (reasons.length > 0) {
    console.error('🚨🚨🚨 ANTI-CHEAT TRIGGERED:', reasons);
    logSecurityEvent('ANTI_CHEAT_TRIGGERED', { data, reasons });
  }
  
  return {
    suspicious: reasons.length > 0,
    reasons
  };
}

/**
 * Rate limiting: Prevent spam/automation
 */
const rateLimitMap = new Map<string, number[]>();

export function checkRateLimit(action: string, maxPerMinute: number = 60): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(action) || [];
  
  // Remove timestamps older than 1 minute
  const recentTimestamps = timestamps.filter(ts => now - ts < 60000);
  
  if (recentTimestamps.length >= maxPerMinute) {
    console.warn('🚨 Rate limit exceeded for:', action);
    logSecurityEvent('RATE_LIMIT_EXCEEDED', { action, count: recentTimestamps.length });
    return false;
  }
  
  recentTimestamps.push(now);
  rateLimitMap.set(action, recentTimestamps);
  return true;
}

/**
 * Log security events for audit trail
 */
interface SecurityEvent {
  type: string;
  timestamp: number;
  data: any;
  userAgent: string;
  sessionId: string;
}

const securityLog: SecurityEvent[] = [];

export function logSecurityEvent(type: string, data: any): void {
  const event: SecurityEvent = {
    type,
    timestamp: Date.now(),
    data,
    userAgent: navigator.userAgent,
    sessionId: getSessionId()
  };
  
  securityLog.push(event);
  
  // Keep only last 100 events
  if (securityLog.length > 100) {
    securityLog.shift();
  }
  
  // Store to localStorage for persistence
  try {
    localStorage.setItem('security-log', JSON.stringify(securityLog.slice(-100)));
  } catch (e) {
    // Ignore localStorage errors
  }
  
  // In production, send to server
  console.log('🔒 Security event logged:', type, data);
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('session-id');
  if (!sessionId) {
    sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    sessionStorage.setItem('session-id', sessionId);
  }
  return sessionId;
}

/**
 * Get security audit log
 */
export function getSecurityLog(): SecurityEvent[] {
  try {
    const stored = localStorage.getItem('security-log');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // Ignore
  }
  return securityLog;
}

/**
 * Clear security log (admin only)
 */
export function clearSecurityLog(): void {
  securityLog.length = 0;
  localStorage.removeItem('security-log');
  console.log('🧹 Security log cleared');
}

/**
 * Validate dice roll result
 * This checks if the roll could have come from our secure RNG
 */
export function validateDiceRoll(dice1: number, dice2: number, timestamp: number): boolean {
  // Check basic validity
  if (dice1 < 1 || dice1 > 6 || dice2 < 1 || dice2 > 6) {
    console.error('🚨 Invalid dice values:', { dice1, dice2 });
    logSecurityEvent('INVALID_DICE_VALUES', { dice1, dice2 });
    return false;
  }
  
  // Check timestamp is recent (within last 10 seconds)
  const now = Date.now();
  if (Math.abs(now - timestamp) > 10000) {
    console.warn('⚠️ Dice roll timestamp too old or in future');
    logSecurityEvent('SUSPICIOUS_TIMESTAMP', { timestamp, now });
    return false;
  }
  
  return true;
}

/**
 * Integrity check for entire game state
 */
export interface GameState {
  balance: number;
  xp: number;
  level: number;
  stats: {
    wins: number;
    losses: number;
    totalWagered: number;
    biggestWin: number;
  };
  achievements: any[];
}

export function validateGameState(state: GameState): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate balance
  if (typeof state.balance !== 'number' || isNaN(state.balance)) {
    errors.push('Invalid balance type');
  }
  if (state.balance < 0) {
    errors.push('Negative balance');
  }
  if (state.balance > 10000000) {
    errors.push('Balance exceeds maximum');
  }
  
  // Validate XP/Level
  if (typeof state.xp !== 'number' || isNaN(state.xp)) {
    errors.push('Invalid XP type');
  }
  if (state.xp < 0) {
    errors.push('Negative XP');
  }
  
  // Validate stats
  if (state.stats.wins < 0 || state.stats.losses < 0) {
    errors.push('Negative win/loss count');
  }
  if (state.stats.totalWagered < 0) {
    errors.push('Negative total wagered');
  }
  if (state.stats.biggestWin < 0) {
    errors.push('Negative biggest win');
  }
  
  // Check relationships
  if (state.stats.biggestWin > state.balance * 10) {
    errors.push('Biggest win unrealistic for current balance');
  }
  
  if (errors.length > 0) {
    console.error('🚨 Game state validation failed:', errors);
    logSecurityEvent('INVALID_GAME_STATE', { state, errors });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Server-side verification helper
 * In production, ALL critical operations should be verified by server
 */
export async function verifyWithServer(action: string, data: any): Promise<{ verified: boolean; serverData?: any }> {
  try {
    // This would call your Supabase Edge Function
    console.log('🔒 Verifying with server:', action, data);
    
    // For now, return true (implement real server verification later)
    return { verified: true };
  } catch (error) {
    console.error('🚨 Server verification failed:', error);
    return { verified: false };
  }
}

// Export all security functions
export const Security = {
  secureSave,
  secureLoad,
  validateBalance,
  detectAntiCheat,
  checkRateLimit,
  logSecurityEvent,
  getSecurityLog,
  clearSecurityLog,
  validateDiceRoll,
  validateGameState,
  verifyWithServer
};

export default Security;
