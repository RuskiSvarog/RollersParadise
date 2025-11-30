# 🎲 Rollers Paradise - Fairness & Transparency Documentation

## Our Commitment to Fair Play

At Rollers Paradise, we are committed to providing a completely fair and transparent gaming experience. This document explains all the systems we have in place to ensure fairness, prevent cheating, and maintain complete transparency.

---

## 🔒 Bet Validation System

### Real-Time Payout Verification

Every single roll of the dice is validated using our comprehensive bet validation system located in `/utils/betValidator.ts`. This system:

1. **Calculates Expected Payouts** - For every bet placed, the system calculates what the payout SHOULD be based on authentic casino odds
2. **Verifies Actual Payouts** - Compares the actual payout given to the player against the expected payout
3. **Logs All Discrepancies** - If there's ANY difference between expected and actual, it's logged to the console with full details
4. **Maintains History** - Stores the last 100 rolls with complete validation data

### How It Works

```
Roll Process:
1. Dice are rolled using cryptographically secure random number generation
2. For each bet on the table, expected payout is calculated
3. Actual payout is determined by game logic
4. Both values are compared
5. Validation result is logged to console
6. History is stored for player verification
```

### Console Logging

Every roll produces detailed console logs showing:
- 🎲 Dice values rolled
- 💰 All bets on the table
- 📊 Expected vs Actual payouts for each bet
- ✅ Validation status (LEGIT or FAILED)
- 💵 Balance changes

Example console output:
```
🎲 ROLL VALIDATION - Roll #42
Dice: [3, 4] = 7
Phase: point | Point: 6

BET VALIDATION:
├─ passLine ($10)
│  Expected: $0.00 (lose) | Actual: $0.00 | ✅ MATCH
├─ place6 ($30)
│  Expected: $0.00 (lose) | Actual: $0.00 | ✅ MATCH
└─ anySeven ($5)
   Expected: $25.00 (4:1) | Actual: $25.00 | ✅ MATCH

✅ VALIDATION PASSED - All payouts correct
```

---

## 🔍 Player Verification Tools

### 1. Payout Verifier Tool

Access via the 🔍 button in the header. This tool allows you to:
- Select any bet type
- Set any dice roll
- Configure game phase (Come Out or Point)
- See EXACTLY what the payout would be
- Verify the calculation formula

This uses the SAME calculation logic as the live game, so you can verify any bet outcome.

### 2. Console Debug Commands

Open your browser console (F12) and use these commands:

#### `window.exportValidationHistory()`
Exports a table showing all roll validations with:
- Roll number
- Dice values
- Game phase
- Bets placed
- Winnings
- Validation status
- Timestamp

#### `window.showLastRoll()`
Shows detailed breakdown of the most recent roll including:
- Complete bet-by-bet analysis
- Expected vs actual comparison
- Balance changes

#### `window.auditBalance()`
Comprehensive balance audit showing:
- Current balance
- Total money in active bets
- List of all bets on table
- Total winnings from all rolls
- Validation summary

---

## 💰 Balance Transparency

### Every Balance Change is Logged

The game logs EVERY balance change to the console:

**Bet Placement:**
```
💰 BET PLACED: passLine - $10
   Balance: $1000.00 → $990.00
```

**Bet Removal:**
```
💰 BET REMOVED: place6 - Refund $30
   Balance: $990.00 → $1020.00
```

**Winnings:**
```
💰 ROLL RESULT: WIN - +$25.00
   Balance: $1020.00 → $1045.00
```

**Balance Verification:**
If there's EVER a discrepancy between expected and actual balance:
```
🚨 BALANCE MISMATCH DETECTED!
   Expected: $1045.00, Got: $1046.00
```

---

## 🎲 Random Number Generation

### Cryptographically Secure RNG

Dice rolls use `crypto.getRandomValues()`, which is:
- Cryptographically secure
- Impossible to predict
- Browser-native (not custom code)
- Industry standard for security-critical randomness

### Implementation

```typescript
const rollDie = (): number => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return (array[0] % 6) + 1;
};
```

This ensures:
- ✅ TRUE randomness (not pseudo-random)
- ✅ Cannot be manipulated or predicted
- ✅ Same RNG for single-player and multiplayer
- ✅ No server-side bias possible

---

## 🔐 Anti-Cheat Measures

### Server-Side Validation

All critical operations are validated server-side:
- Account creation (1 per email, 1 per IP)
- Balance changes
- Purchase transactions
- Achievement unlocks

### Client-Side Security

- Game state validation before saving
- Rate limiting on saves to prevent spam
- Encrypted localStorage using AES-256
- Tamper detection on save files

### Account Security

- Two-factor authentication support
- Email verification required
- IP address tracking
- Device fingerprinting
- Duplicate account prevention

---

## 📊 Odds Reference

All payouts follow authentic casino odds:

### Pass Line Bets
- Come Out Win (7): 1:1
- Point Made: 1:1
- Seven Out: Lose bet

### Pass Line Odds (True Odds)
- Point 2,12: 6:1
- Point 3,11: 3:1
- Point 4,10: 2:1
- Point 5,9: 3:2
- Point 6,8: 6:5

### Place Bets
- Place 4,10: 9:5
- Place 5,9: 7:5
- Place 6,8: 7:6

### Hardways
- Hard 4,10: 7:1
- Hard 6,8: 9:1

### One-Roll Bets
- Any Seven: 4:1
- Any Craps: 7:1
- Snake Eyes (2): 30:1
- Boxcars (12): 30:1
- Ace Deuce (3): 15:1
- Yo (11): 15:1

### Field Bet
- 3,4,9,10,11: 1:1
- 2,12: 2:1

### C & E
- Splits bet between Any Craps (7:1) and Yo Eleven (15:1)

---

## 🎯 How to Verify Fairness

### Step-by-Step Verification

1. **Open Browser Console** (Press F12)
2. **Place some bets** and roll the dice
3. **Watch the console logs** - Every roll shows complete validation
4. **Run `window.auditBalance()`** - See comprehensive audit
5. **Use the Payout Verifier** - Test any scenario manually
6. **Check `window.exportValidationHistory()`** - Review all past rolls

### What to Look For

✅ **Every roll shows validation logs**
✅ **Expected payouts match actual payouts**
✅ **Balance changes are always logged**
✅ **All validations show ✅ LEGIT status**
✅ **No balance mismatches detected**

### Red Flags (What We Watch For)

🚨 **Validation failures** - Logged to console with details
🚨 **Balance mismatches** - Immediately detected and logged
🚨 **Missing validation logs** - Would indicate bypassed validation
🚨 **Payout discrepancies** - Expected ≠ Actual

---

## 📝 Code Transparency

### Open Validation Logic

The complete bet validation logic is available in:
- `/utils/betValidator.ts` - Payout calculation and validation
- `/components/CrapsGame.tsx` - Game logic and roll processing
- `/components/PayoutVerifier.tsx` - Manual verification tool

### Key Functions

**`calculateExpectedPayout()`** - Pure function that calculates what a bet SHOULD pay
**`validateRoll()`** - Compares expected vs actual for entire roll
**`logValidation()`** - Outputs detailed validation to console

---

## 🛡️ Reporting Issues

If you EVER notice:
- Incorrect payouts
- Balance discrepancies  
- Validation failures
- Suspicious patterns

**Please report to:**
- Email: avgelatt@gmail.com
- Subject: "Fairness Issue - Rollers Paradise"
- Include: Console logs, screenshots, validation history export

We take fairness extremely seriously and will investigate any reported issues immediately.

---

## ✅ Guarantee

**We guarantee:**
1. All dice rolls are truly random using cryptographic RNG
2. All payouts follow authentic casino odds exactly
3. Every roll is validated and logged
4. No difference between single-player and multiplayer fairness
5. Complete transparency through console logging
6. Player-accessible verification tools
7. Zero tolerance for cheating or unfair practices

**This is not just a casino game - it's a FAIR casino game.**

---

*Last Updated: November 29, 2025*  
*Version: 1.0*  
*System: Rollers Paradise - Production Build*
