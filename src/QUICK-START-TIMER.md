# ⚡ Quick Start - Multiplayer Timer System

## 🎯 What Is This?

The **Automatic Betting Timer** keeps your multiplayer craps game moving by automatically rolling the dice when the betting period expires (30 seconds).

**Location:** Multiplayer mode ONLY (not in single-player)

---

## 🚀 Quick Test (30 Seconds)

1. **Open your app**
2. **Go to Multiplayer** → Create Room
3. **Look at top of screen** → See big countdown timer
4. **Watch it count down** → 30... 29... 28...
5. **Wait for zero** → Dice auto-roll!

**That's it!** ✅

---

## 🎨 What You'll See

### Visual Timer Display

```
╔════════════════════════════════════════╗
║                                        ║
║        ⏱️          30                 ║
║              💰 PLACE YOUR BETS!      ║
║                                        ║
║    ████████████████████████  100%     ║
║                                        ║
╚════════════════════════════════════════╝
        Green background (30-20s)
```

```
╔════════════════════════════════════════╗
║                                        ║
║        ⏱️          15                 ║
║              💰 PLACE YOUR BETS!      ║
║                                        ║
║    ████████████░░░░░░░░░░  50%        ║
║                                        ║
╚════════════════════════════════════════╝
    Yellow/Orange background (20-10s)
```

```
╔════════════════════════════════════════╗
║    ⚠️ HURRY! BETTING CLOSES SOON! ⚠️  ║
║                                        ║
║        ⏰          05                 ║
║              💰 PLACE YOUR BETS!      ║
║                                        ║
║    ███░░░░░░░░░░░░░░░░░░  16%         ║
║                                        ║
║   🎲 AUTO-ROLL IN 5 SECONDS! 🎲       ║
╚════════════════════════════════════════╝
     RED background + PULSE (10-0s)
```

---

## 🔊 What You'll Hear (if Dealer Voice is ON)

| Time | Sound |
|------|-------|
| 10s | BEEP! (warning) |
| 5s | tick |
| 4s | tick |
| 3s | tick |
| 2s | tick |
| 1s | tick |
| 0s | ROLL! (dice rolling) |

---

## ⚙️ Settings

### Enable/Disable Sounds
1. Open **Settings** ⚙️
2. Toggle **Dealer Voice** ON/OFF
3. Adjust **Dealer Volume** slider

### Timer Duration
Default: **30 seconds** (can't change in-game)

To change permanently:
1. Open `/components/MultiplayerCrapsGame.tsx`
2. Find: `const BETTING_TIMER_DURATION = 30;`
3. Change to desired seconds
4. Save file

---

## 🎮 How It Works

### Betting Phase (30 seconds)
- ✅ Timer counts down
- ✅ Players place bets
- ✅ Green background (relaxed)

### Warning Phase (10 seconds)
- ⚠️ Red background
- ⚠️ Pulsing animation
- ⚠️ Warning messages
- ⚠️ Countdown sounds

### Auto-Roll (0 seconds)
- 🚨 Betting LOCKS (no more bets)
- 🎲 Host rolls dice automatically
- 📊 Results calculated
- ♻️ Timer resets to 30s

---

## 👥 Multiplayer Sync

All players see:
- ✅ Same countdown
- ✅ Same warnings
- ✅ Same auto-roll

*Note: May vary by 1-2 seconds due to internet latency*

---

## 🎯 Manual Override

**Host can roll early:**
- Timer at 15 seconds
- Host clicks "Roll Dice"
- Manual roll happens
- Timer stops/resets

---

## 📊 Performance Check

### Good Performance:
```
✅ [PERFORMANCE] Timer completed
📊 Expected: 30s | Actual: 30.02s | Accuracy: 99.93%
⚠️ Missed ticks: 0
```

### Bad Performance:
```
⚠️ [PERFORMANCE] Timer completed
📊 Expected: 30s | Actual: 35.5s | Accuracy: 84.5%
⚠️ Missed ticks: 3
```

**If you see bad performance:**
- Check internet connection
- Close other browser tabs
- Check browser console for errors

---

## 🐛 Troubleshooting

### Timer Doesn't Show
**Fix:** Make sure you're in **Multiplayer** mode, not single-player

### Timer Shows But Doesn't Count
**Fix:** 
1. Check browser console (F12)
2. Look for errors
3. Refresh page

### No Auto-Roll at Zero
**Fix:**
1. Make sure you're the **host** (or wait for host to trigger)
2. Check console for errors
3. Verify internet connection

### Timer Out of Sync
**Fix:**
1. Refresh both browsers
2. Check internet connection
3. Rejoin room

---

## 📱 Console Logs (For Debugging)

**Normal operation:**
```
⏱️ [MULTIPLAYER TIMER] Starting betting countdown from 30 seconds
⚠️ [TIMER WARNING] 10 seconds remaining!
⏰ [TIMER] 5 seconds remaining!
🚨 [TIMER EXPIRED] Locking bets and triggering auto-roll
👑 [HOST] Triggering auto-roll in 100ms...
🎯 [MULTIPLAYER AUTO-ROLL] Result: { dice1: 4, dice2: 3, total: 7 }
✅ [PERFORMANCE] Timer completed
```

**Look for these emojis:**
- ⏱️ = Timer running
- ⚠️ = Warning
- 🚨 = Critical event
- 👑 = Host action
- 🎯 = Result
- ✅ = Success

---

## ✅ Checklist

Working correctly if:
- [x] Timer visible at top of game
- [x] Counts down from 30 to 0
- [x] Changes color (green → yellow → red)
- [x] Plays sounds (if enabled)
- [x] Shows warning messages
- [x] Auto-rolls at 0
- [x] Resets after roll

---

## 📚 More Info

**Detailed docs:**
- `/MULTIPLAYER_TIMER_SYSTEM.md` - Full technical guide
- `/TIMER_SYSTEM_VERIFICATION.md` - Testing procedures
- `/TIMER_UPDATE_SUMMARY.md` - What was changed

---

## 🎓 Quick Tips

1. **Enable sounds** for best experience (Settings → Dealer Voice ON)
2. **Watch the timer** - Don't get caught at zero!
3. **Host can override** - Manual roll stops timer
4. **Sync is normal** - 1-2 second variance is OK
5. **Check console** - Logs tell you everything

---

## 🚀 Status

✅ **WORKING** and **PRODUCTION READY**

---

**That's all you need to know!** 🎰

*Quick reference guide - For full details see main documentation*
