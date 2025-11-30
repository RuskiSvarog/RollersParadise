# 🔊 Audio Setup Instructions for Rollers Paradise

## 🎵 PART 1: Background Casino Music (NEW!)

Your background casino music system is now fully implemented! Follow these steps:

### Step 1: Find Casino Background Music
You need a casino-style background music MP3. Here are some options:

**Option A: Download Royalty-Free Casino Music**
- Visit: https://www.bensound.com/royalty-free-music/track/jazz-comedy (Casino Jazz)
- Visit: https://www.epidemicsound.com/ (Search "casino" or "lounge")
- Visit: https://pixabay.com/music/search/casino/ (Free casino music)

**Option B: Use YouTube to MP3 Converter**
- Find a casino ambience video on YouTube
- Use a YouTube to MP3 converter (e.g., ytmp3.cc)
- Download the audio

### Step 2: Add Background Music File
1. Create folder: `public/audio/` (if not already created)
2. Rename your music file to: `casino-background.mp3`
3. Place it at: `public/audio/casino-background.mp3`

### Step 3: Features Included
✅ Auto-plays when the game loads (30% volume default)
✅ Loops continuously
✅ Floating music controls in top-right corner
✅ Play/Pause button
✅ Mute/Unmute button
✅ Volume slider (0-100%)
✅ Minimizable controls
✅ Animated music icon when playing

---

## 🎲 PART 2: Dice Roll Sound

Your dice rolling sound system is also fully implemented! Follow these steps:

### Step 1: Create the Audio Directory (if not already done)
1. In your project's **public folder**, create a new folder called `audio`
2. The path should be: `public/audio/`

### Step 2: Add Your Dice Roll File
1. Download your dice roll MP3 from: https://limewire.com/d/15Vz7#JXWrfUuWv8
2. Rename the file to: `dice-roll.mp3`
3. Place the file in: `public/audio/dice-roll.mp3`

### Step 3: Test It Out!
Once the file is in place:
- The sound will automatically play when you click the "ROLL DICE" button
- The sound is set to 60% volume by default
- The sound plays every time the dice roll

---

## 🎵 How It Works

The code is already set up and integrated:
- ✅ `SoundManager` component created
- ✅ Integrated into `CrapsGame` 
- ✅ Triggers on every dice roll
- ✅ Automatically resets after each play
- ✅ Handles browser autoplay restrictions gracefully

---

## 🎛️ Adjusting Volume (Optional)

To change the dice roll volume, edit `/components/SoundManager.tsx`:

```tsx
diceRollAudioRef.current.volume = 0.6; // Change 0.6 to any value between 0.0 and 1.0
```

- `0.0` = silent
- `0.5` = 50% volume
- `1.0` = full volume (100%)

---

## 🚨 Troubleshooting

**Sound not playing?**
1. Check that the file is exactly at: `public/audio/dice-roll.mp3`
2. Make sure the filename is lowercase and uses a hyphen (not underscore)
3. Clear your browser cache and refresh
4. Check the browser console for error messages

**Browser blocking autoplay?**
- Some browsers block audio until the user interacts with the page
- The first dice roll click should allow all future sounds
- This is normal browser behavior for security

---

## 📁 File Structure

Your project should look like this:
```
public/
  └── audio/
      ├── casino-background.mp3  ← Background music (loops continuously)
      └── dice-roll.mp3          ← Dice roll sound effect
components/
  ├── BackgroundMusic.tsx        ← Already created!
  ├── SoundManager.tsx           ← Already created!
  └── CrapsGame.tsx              ← Already integrated!
```

---

## 🎛️ Customizing Music Settings

### Background Music Volume
Edit `/components/BackgroundMusic.tsx`:
```tsx
<BackgroundMusic autoPlay={true} defaultVolume={0.3} />
```
- Change `defaultVolume` from `0.3` to any value between `0.0` and `1.0`
- `0.3` = 30% volume (recommended for background music)

### Dice Roll Volume
Edit `/components/SoundManager.tsx`:
```tsx
diceRollAudioRef.current.volume = 0.6;
```
- Change `0.6` to any value between `0.0` and `1.0`

---

## 🎉 That's It!

Once you place **both audio files** in `public/audio/`, everything will work automatically:
1. ✅ Background music starts when game loads
2. ✅ Dice roll sound plays on every roll
3. ✅ Music controls appear in top-right corner
4. ✅ User can adjust volume, mute, or pause anytime

**No additional code changes needed!** 🎰🎵
