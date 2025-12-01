# 🚀 Install Node.js & Run Rollers Paradise

## ❌ Error: "npm is not recognized"

This means **Node.js is not installed** on your computer. Follow these steps to fix it!

---

## 📥 STEP 1: Install Node.js

### **For Windows:**

1. **Go to Node.js website:**
   - Open your web browser
   - Go to: https://nodejs.org/

2. **Download Node.js:**
   - You'll see **two big green buttons**
   - Click the **LEFT button** (LTS version - recommended)
   - Example: "20.11.0 LTS" or similar
   - This downloads the installer (about 30MB)

3. **Run the installer:**
   - Find the downloaded file (usually in Downloads folder)
   - Double-click: `node-v20.x.x-x64.msi`
   - Click **"Next"** through all the steps
   - ✅ Make sure "Add to PATH" is checked (it's checked by default)
   - Click **"Install"**
   - Wait for installation (takes 1-2 minutes)
   - Click **"Finish"**

4. **Restart your computer:**
   - **IMPORTANT:** You MUST restart for PATH changes to take effect
   - Save any work
   - Restart Windows

5. **Verify installation:**
   - After restart, open **PowerShell** or **Command Prompt**
   - Type: `node --version`
   - Press Enter
   - You should see: `v20.11.0` (or similar)
   - Type: `npm --version`
   - Press Enter
   - You should see: `10.2.4` (or similar)

✅ **If you see version numbers, Node.js is installed!**

---

### **For Mac:**

1. **Go to Node.js website:**
   - Open Safari or Chrome
   - Go to: https://nodejs.org/

2. **Download Node.js:**
   - Click the **LEFT button** (LTS version)
   - This downloads a `.pkg` file

3. **Run the installer:**
   - Find the downloaded `.pkg` file
   - Double-click it
   - Follow the installation wizard
   - Enter your Mac password when prompted
   - Click through all steps
   - Click "Install"

4. **Restart Terminal:**
   - Close all Terminal windows
   - Open a new Terminal

5. **Verify installation:**
   - Type: `node --version`
   - Press Enter
   - You should see: `v20.11.0` (or similar)
   - Type: `npm --version`
   - Press Enter
   - You should see: `10.2.4` (or similar)

✅ **If you see version numbers, Node.js is installed!**

---

## 🎮 STEP 2: Install Project Dependencies

Now that Node.js is installed, let's set up your project!

### **1. Open Terminal/PowerShell:**

**Windows:**
- Press `Windows Key + R`
- Type: `powershell`
- Press Enter

**Mac:**
- Press `Cmd + Space`
- Type: `terminal`
- Press Enter

### **2. Navigate to Your Project:**

```bash
# Example - replace with YOUR actual path:
cd C:\Users\YourName\Documents\rollers-paradise

# Or on Mac:
cd ~/Documents/rollers-paradise
```

**TIP:** You can drag the folder into Terminal/PowerShell to auto-fill the path!

### **3. Install Dependencies:**

Type this command and press Enter:

```bash
npm install
```

**What happens:**
- Downloads all required packages
- Takes 2-5 minutes
- You'll see a progress bar
- Wait until you see "added XXX packages"

✅ **When done, you'll see something like:** `added 1234 packages in 3m`

---

## 🚀 STEP 3: Run the Development Server

Now you're ready to run the game!

### **1. Start the server:**

```bash
npm run dev
```

**What you'll see:**
```
> rollers-paradise dev
> vite

  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### **2. Open the game:**

- Look for the line: `Local: http://localhost:5173/`
- **Hold Ctrl** (or Cmd on Mac) and **click the link**
- OR open your browser and go to: `http://localhost:5173/`

🎉 **Your game should now be running!**

---

## 🎲 STEP 4: Add Your Dice Sound (Now You Can!)

Now that the server is running, you can add your dice sound:

### **1. Keep the server running** (don't close the terminal)

### **2. In a NEW File Explorer window:**
- Go to your project folder
- Create: `public/audio/` folders
- Copy your MP3 into: `public/audio/dice-roll.mp3`

### **3. Restart the server:**
- Go back to Terminal/PowerShell
- Press: `Ctrl + C` (stops the server)
- Type: `npm run dev` (starts it again)
- Press Enter

### **4. Refresh your browser:**
- Press `F5` or `Ctrl + R`
- Roll the dice
- **Hear your custom sound!** 🎲🔊

---

## 📁 Full File Structure

Your project should look like this:

```
rollers-paradise/
├── node_modules/          ← Created by "npm install"
├── public/                ← Create this folder
│   └── audio/             ← Create this folder
│       └── dice-roll.mp3  ← Your MP3 file goes here
├── components/
├── utils/
├── styles/
├── package.json
├── vite.config.js
└── ... (other files)
```

---

## 🔧 Common Issues & Solutions

### **Issue: "Cannot find module"**
**Solution:**
```bash
npm install
```
Run this command to install missing packages.

---

### **Issue: "Port 5173 already in use"**
**Solution:**
- Close any other terminals running the dev server
- OR use a different port:
```bash
npm run dev -- --port 3000
```

---

### **Issue: Changes not appearing in browser**
**Solution:**
- Press `Ctrl + Shift + R` (hard refresh)
- Or clear browser cache

---

### **Issue: "EACCES" or permission errors**
**Solution (Mac/Linux):**
```bash
sudo npm install
```
Enter your password when prompted.

**Solution (Windows):**
- Run PowerShell as Administrator
- Right-click PowerShell → "Run as Administrator"

---

## ✅ Quick Start Checklist

- [ ] Install Node.js from https://nodejs.org/
- [ ] Restart computer (Windows) or Terminal (Mac)
- [ ] Verify with: `node --version` and `npm --version`
- [ ] Navigate to project folder: `cd path/to/project`
- [ ] Install dependencies: `npm install`
- [ ] Start dev server: `npm run dev`
- [ ] Open browser to: http://localhost:5173/
- [ ] Add dice sound to: `public/audio/dice-roll.mp3`
- [ ] Restart server (Ctrl+C, then `npm run dev`)
- [ ] Test the game!

---

## 🎮 You're Ready!

Once you complete these steps:
1. ✅ Node.js installed
2. ✅ Dependencies installed
3. ✅ Server running
4. ✅ Game open in browser
5. ✅ Dice sound added

**Everything will work perfectly!** 🚀🎲💰

---

## 💡 Helpful Commands

### **Start the game:**
```bash
npm run dev
```

### **Stop the server:**
Press `Ctrl + C` in the terminal

### **Install new packages:**
```bash
npm install package-name
```

### **Update all packages:**
```bash
npm update
```

### **Clear cache and reinstall:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🆘 Still Having Issues?

If you're stuck, tell me:
1. What operating system? (Windows 10/11, Mac, etc.)
2. What step are you on?
3. What's the exact error message?
4. Screenshot if possible!

I'll help you get it running! 🚀
