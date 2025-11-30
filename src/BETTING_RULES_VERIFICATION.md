# Crapless Craps Betting Rules - Comprehensive Verification

## ✅ VERIFIED RULES (All Correctly Implemented)

### 1. PASS LINE BET
**Rules:**
- Come-out roll: Only 7 wins (pays 1:1). All other numbers (2,3,4,5,6,8,9,10,11,12) become the point.
- Point phase: If point is rolled again, wins 1:1. If 7 is rolled, loses.
- Cannot be removed after point is established.

**Implementation Status:** ✅ CORRECT
- Line 758-793: Come-out roll logic correct
- Line 852-891: Point phase logic correct  
- Line 473-476: Removal restriction correct

---

### 2. PASS LINE ODDS
**Rules:**
- Can only be placed during point phase (after point is established).
- Pays true odds based on point number.
- Can be removed at any time.
- Maximum odds limits based on point difficulty.

**True Odds:**
- Point 2 or 12: 6:1
- Point 3 or 11: 3:1
- Point 4 or 10: 2:1
- Point 5 or 9: 3:2
- Point 6 or 8: 6:5

**Implementation Status:** ✅ CORRECT
- Line 867-872: Pays correct true odds via getOddsMultiplier()
- Line 1384-1404: getOddsMultiplier() returns correct odds
- Line 405-416: Maximum odds validation correct

---

### 3. COME BET (Crapless Craps Rules)
**Rules:**
- Functions like pass line but can be made any time.
- In COME area: 7 wins and pays 1:1. All other numbers (2,3,4,5,6,8,9,10,11,12) travel to that number.
- On a number: If that number is rolled, wins 1:1. If 7 is rolled, loses.
- **CRAPLESS RULE**: 2, 3, 11, and 12 become come points (do NOT lose like in regular craps).

**Implementation Status:** ✅ CORRECT
- Line 1128-1154: Come bet travels correctly
- Line 1130-1142: 7 wins, 11 travels (crapless rule)
- Line 1143-1147: 2,3,12 travel (crapless rule) 
- Line 1157-1203: Come bet on number wins/loses correctly
- Line 484-491: Cannot remove come bets that have traveled

---

### 4. COME ODDS
**Rules:**
- Can only be placed on come bets that have traveled to a number.
- Pays true odds (same as pass line odds).
- Can be removed at any time.

**Implementation Status:** ✅ CORRECT
- Line 1166-1193: Pays correct true odds when come point hits
- Line 1206-1225: Come odds travel with come bet

---

### 5. FIELD BET (One-Roll)
**Rules:**
- Wins on 2, 3, 4, 9, 10, 11, 12.
- Loses on 5, 6, 7, 8.
- 2 and 12 pay 3:1 (2:1 winnings + original bet).
- 3, 4, 9, 10, 11 pay 2:1 (1:1 winnings + original bet).
- Cleared after every roll (one-roll bet).

**Implementation Status:** ✅ CORRECT
- Line 987-998: Win numbers and payouts correct
- Bet is not added to betsToKeep (auto-cleared)

---

### 6. HARDWAY BETS
**Rules:**
- Hard 4 (2+2): Pays 7:1
- Hard 6 (3+3): Pays 9:1
- Hard 8 (4+4): Pays 9:1
- Hard 10 (5+5): Pays 7:1
- Loses if the number comes "easy way" (not doubles) or if 7 is rolled.
- Bet stays on table when it wins (continues action).

**Implementation Status:** ✅ CORRECT
- Line 1001-1056: All hardways implemented correctly
- Payouts: Hard 4/10 = 7:1, Hard 6/8 = 9:1
- Loses on easy way or 7
- Bet stays on table when winning (betsToKeep.push)

---

### 7. PROPOSITION BETS (One-Roll)
**Rules:**
- Snake Eyes (2): 30:1 (total return 31x)
- Boxcars (12): 30:1 (total return 31x)
- Ace-Deuce (3): 15:1 (total return 16x)
- Yo-Eleven (11): 15:1 (total return 16x)
- Any Craps (2,3,12): 7:1 (total return 8x)
- All are one-roll bets (cleared after each roll).

**Implementation Status:** ✅ CORRECT
- Line 1059-1093: All prop bets correct
- Snake Eyes: 31x total (30:1 odds) ✅
- Boxcars: 31x total (30:1 odds) ✅
- Ace-Deuce: 16x total (15:1 odds) ✅
- Yo: 16x total (15:1 odds) ✅
- Any Craps: 8x total (7:1 odds) ✅
- Not added to betsToKeep (auto-cleared) ✅

---

### 8. C & E BETS (One-Roll)
**Rules:**
- Split bet between Craps (2,3,12) and Eleven (11).
- C wins on 2, 3, 12: Pays 7:1 on half the bet (4:1 effective payout on full bet).
- E wins on 11: Pays 15:1 on half the bet (8:1 effective payout on full bet).
- One-roll bet (cleared after each roll).

**Implementation Status:** ✅ CORRECT
- Line 1095-1125: C&E bets implemented correctly
- C pays 8x (7:1 odds) on half bet = 4x on full bet ✅
- E pays 16x (15:1 odds) on half bet = 8x on full bet ✅
- Not added to betsToKeep (auto-cleared) ✅

---

### 9. PLACE BETS
**Rules:**
- Can place on 2, 3, 4, 5, 6, 8, 9, 10, 11, 12.
- Pays house odds (less than true odds).
- Bet stays on table when it wins.
- Loses on 7.

**House Odds:**
- Place 2 or 12: 11:2 (5.5:1)
- Place 3 or 11: 11:4 (2.75:1)
- Place 4 or 10: 9:5 (1.8:1)
- Place 5 or 9: 7:5 (1.4:1)
- Place 6 or 8: 7:6 (1.167:1)

**Implementation Status:** ✅ CORRECT
- Line 1264-1293: Place bet payouts correct
- Bet stays on table (betsToKeep.push) ✅
- Loses on 7 (not added to betsToKeep) ✅

---

### 10. BUY BETS
**Rules:**
- Can buy any number (2,3,4,5,6,8,9,10,11,12).
- Pays true odds.
- Charges 5% commission (vig) upfront.
- Bet stays on table when it wins.
- Loses on 7.

**True Odds (same as pass line odds):**
- Buy 2 or 12: 6:1
- Buy 3 or 11: 3:1
- Buy 4 or 10: 2:1
- Buy 5 or 9: 3:2
- Buy 6 or 8: 6:5

**Implementation Status:** ✅ CORRECT
- Line 418-427: 5% commission charged upfront
- Line 1233-1262: Buy bet payouts at true odds
- Bet stays on table (betsToKeep.push) ✅
- Loses on 7 (not added to betsToKeep) ✅

---

### 11. SMALL / TALL / ALL BETS (Bonus Bets)
**Rules:**
- Small: Hit all of 2, 3, 4, 5, 6 before 7 - Pays 34:1
- Tall: Hit all of 8, 9, 10, 11, 12 before 7 - Pays 34:1  
- All: Hit all 10 numbers (2,3,4,5,6,8,9,10,11,12) before 7 - Pays 176:1
- Cannot be removed once placed.
- Automatically activate when point is established.
- Can be toggled OFF during come-out roll only.

**Implementation Status:** ✅ CORRECT
- Line 689-753: Small/Tall/All tracking and payouts correct
- Line 696, 718, 740: Correct payouts (35x total = 34:1 odds for Small/Tall, 177x total = 176:1 odds for All)
- Line 479-482: Cannot be removed during point phase
- Line 802: Auto-activate when point established
- Line 891, 920: Reset to OFF when returning to come-out

---

## 🎲 GAME PHASE RULES

### COME-OUT ROLL
**Rules:**
- Only 7 wins for pass line.
- All other numbers (2,3,4,5,6,8,9,10,11,12) establish a point.
- Can place new pass line bets.
- Can place/remove come bets.
- Small/Tall/All bets turn OFF by default (can toggle ON manually).

**Implementation Status:** ✅ CORRECT

---

### POINT PHASE  
**Rules:**
- Cannot remove pass line bets.
- Cannot place new pass line bets (bet remains from come-out).
- CAN place pass line odds (up to max limit).
- CAN remove pass line odds at any time.
- If point is made, pass line wins and returns to come-out.
- If 7 is rolled, ALL bets lose (seven-out).
- Small/Tall/All bets are WORKING by default (can toggle OFF manually).

**Implementation Status:** ✅ CORRECT

---

## 🚨 BETTING RESTRICTIONS

### Cannot Be Removed:
1. ✅ Pass Line bet after point is established (Line 473-476)
2. ✅ Come bets that have traveled to numbers (Line 484-491)
3. ✅ Small/Tall/All bets once point is established (Line 479-482)

### Can Be Removed:
1. ✅ Pass Line odds (any time)
2. ✅ Come odds (any time)
3. ✅ Place bets (any time)
4. ✅ Buy bets (any time)
5. ✅ Hardway bets (any time)

### One-Roll Bets (Auto-Cleared):
1. ✅ Field bets
2. ✅ Proposition bets (Snake Eyes, Boxcars, Ace-Deuce, Yo, Any Craps)
3. ✅ C & E bets

---

## ✅ CONCLUSION

**ALL BETTING RULES ARE CORRECTLY IMPLEMENTED!**

The game follows authentic crapless craps rules with proper:
- ✅ Payouts for all bet types
- ✅ Betting restrictions based on game phase
- ✅ Crapless craps specific rules (2,3,11,12 become points)
- ✅ Odds betting with correct true odds
- ✅ Commission charging for buy bets
- ✅ One-roll bet handling
- ✅ Seven-out clearing all bets
- ✅ Bonus bet tracking and payouts

**NO CHANGES NEEDED - THE IMPLEMENTATION IS AUTHENTIC AND CORRECT!**
