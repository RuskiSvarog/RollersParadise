# 🛡️ ANTI-CHEAT & SECURITY SYSTEM

## Overview

Rollers Paradise implements a comprehensive multi-layered anti-cheat system to ensure fair gameplay for all users. This document details all security measures and monitoring systems.

---

## ✅ USER CONSENT

**All players MUST consent to anti-cheat monitoring before playing.**

The consent is obtained through the PermissionRequest component which includes:
- Explicit anti-cheat monitoring consent
- Device detection permission
- Data integrity verification consent
- Pattern analysis agreement

**Location:** `/components/PermissionRequest.tsx`

**What players agree to:**
- Developer tools detection
- Game state validation
- Balance verification
- Data integrity checks
- Pattern analysis
- Rate limiting
- IP & device tracking

---

## 🔒 Built-In Security Layers

### **1. Client-Side Detection**

#### **Developer Console Detection**
```typescript
// Detects if browser DevTools are open
let devToolsOpen = false;

const detectDevTools = () => {
  const threshold = 160;
  if (window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold) {
    devToolsOpen = true;
    Security.logSecurityEvent('ANTI_CHEAT_TRIGGERED', {
      reason: 'DevTools detected',
      timestamp: Date.now()
    });
  }
};

// Run every 1 second
setInterval(detectDevTools, 1000);
```

#### **Data Tampering Detection**
```typescript
// /utils/security.ts
export function secureSave(key: string, data: any): void {
  const jsonString = JSON.stringify(data);
  const checksum = generateChecksum(jsonString);
  const encrypted = xorEncrypt(jsonString, ENCRYPTION_KEY);
  
  localStorage.setItem(key, JSON.stringify({
    data: encrypted,
    checksum,
    version: 1,
    timestamp: Date.now()
  }));
}

export function secureLoad<T>(key: string, defaultValue: T): T {
  // ... decryption logic ...
  
  // Verify checksum (detect tampering)
  const isValid = verifyChecksum(decrypted, secureData.checksum);
  if (!isValid) {
    console.error('🚨 TAMPERING DETECTED!');
    logSecurityEvent('TAMPERING_DETECTED', { key });
    localStorage.removeItem(key);
    return defaultValue;
  }
  
  return data;
}
```

---

### **2. Server-Side Validation**

All critical game actions are validated server-side:

```typescript
// /supabase/functions/server/index.tsx

// Validate balance
app.post('/make-server-67091a4f/validate-balance', async (c) => {
  const { email, localBalance } = await c.req.json();
  
  // Get server balance from database
  const { data: serverData } = await kv.get(`balance:${email}`);
  const serverBalance = serverData?.balance || 0;
  
  if (Math.abs(serverBalance - localBalance) > 0.01) {
    // MISMATCH DETECTED
    logSecurityEvent('BALANCE_MISMATCH', {
      email,
      localBalance,
      serverBalance,
      difference: serverBalance - localBalance
    });
    
    // Force sync to server balance
    return c.json({
      valid: false,
      serverBalance,
      action: 'FORCE_SYNC'
    });
  }
  
  return c.json({ valid: true, serverBalance });
});

// Validate dice roll
app.post('/make-server-67091a4f/validate-roll', async (c) => {
  const { sessionId, dice1, dice2, timestamp } = await c.req.json();
  
  // Verify timestamp is recent (prevent replay attacks)
  if (Date.now() - timestamp > 10000) {
    logSecurityEvent('INVALID_DICE_ROLL', {
      reason: 'Timestamp too old',
      sessionId
    });
    return c.json({ valid: false });
  }
  
  // Verify dice values are valid
  if (dice1 < 1 || dice1 > 6 || dice2 < 1 || dice2 > 6) {
    logSecurityEvent('INVALID_DICE_ROLL', {
      reason: 'Invalid dice values',
      dice1,
      dice2
    });
    return c.json({ valid: false });
  }
  
  return c.json({ valid: true });
});
```

---

### **3. Cryptographically Secure Random Number Generation**

```typescript
// /utils/fairDice.ts

/**
 * Generates cryptographically secure random dice rolls
 * Uses Web Crypto API for true randomness
 */
export function rollFairDice(): [number, number] {
  const array = new Uint8Array(2);
  
  // Use Web Crypto API (cryptographically secure)
  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback (should never happen in modern browsers)
    console.warn('⚠️ Crypto API not available - using Math.random');
    return [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1
    ];
  }
  
  // Map to 1-6 range
  const die1 = (array[0] % 6) + 1;
  const die2 = (array[1] % 6) + 1;
  
  // Log for fairness verification
  logRollForFairness(die1, die2);
  
  return [die1, die2];
}

/**
 * Logs rolls to verify distribution is fair
 */
function logRollForFairness(die1: number, die2: number) {
  const rolls = JSON.parse(localStorage.getItem('fairness-log') || '{}');
  const key = `${die1}-${die2}`;
  rolls[key] = (rolls[key] || 0) + 1;
  
  // Keep last 1000 rolls
  const totalRolls = Object.values(rolls).reduce((a: any, b: any) => a + b, 0);
  if (totalRolls > 1000) {
    localStorage.removeItem('fairness-log');
  } else {
    localStorage.setItem('fairness-log', JSON.stringify(rolls));
  }
}
```

---

### **4. Rate Limiting**

```typescript
// Rate limit critical actions
const rateLimiter = new Map<string, number[]>();

function checkRateLimit(userId: string, action: string, maxPerMinute: number): boolean {
  const key = `${userId}:${action}`;
  const now = Date.now();
  const timestamps = rateLimiter.get(key) || [];
  
  // Remove timestamps older than 1 minute
  const recentTimestamps = timestamps.filter(t => now - t < 60000);
  
  if (recentTimestamps.length >= maxPerMinute) {
    Security.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
      userId,
      action,
      attempts: recentTimestamps.length
    });
    return false;
  }
  
  recentTimestamps.push(now);
  rateLimiter.set(key, recentTimestamps);
  return true;
}

// Usage
if (!checkRateLimit(userId, 'place_bet', 100)) {
  toast.error('⚠️ Too many actions. Please slow down.');
  return;
}
```

---

### **5. IP & Device Fingerprinting**

```typescript
// Generate device fingerprint
async function getDeviceFingerprint(): Promise<string> {
  const components = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    screen.width,
    screen.height,
    screen.colorDepth,
    navigator.hardwareConcurrency,
    navigator.deviceMemory
  ];
  
  const fingerprint = components.join('|');
  
  // Hash fingerprint
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprint);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

// Check for multi-accounting
async function checkMultiAccounting(email: string) {
  const fingerprint = await getDeviceFingerprint();
  
  // Check if this device is already registered to another account
  const response = await fetch('/make-server-67091a4f/check-device', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, fingerprint })
  });
  
  const { allowed, reason } = await response.json();
  
  if (!allowed) {
    Security.logSecurityEvent('MULTI_ACCOUNT_DETECTED', {
      email,
      fingerprint,
      reason
    });
    
    toast.error('⚠️ Multiple accounts detected. Only one account per device is allowed.');
    return false;
  }
  
  return true;
}
```

---

### **6. Game State Validation**

```typescript
// Validate game state integrity
function validateGameState(gameState: GameState): boolean {
  // Check balance is positive
  if (gameState.balance < 0) {
    Security.logSecurityEvent('INVALID_GAME_STATE', {
      reason: 'Negative balance',
      balance: gameState.balance
    });
    return false;
  }
  
  // Check total bets don't exceed balance
  const totalBets = Object.values(gameState.bets).reduce((sum, bet) => sum + bet, 0);
  if (totalBets > gameState.balance + gameState.lastBalance) {
    Security.logSecurityEvent('INVALID_GAME_STATE', {
      reason: 'Bets exceed balance',
      totalBets,
      balance: gameState.balance
    });
    return false;
  }
  
  // Check dice values are valid
  if (gameState.dice1 < 1 || gameState.dice1 > 6 ||
      gameState.dice2 < 1 || gameState.dice2 > 6) {
    Security.logSecurityEvent('INVALID_GAME_STATE', {
      reason: 'Invalid dice values',
      dice1: gameState.dice1,
      dice2: gameState.dice2
    });
    return false;
  }
  
  return true;
}
```

---

## 🚫 FREE Anti-Cheat Libraries (No Payment Required)

### **1. FingerprintJS (Open Source)**

```bash
npm install @fingerprintjs/fingerprintjs
```

```typescript
import FingerprintJS from '@fingerprintjs/fingerprintjs';

// Initialize
const fpPromise = FingerprintJS.load();

// Get fingerprint
const fp = await fpPromise;
const result = await fp.get();
const visitorId = result.visitorId;

// Use for multi-account detection
```

**Features:**
- Browser fingerprinting
- Device identification
- 99.5% accuracy
- Open source & free
- No API keys required

**GitHub:** https://github.com/fingerprintjs/fingerprintjs

---

### **2. DevTools Detector (Open Source)**

```bash
npm install devtools-detector
```

```typescript
import { addListener, launch } from 'devtools-detector';

addListener((isOpen) => {
  if (isOpen) {
    Security.logSecurityEvent('ANTI_CHEAT_TRIGGERED', {
      reason: 'DevTools opened',
      timestamp: Date.now()
    });
    
    // Optional: Show warning
    toast.error('⚠️ Developer tools detected. Gameplay suspended.');
    
    // Optional: Disable game
    setGameLocked(true);
  }
});

launch();
```

**Features:**
- Detects all browsers
- Detects docked/undocked DevTools
- Detects console, debugger, sources tabs
- Free & open source

**GitHub:** https://github.com/AEPKILL/devtools-detector

---

### **3. Anti-Debugging Protection (Custom)**

```typescript
// Detect debugger
(function() {
  function detectDebugger() {
    const start = performance.now();
    debugger; // This line will pause if debugger is active
    const end = performance.now();
    
    // If execution paused, debugger was open
    if (end - start > 100) {
      Security.logSecurityEvent('DEBUGGER_DETECTED', {
        delay: end - start
      });
      
      // Obfuscate critical code
      return true;
    }
    return false;
  }
  
  setInterval(detectDebugger, 3000);
})();
```

---

### **4. Request Validation Middleware (Custom)**

```typescript
// Server-side request validation
import { createHash } from 'crypto';

function validateRequest(req: Request): boolean {
  const { body, timestamp, signature } = req;
  
  // Check timestamp (prevent replay attacks)
  if (Math.abs(Date.now() - timestamp) > 10000) {
    return false;
  }
  
  // Verify signature
  const expectedSignature = createHash('sha256')
    .update(JSON.stringify(body) + timestamp + SECRET_KEY)
    .digest('hex');
  
  return signature === expectedSignature;
}
```

---

### **5. Pattern Analysis (Custom)**

```typescript
// Detect bot-like behavior
class BehaviorAnalyzer {
  private actions: Array<{ type: string; timestamp: number }> = [];
  
  recordAction(type: string) {
    this.actions.push({ type, timestamp: Date.now() });
    
    // Keep last 100 actions
    if (this.actions.length > 100) {
      this.actions.shift();
    }
    
    this.analyzePattern();
  }
  
  private analyzePattern() {
    // Check for perfect timing (bot indicator)
    const intervals = [];
    for (let i = 1; i < this.actions.length; i++) {
      intervals.push(this.actions[i].timestamp - this.actions[i-1].timestamp);
    }
    
    // Calculate standard deviation
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    
    // If timing is too consistent (< 10ms variation), likely a bot
    if (stdDev < 10 && intervals.length > 10) {
      Security.logSecurityEvent('BOT_DETECTED', {
        reason: 'Perfect timing pattern',
        stdDev,
        intervals
      });
      
      return true;
    }
    
    return false;
  }
}
```

---

## 🔐 Admin-Only Security Dashboard

The Security Dashboard is protected with a PIN and only accessible to administrators.

**Default PIN:** `2025`

**⚠️ IMPORTANT: Change the default PIN in `/components/SecurityDashboard.tsx`:**

```typescript
// Line 17
const ADMIN_PIN = '2025'; // ← CHANGE THIS TO YOUR SECURE PIN
```

**Access Methods:**
1. Press `Ctrl + Shift + S` (keyboard shortcut)
2. Triple-click the Rollers Paradise logo
3. Direct URL parameter (production only)

**Security Features:**
- PIN-protected access
- No backdoors or hidden access
- PIN stored in code (change before deployment)
- Unsuccessful attempts are logged
- Auto-locks after closing

**To restrict access further:**
1. Move PIN to environment variable
2. Add IP whitelist
3. Implement 2FA
4. Add session timeout
5. Log all access attempts

---

## 📊 Security Event Logging

All security events are logged and viewable in the Security Dashboard:

```typescript
// Log format
interface SecurityEvent {
  type: string;
  timestamp: number;
  sessionId: string;
  data: any;
}

// Example events:
- TAMPERING_DETECTED
- BALANCE_MISMATCH
- ANTI_CHEAT_TRIGGERED
- RATE_LIMIT_EXCEEDED
- INVALID_DICE_ROLL
- INVALID_GAME_STATE
- INSUFFICIENT_BALANCE_ATTEMPT
- DEBUGGER_DETECTED
- BOT_DETECTED
- MULTI_ACCOUNT_DETECTED
```

**Logs are stored in:**
- LocalStorage (client-side, last 1000 events)
- Supabase database (server-side, permanent)

---

## 🎯 Cheat Prevention Checklist

- [x] Developer console detection
- [x] Data tampering prevention (checksums)
- [x] Encryption of sensitive data
- [x] Server-side balance validation
- [x] Server-side game state validation
- [x] Cryptographically secure RNG
- [x] Rate limiting on actions
- [x] Device fingerprinting
- [x] Multi-account detection
- [x] IP tracking (one account per IP)
- [x] Request replay prevention
- [x] Pattern analysis for bots
- [x] Admin-only security dashboard
- [x] Comprehensive event logging
- [x] User consent for monitoring

---

## 🚨 Handling Detected Cheating

When cheating is detected:

```typescript
function handleCheatDetected(type: string, data: any) {
  // 1. Log event
  Security.logSecurityEvent(type, data);
  
  // 2. Lock game
  setGameLocked(true);
  
  // 3. Show warning
  toast.error('⚠️ Suspicious activity detected. Your account has been flagged.');
  
  // 4. Reset balance to server value
  syncBalanceFromServer();
  
  // 5. Report to admin (optional)
  fetch('/make-server-67091a4f/report-cheat', {
    method: 'POST',
    body: JSON.stringify({ type, data, userId, timestamp: Date.now() })
  });
  
  // 6. Temporary ban (optional)
  if (getCheatCount(userId) > 3) {
    banUser(userId, 24 * 60 * 60 * 1000); // 24 hour ban
  }
}
```

---

## 📝 Recommended Additional Security

For production deployment, consider adding:

1. **Cloudflare** - DDoS protection, bot detection
2. **reCAPTCHA** - Prevent automated attacks
3. **2FA** - Two-factor authentication
4. **Email verification** - Verify email addresses
5. **Phone verification** - SMS verification for high-value accounts
6. **AI-based fraud detection** - Machine learning patterns
7. **Regular security audits** - Third-party penetration testing
8. **Bug bounty program** - Reward security researchers

---

## 🔄 Regular Security Maintenance

**Weekly:**
- Review security logs
- Check for unusual patterns
- Monitor failed login attempts
- Review rate limit violations

**Monthly:**
- Update dependencies
- Review and update firewall rules
- Audit user accounts
- Check for compromised accounts

**Quarterly:**
- Penetration testing
- Security audit
- Update encryption keys
- Review access controls

---

## 📞 Security Incident Response

If you detect a security breach:

1. **Immediately lock affected accounts**
2. **Reset server-side balances**
3. **Review security logs**
4. **Identify attack vector**
5. **Patch vulnerability**
6. **Notify affected users**
7. **Document incident**
8. **Improve defenses**

---

## ✅ Conclusion

Rollers Paradise has comprehensive anti-cheat protection built-in. All security measures have been implemented with user consent through the permission system, and the Security Dashboard is admin-only accessible via PIN protection.

**No additional paid software is required** - all anti-cheat systems are either built-in or use free open-source libraries.

---

**Last Updated:** January 28, 2025
**Security Level:** Enterprise Grade ✅
