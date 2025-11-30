# ⚡ QUICK START - Get Running in 5 Minutes!

## 🎯 You Got This Error:
```
npm : The term 'npm' is not recognized...
```

## ✅ Here's the Fix:

---

## **Step 1: Install Node.js** (2 minutes)

### **Windows:**
1. Go to: **https://nodejs.org/**
2. Click the **LEFT green button** (LTS version)
3. Run the downloaded file
4. Click "Next" → "Next" → "Install"
5. **RESTART YOUR COMPUTER** ⚠️ (Important!)

### **Mac:**
1. Go to: **https://nodejs.org/**
2. Click the **LEFT green button** (LTS version)
3. Run the `.pkg` file
4. Enter password and install
5. Close and reopen Terminal

---

## **Step 2: Verify Installation** (30 seconds)

Open **PowerShell** (Windows) or **Terminal** (Mac) and type:

```bash
node --version
```

You should see: `v20.11.0` (or similar)

✅ **If you see a version number, you're good!**

❌ **If not, restart your computer and try again**

---

## **Step 3: Go to Your Project Folder** (30 seconds)

In PowerShell/Terminal, type:

```bash
cd path/to/your/rollers-paradise
```

**EASY TIP:** Drag your project folder into the terminal window and it auto-fills the path!

---

## **Step 4: Install Dependencies** (3 minutes)

Type:

```bash
npm install
```

**Wait for it to finish** (takes 2-5 minutes, downloads packages)

You'll see: `added XXX packages`

---

## **Step 5: Run the Game!** (10 seconds)

Type:

```bash
npm run dev
```

You'll see:
```
➜  Local:   http://localhost:5173/
```

**Click that link** (hold Ctrl/Cmd and click)

🎉 **YOUR GAME IS NOW RUNNING!**

---

## **Step 6: Add Your Dice Sound** (1 minute)

1. **Keep the terminal running**
2. Open your project folder in File Explorer/Finder
3. Create folders: `public` → `audio`
4. Copy your MP3 to: `public/audio/dice-roll.mp3`
5. Go back to terminal
6. Press `Ctrl + C` (stops server)
7. Type: `npm run dev` (starts again)
8. Refresh browser

🎲 **Your custom dice sound now works!**

---

## 📝 Summary

```bash
# 1. Install Node.js from https://nodejs.org/ (then restart computer)

# 2. Open terminal and navigate to project:
cd path/to/rollers-paradise

# 3. Install dependencies:
npm install

# 4. Run the game:
npm run dev

# 5. Open browser to:
http://localhost:5173/
```

---

## 🆘 Quick Troubleshooting

**"npm not found" after installing Node.js?**
→ **RESTART YOUR COMPUTER** (Windows) or Terminal (Mac)

**"Cannot find package.json"?**
→ You're in the wrong folder. `cd` to your project folder.

**"Port already in use"?**
→ Close other terminal windows, or use: `npm run dev -- --port 3000`

**Changes not showing?**
→ Press `Ctrl + Shift + R` in browser (hard refresh)

---

## ✅ You're Done!

Once `npm run dev` works, you have:
- ✅ Game running
- ✅ Daily bonus system working
- ✅ Natural dealer voice
- ✅ Ready to add your dice sound

**Everything is ready! Just add Node.js and run!** 🚀

---

**Need more details?** See: `INSTALL-NODEJS-AND-RUN.md`
