# 🎲 How to Add Your Custom Dice Roll Sound

## Quick Instructions

Your game currently looks for a dice roll sound at this location:

```
public/audio/dice-roll.mp3
```

## Steps to Add Your MP3 File:

### Option 1: Using File Explorer/Finder (Easiest)

1. **Locate your project folder** on your computer
2. **Navigate to** the `public` folder (create it if it doesn't exist)
3. **Create a folder** called `audio` inside `public` (if it doesn't exist)
4. **Copy your MP3 file** into the `public/audio/` folder
5. **Rename it** to `dice-roll.mp3`

Your final file path should be:
```
your-project-folder/
  └── public/
      └── audio/
          └── dice-roll.mp3
```

### Option 2: Using Terminal/Command Line

If you're comfortable with the command line:

```bash
# Create the directory (if it doesn't exist)
mkdir -p public/audio

# Copy your dice sound file and rename it
cp /path/to/your-sound.mp3 public/audio/dice-roll.mp3
```

## ✅ Verification

Once you've added the file:

1. **Restart your development server** (if running)
2. **Load the game** in your browser
3. **Roll the dice** - you should hear your custom sound!
4. Check the browser console - you should NOT see any errors about missing audio files

## 🎵 Audio File Requirements

- **Format:** MP3 (recommended)
- **File name:** Must be exactly `dice-roll.mp3`
- **Location:** Must be in `public/audio/` folder
- **Size:** Keep it under 500KB for fast loading
- **Length:** 1-3 seconds works best for dice rolls

## 🔧 Alternative: Use a Different File Name

If you want to use a different file name, you can update the code:

1. Open `/components/SoundManager.tsx`
2. Find line 45: `audio.src = '/audio/dice-roll.mp3';`
3. Change it to your file name: `audio.src = '/audio/your-custom-name.mp3';`

## 📝 Notes

- The sound plays when the dice start rolling (with the visual animation)
- Volume is controlled by the game's Master Volume and Sound Effects Volume settings
- The sound is limited to 60% of the combined volume for balance with other game sounds
- If the file is not found, the game will still work - it just won't play the dice sound

## 🎮 Already Have the File?

If you already have your dice roll MP3 file ready:

**Just tell me:** "I've added my dice-roll.mp3 file to the public/audio folder"

And I can verify everything is set up correctly!

---

**Need help?** Let me know and I can guide you through any issues!
