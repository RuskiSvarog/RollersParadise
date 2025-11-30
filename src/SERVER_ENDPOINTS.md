# 🔒 SERVER-SIDE SECURITY ENDPOINTS

This document describes the server-side validation endpoints that must be implemented to ensure complete security.

---

## ⚠️ CRITICAL: CLIENT-SIDE ALONE IS NOT ENOUGH!

The client-side security (encryption, checksums, anti-cheat) is **LAYER 1** protection.

**LAYER 2** (server-side validation) is **MANDATORY** for production use!

---

## 🛡️ REQUIRED ENDPOINTS

### **1. `/sync-balance` - Balance Synchronization**

**Purpose:** Sync client balance to server and detect mismatches

**Method:** `POST`

**Request:**
```json
{
  "email": "player@example.com",
  "balance": 1500.50
}
```

**Response (Success):**
```json
{
  "success": true,
  "serverBalance": 1500.50,
  "synced": true,
  "timestamp": 1732734567890
}
```

**Response (Mismatch):**
```json
{
  "success": false,
  "serverBalance": 1200.00,
  "clientBalance": 1500.50,
  "mismatch": true,
  "correctedBalance": 1200.00,
  "message": "Balance corrected to server value",
  "flagged": true
}
```

**Implementation:**
```typescript
// Supabase Edge Function
import { createClient } from '@supabase/supabase-js';

export async function syncBalance(req: Request) {
  const { email, balance } = await req.json();
  
  // Get server balance from database
  const { data: player } = await supabase
    .from('players')
    .select('balance')
    .eq('email', email)
    .single();
  
  const serverBalance = player?.balance || 0;
  
  // Check for mismatch (allow 0.01 tolerance for floating point)
  if (Math.abs(serverBalance - balance) > 0.01) {
    // Log security event
    await supabase.from('security_logs').insert({
      event_type: 'BALANCE_MISMATCH',
      email,
      client_balance: balance,
      server_balance: serverBalance,
      timestamp: new Date().toISOString()
    });
    
    // Flag account for review
    await supabase
      .from('players')
      .update({ flagged: true, flag_reason: 'Balance mismatch' })
      .eq('email', email);
    
    return {
      success: false,
      serverBalance,
      clientBalance: balance,
      mismatch: true,
      correctedBalance: serverBalance,
      flagged: true
    };
  }
  
  // Update server balance
  await supabase
    .from('players')
    .update({ balance, last_sync: new Date().toISOString() })
    .eq('email', email);
  
  return {
    success: true,
    serverBalance: balance,
    synced: true,
    timestamp: Date.now()
  };
}
```

---

### **2. `/validate-balance` - Balance Validation**

**Purpose:** Validate current balance without syncing

**Method:** `POST`

**Request:**
```json
{
  "email": "player@example.com",
  "localBalance": 1500.50
}
```

**Response:**
```json
{
  "valid": true,
  "serverBalance": 1500.50,
  "match": true
}
```

**Implementation:**
```typescript
export async function validateBalance(req: Request) {
  const { email, localBalance } = await req.json();
  
  const { data: player } = await supabase
    .from('players')
    .select('balance')
    .eq('email', email)
    .single();
  
  const serverBalance = player?.balance || 0;
  const valid = Math.abs(serverBalance - localBalance) <= 0.01;
  
  if (!valid) {
    await supabase.from('security_logs').insert({
      event_type: 'BALANCE_VALIDATION_FAILED',
      email,
      local_balance: localBalance,
      server_balance: serverBalance
    });
  }
  
  return {
    valid,
    serverBalance,
    match: valid
  };
}
```

---

### **3. `/validate-roll` - Dice Roll Validation**

**Purpose:** Validate dice roll came from secure RNG

**Method:** `POST`

**Request:**
```json
{
  "email": "player@example.com",
  "sessionId": "abc123",
  "dice1": 4,
  "dice2": 3,
  "timestamp": 1732734567890,
  "signature": "hash_of_roll_data"
}
```

**Response (Valid):**
```json
{
  "valid": true,
  "verified": true
}
```

**Response (Invalid):**
```json
{
  "valid": false,
  "reason": "Invalid dice values",
  "flagged": true
}
```

**Implementation:**
```typescript
export async function validateRoll(req: Request) {
  const { email, dice1, dice2, timestamp, signature } = await req.json();
  
  // Validate dice values
  if (dice1 < 1 || dice1 > 6 || dice2 < 1 || dice2 > 6) {
    await supabase.from('security_logs').insert({
      event_type: 'INVALID_DICE_VALUES',
      email,
      dice1,
      dice2
    });
    
    return { valid: false, reason: 'Invalid dice values', flagged: true };
  }
  
  // Validate timestamp (must be recent)
  const now = Date.now();
  if (Math.abs(now - timestamp) > 10000) {
    return { valid: false, reason: 'Timestamp too old or in future' };
  }
  
  // Verify signature (implement your own crypto verification)
  // const expectedSignature = generateSignature(dice1, dice2, timestamp, SECRET_KEY);
  // if (signature !== expectedSignature) {
  //   return { valid: false, reason: 'Invalid signature' };
  // }
  
  // Log valid roll
  await supabase.from('rolls').insert({
    email,
    dice1,
    dice2,
    total: dice1 + dice2,
    timestamp: new Date(timestamp).toISOString()
  });
  
  return { valid: true, verified: true };
}
```

---

### **4. `/update-balance` - Balance Update (After Win/Loss)**

**Purpose:** Update balance after game result

**Method:** `POST`

**Request:**
```json
{
  "email": "player@example.com",
  "previousBalance": 1000.00,
  "newBalance": 1150.00,
  "change": 150.00,
  "reason": "Won $150 on Pass Line",
  "rollId": "roll_123456"
}
```

**Response:**
```json
{
  "success": true,
  "balance": 1150.00,
  "verified": true
}
```

**Implementation:**
```typescript
export async function updateBalance(req: Request) {
  const { email, previousBalance, newBalance, change, reason, rollId } = await req.json();
  
  // Get current server balance
  const { data: player } = await supabase
    .from('players')
    .select('balance')
    .eq('email', email)
    .single();
  
  // Verify previous balance matches
  if (Math.abs(player.balance - previousBalance) > 0.01) {
    return {
      success: false,
      error: 'Balance mismatch',
      serverBalance: player.balance
    };
  }
  
  // Validate change is reasonable (max bet * max odds)
  const MAX_SINGLE_WIN = 10000; // $10,000
  if (Math.abs(change) > MAX_SINGLE_WIN) {
    await supabase.from('security_logs').insert({
      event_type: 'SUSPICIOUS_BALANCE_CHANGE',
      email,
      change,
      reason
    });
    
    return { success: false, error: 'Change exceeds maximum' };
  }
  
  // Update balance
  const updatedBalance = previousBalance + change;
  await supabase
    .from('players')
    .update({ balance: updatedBalance })
    .eq('email', email);
  
  // Log transaction
  await supabase.from('transactions').insert({
    email,
    previous_balance: previousBalance,
    new_balance: updatedBalance,
    change,
    reason,
    roll_id: rollId,
    timestamp: new Date().toISOString()
  });
  
  return {
    success: true,
    balance: updatedBalance,
    verified: true
  };
}
```

---

### **5. `/report-security-event` - Security Event Logging**

**Purpose:** Log security events from client to server

**Method:** `POST`

**Request:**
```json
{
  "eventType": "TAMPERING_DETECTED",
  "email": "player@example.com",
  "data": {
    "key": "rollers-paradise-save-player@example.com",
    "timestamp": 1732734567890
  },
  "userAgent": "Mozilla/5.0...",
  "sessionId": "abc123"
}
```

**Response:**
```json
{
  "logged": true,
  "eventId": "event_789012"
}
```

**Implementation:**
```typescript
export async function reportSecurityEvent(req: Request) {
  const { eventType, email, data, userAgent, sessionId } = await req.json();
  
  // Insert to security log
  const { data: event } = await supabase
    .from('security_logs')
    .insert({
      event_type: eventType,
      email,
      event_data: data,
      user_agent: userAgent,
      session_id: sessionId,
      timestamp: new Date().toISOString()
    })
    .select()
    .single();
  
  // Check for critical events
  const criticalEvents = ['TAMPERING_DETECTED', 'ANTI_CHEAT_TRIGGERED'];
  if (criticalEvents.includes(eventType)) {
    // Flag account
    await supabase
      .from('players')
      .update({ 
        flagged: true, 
        flag_reason: eventType 
      })
      .eq('email', email);
    
    // Send alert to admin (implement your notification system)
    // await sendAdminAlert(eventType, email, data);
  }
  
  return {
    logged: true,
    eventId: event.id
  };
}
```

---

## 📊 DATABASE SCHEMA

### **`players` Table**
```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  balance DECIMAL(10, 2) DEFAULT 1000.00,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  last_sync TIMESTAMP,
  flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  banned BOOLEAN DEFAULT FALSE
);
```

### **`security_logs` Table**
```sql
CREATE TABLE security_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  email TEXT,
  event_data JSONB,
  user_agent TEXT,
  session_id TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_security_logs_email ON security_logs(email);
CREATE INDEX idx_security_logs_type ON security_logs(event_type);
CREATE INDEX idx_security_logs_timestamp ON security_logs(timestamp DESC);
```

### **`rolls` Table**
```sql
CREATE TABLE rolls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  dice1 INTEGER NOT NULL,
  dice2 INTEGER NOT NULL,
  total INTEGER NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rolls_email ON rolls(email);
CREATE INDEX idx_rolls_timestamp ON rolls(timestamp DESC);
```

### **`transactions` Table**
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  previous_balance DECIMAL(10, 2) NOT NULL,
  new_balance DECIMAL(10, 2) NOT NULL,
  change DECIMAL(10, 2) NOT NULL,
  reason TEXT,
  roll_id UUID,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_email ON transactions(email);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp DESC);
```

---

## 🔐 SECURITY BEST PRACTICES

### **1. Rate Limiting**
Implement rate limiting on ALL endpoints:
```typescript
const rateLimit = {
  '/sync-balance': { maxRequests: 120, window: 60000 }, // 120/min
  '/validate-roll': { maxRequests: 120, window: 60000 }, // 120/min
  '/update-balance': { maxRequests: 120, window: 60000 }  // 120/min
};
```

### **2. Authentication**
ALL endpoints must verify authentication:
```typescript
const token = req.headers.get('Authorization')?.replace('Bearer ', '');
const { data: { user } } = await supabase.auth.getUser(token);

if (!user) {
  return new Response('Unauthorized', { status: 401 });
}
```

### **3. Input Validation**
Validate ALL inputs:
```typescript
function validateBalance(balance: any): boolean {
  return (
    typeof balance === 'number' &&
    !isNaN(balance) &&
    balance >= 0 &&
    balance <= 10000000 &&
    Number.isFinite(balance)
  );
}
```

### **4. Audit Logging**
Log ALL sensitive operations:
```typescript
await supabase.from('audit_log').insert({
  action: 'BALANCE_UPDATED',
  email,
  old_value: previousBalance,
  new_value: newBalance,
  timestamp: new Date().toISOString()
});
```

---

## 🚨 MONITORING & ALERTS

Set up alerts for:

| Event | Threshold | Action |
|-------|-----------|--------|
| Balance mismatches | >5/day | Investigate account |
| Invalid dice rolls | >3/day | Flag account |
| Suspicious changes | >$10K single win | Manual review |
| Tampering detected | >1/week | Ban account |
| Rate limit exceeded | >50/day | Temporary ban |

---

## 🧪 TESTING

### **Test Balance Sync**
```bash
curl -X POST https://your-server.com/sync-balance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "email": "test@example.com",
    "balance": 1500.50
  }'
```

### **Test Roll Validation**
```bash
curl -X POST https://your-server.com/validate-roll \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "email": "test@example.com",
    "dice1": 4,
    "dice2": 3,
    "timestamp": 1732734567890
  }'
```

---

## 📝 DEPLOYMENT CHECKLIST

Before going live:

- [ ] All endpoints implemented and tested
- [ ] Database tables created with indexes
- [ ] Rate limiting configured
- [ ] Authentication enabled
- [ ] Input validation added
- [ ] Audit logging enabled
- [ ] Monitoring/alerts set up
- [ ] Load testing completed
- [ ] Security audit performed
- [ ] Backup/recovery tested

---

## 🔗 INTEGRATION

Update client-side code to call these endpoints:

```typescript
// In /utils/security.ts
export async function verifyWithServer(action: string, data: any): Promise<{ verified: boolean; serverData?: any }> {
  try {
    const response = await fetch(`https://your-server.com/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getUserToken()}`
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    return { verified: result.success, serverData: result };
  } catch (error) {
    console.error('Server verification failed:', error);
    return { verified: false };
  }
}
```

---

**Last Updated:** November 27, 2024  
**Version:** 1.0  
**Status:** READY FOR IMPLEMENTATION
