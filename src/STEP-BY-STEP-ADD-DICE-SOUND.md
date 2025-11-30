# 🎲 STEP-BY-STEP: Adding Your Dice Roll MP3 Sound

## Follow These Exact Steps:

### **Step 1: Locate Your Project Folder**
1. Open your file explorer (Windows) or Finder (Mac)
2. Navigate to where you saved your "Rollers Paradise" project
3. You should see folders like: `components`, `utils`, `styles`, etc.

---

### **Step 2: Create the Audio Folder**
1. Look for a folder called `public` in your project
   - **If you SEE the `public` folder:** Open it
   - **If you DON'T see it:** Right-click in your project folder → Create New Folder → Name it `public`

2. Inside the `public` folder, look for a folder called `audio`
   - **If you SEE the `audio` folder:** Open it
   - **If you DON'T see it:** Right-click inside `public` → Create New Folder → Name it `audio`

---

### **Step 3: Add Your MP3 File**
1. Find your dice roll MP3 file on your computer
2. **Copy** the file (Right-click → Copy, or Ctrl+C / Cmd+C)
3. Go to the `public/audio/` folder you just created/opened
4. **Paste** the file (Right-click → Paste, or Ctrl+V / Cmd+V)
5. **IMPORTANT:** Rename the file to exactly: `dice-roll.mp3`
   - Right-click the file → Rename
   - Type: `dice-roll.mp3`
   - Press Enter

**Your file structure should now look like this:**
```
your-project-folder/
├── components/
├── utils/
├── styles/
├── public/              ← You created/found this
│   └── audio/           ← You created/found this
│       └── dice-roll.mp3  ← Your MP3 file renamed!
└── ... (other files)
```

---

### **Step 4: Restart Your Development Server**

**Option A - If running in Terminal/Command Prompt:**
1. Go to your terminal window running the dev server
2. Press `Ctrl + C` to stop it
3. Type: `npm run dev` (or `yarn dev`)
4. Press Enter to restart

**Option B - If running in an IDE (like VS Code):**
1. Click the "Stop" button (usually a red square)
2. Click "Run" or "Start" again

---

### **Step 5: Test Your Dice Sound!**
1. Open your browser
2. Go to your game (usually `http://localhost:3000` or `http://localhost:5173`)
3. Click the dice to roll
4. **You should hear your custom dice roll sound!** 🎲🔊

---

## ✅ Quick Checklist

- [ ] Found your project folder
- [ ] Created `public` folder (if needed)
- [ ] Created `audio` folder inside `public`
- [ ] Copied your MP3 file to `public/audio/`
- [ ] Renamed file to exactly `dice-roll.mp3`
- [ ] Restarted development server
- [ ] Tested dice roll in game

---

## 🔧 Troubleshooting

### "I don't hear any sound!"
✅ **Check:**
1. Is the file named EXACTLY `dice-roll.mp3`? (no spaces, correct spelling)
2. Is it in the right folder? (`public/audio/dice-roll.mp3`)
3. Did you restart the dev server?
4. Is your computer volume turned up?
5. Are sound effects enabled in game settings?

### "I can't find the `public` folder!"
✅ **Solution:**
- Create it! Right-click in your project root → New Folder → Name it `public`

### "The file won't rename!"
✅ **Solution:**
- Make sure file extensions are visible:
  - **Windows:** File Explorer → View → Check "File name extensions"
  - **Mac:** Finder → Preferences → Advanced → Check "Show all filename extensions"

---

## 📝 File Requirements

✅ **Correct:**
- File name: `dice-roll.mp3`
- Location: `public/audio/dice-roll.mp3`
- Format: MP3
- Size: Under 500KB recommended

❌ **Incorrect:**
- `dice-roll.MP3` (wrong case)
- `dice roll.mp3` (has space)
- `diceroll.mp3` (missing hyphen)
- `dice-sound.mp3` (wrong name)

---

## 🎮 Need More Help?

If you're still stuck, tell me:
1. What operating system you're using (Windows/Mac/Linux)
2. What step you're on
3. What you see in your `public` folder

I'll help you get it working! 🚀
