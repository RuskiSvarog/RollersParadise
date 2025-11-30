# Puck Display and Bonus Bets Button Fix

## Date: Saturday, November 29, 2025

## Issues Fixed

### 1. ✅ Puck Display Showing Correct State

**Problem:** The puck was displaying "ON" or "OFF" based on `bonusBetsWorking` (the bonus bets toggle), which was incorrect. The puck should show the game phase, not the bonus bets state.

**Fix:** Changed all `puckOn` props from `bonusBetsWorking` to `gamePhase === 'point'`

**How it works now:**
- **Puck shows "ON"** (white with yellow border, pulsing) when `gamePhase === 'point'` (point is established)
- **Puck shows "OFF"** (black with gray border) when `gamePhase === 'comeOut'` (come-out roll)
- The puck appears on the number that is the current point
- This matches authentic casino behavior

### 2. ✅ Bonus Bets Button Working Properly

**Problem:** The button label was confusing and didn't clearly indicate what it controlled.

**Fix:** 
- Updated button to show "BONUS BETS" label above the working/off status
- Added helpful tooltip text explaining what the button does
- Maintained the color coding:
  - **Green** = Bonus bets are WORKING (hardways, hops, etc. will pay out)
  - **Red** = Bonus bets are OFF (hardways, hops, etc. will not pay out)

**How it works now:**
- Button clearly shows "BONUS BETS" with "✓ WORKING" or "✗ OFF" below
- Tooltip explains: "Bonus bets (Hardways, Hops, etc.) are WORKING/OFF - Click to turn ON/OFF"
- Toggle works properly - clicking switches between working and off states
- Visual feedback with scale animation on hover/click

## What Changed in Code

### File: `/components/CrapsTable.tsx`

1. **All NumberBox components** (lines 464, 484, 504, 524, 544, 564, 584, 604, 624, 644):
   ```typescript
   // BEFORE
   puckOn={bonusBetsWorking}
   
   // AFTER
   puckOn={gamePhase === 'point'}
   ```

2. **Bonus Bets Toggle Button** (lines 187-207):
   ```typescript
   // BEFORE
   {bonusBetsWorking ? '✓ BETS WORKING' : '✗ BETS OFF'}
   
   // AFTER
   <div className="flex flex-col items-center gap-1">
     <span className="text-xs opacity-90">BONUS BETS</span>
     <span>{bonusBetsWorking ? '✓ WORKING' : '✗ OFF'}</span>
   </div>
   ```

## How to Test

### Testing the Puck:
1. Start a new game
2. Place a Pass Line bet
3. Roll the dice on come-out roll
4. If 7: puck should remain OFF, new come-out roll starts
5. If any other number (2-6, 8-12): 
   - Puck should appear on that number
   - Puck should show **"ON"** in white with yellow glow
   - Puck should pulse to draw attention
6. Continue rolling until point is made or seven-out
7. When round ends, puck should disappear or show **"OFF"** in black

### Testing the Bonus Bets Button:
1. Start a game and establish a point
2. Place a hardway bet (e.g., Hard 4)
3. Click the "BONUS BETS" button:
   - Should toggle between green "✓ WORKING" and red "✗ OFF"
   - When OFF, hardway bets won't pay out
   - When WORKING, hardway bets will pay out normally
4. Roll a hardway:
   - If button is WORKING (green): bet should win
   - If button is OFF (red): bet should not win
5. Check the tooltip on hover for helpful explanation

## Game Rules Reminder

### Puck States:
- **OFF** (black): Come-out roll - no point established yet
  - Pass Line bets win on 7
  - Other numbers become the point
  
- **ON** (white): Point phase - point is established
  - Goal is to roll the point number again before rolling 7
  - Pass Line bets are locked until resolution

### Bonus Bets:
- **WORKING** (green button): Bonus bets are active
  - Hardways pay out if rolled
  - Hop bets pay out if rolled
  - Small/Tall/All progress counts
  
- **OFF** (red button): Bonus bets are inactive
  - Hardways don't pay out (but stay on table)
  - Hop bets are cleared
  - Small/Tall/All don't progress

## Notes for Developers

- The puck state is purely visual feedback of `gamePhase`
- The bonus bets button controls `bonusBetsWorking` state
- These are two separate, independent systems
- The confusion was mixing them together
- Now they work correctly and independently

## Accessibility

- Puck uses high contrast colors (white/black with colored borders)
- Puck pulses when ON for visual attention
- Button has clear text labels
- Button has helpful tooltip
- Color is not the only indicator (text + icons used)
- Large touch targets for mobile users
