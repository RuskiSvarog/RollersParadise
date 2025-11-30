# 🔧 FIX: PowerShell Script Execution Error

## ❌ The Error You Got:
```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because 
running scripts is disabled on this system.
```

## ✅ THE FIX (3 Easy Steps):

---

## **Step 1: Close Current PowerShell**

Close the PowerShell window you have open now.

---

## **Step 2: Open PowerShell as ADMINISTRATOR**

### **Method 1 (Easiest):**
1. Click the **Windows Start button** (bottom left)
2. Type: `powershell`
3. You'll see **"Windows PowerShell"** in the results
4. **RIGHT-CLICK** on it
5. Click **"Run as administrator"**
6. Click **"Yes"** when Windows asks for permission

### **Method 2 (Alternative):**
1. Press `Win + X` on your keyboard
2. Click **"Windows PowerShell (Admin)"** or **"Terminal (Admin)"**

---

## **Step 3: Enable Script Execution**

In the **Administrator PowerShell** window, type this command:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Press **Enter**

When it asks: `Do you want to change the execution policy?`

Type: **Y** (for Yes)

Press **Enter**

✅ **You should see no errors - just returns to the prompt**

---

## **Step 4: Find Your ACTUAL Project Folder**

You were in the wrong folder! `C:\Users\Public\audio` is NOT your project.

### **Where is your Rollers Paradise project?**

**Option A: You downloaded it**
- Probably in: `C:\Users\avgel\Downloads\rollers-paradise`
- Or: `C:\Users\avgel\Documents\rollers-paradise`

**Option B: You created it**
- Might be in: `C:\Users\avgel\Desktop\rollers-paradise`
- Or wherever you saved it

**Option C: Find it with File Explorer**
1. Open File Explorer
2. Look for the folder with these files inside:
   - `package.json`
   - `components` folder
   - `utils` folder
   - `styles` folder
3. Once you find it, note the full path

---

## **Step 5: Navigate to the CORRECT Folder**

### **Easy Way (Drag & Drop):**
1. Open File Explorer
2. Find your Rollers Paradise project folder (see Step 4)
3. Type `cd ` in PowerShell (with a space after cd)
4. **DRAG the folder** from File Explorer into PowerShell
5. The path auto-fills!
6. Press **Enter**

### **Manual Way:**
Type this (replace with YOUR actual path):
```powershell
cd "C:\Users\avgel\Downloads\rollers-paradise"
```

**Common locations to try:**
```powershell
# Try these one by one until you find it:
cd "C:\Users\avgel\Desktop\rollers-paradise"
cd "C:\Users\avgel\Documents\rollers-paradise"
cd "C:\Users\avgel\Downloads\rollers-paradise"
```

---

## **Step 6: Verify You're in the Right Folder**

Type:
```powershell
dir
```

Press **Enter**

✅ **You should see these files/folders:**
- `package.json` ← This file MUST be here!
- `components`
- `utils`
- `styles`
- `App.tsx` or `src` folder

❌ **If you DON'T see `package.json`, you're in the wrong folder!** Go back to Step 5.

---

## **Step 7: NOW Install Packages**

Once you're in the **correct folder** with `package.json`, type:

```powershell
npm install
```

Press **Enter**

✅ **You should see:**
- Progress bars
- "added XXX packages"
- Takes 3-5 minutes

---

## **Step 8: Run the Game!**

After `npm install` finishes successfully, type:

```powershell
npm run dev
```

Press **Enter**

✅ **You should see:**
```
➜  Local:   http://localhost:5173/
```

**Hold Ctrl and click that link!**

🎉 **YOUR GAME IS NOW RUNNING!**

---

## 📝 Quick Summary of ALL Commands:

```powershell
# 1. Open PowerShell as ADMINISTRATOR (right-click → Run as administrator)

# 2. Enable scripts:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 3. Go to YOUR project folder (drag folder into terminal OR type path):
cd "C:\Users\avgel\path\to\rollers-paradise"

# 4. Verify you see package.json:
dir

# 5. Install packages:
npm install

# 6. Run the game:
npm run dev

# 7. Open browser to:
http://localhost:5173/
```

---

## 🔍 How to Find Your Project Folder:

### **Search for it:**
1. Press `Win + S` (opens Windows Search)
2. Type: `rollers-paradise`
3. Look for the folder in results
4. Right-click the folder → "Open file location"
5. Note the path shown in the address bar

### **Look for package.json:**
1. Press `Win + S`
2. Type: `package.json rollers`
3. Find the one in your Rollers Paradise project
4. Right-click → "Open file location"
5. This is your project folder!

---

## ❓ Common Questions:

### **Q: Do I need to run PowerShell as Admin every time?**
**A:** No! Only the FIRST time to enable scripts. After that, you can use regular PowerShell.

### **Q: What if I can't find my project folder?**
**A:** Tell me how you got the project (downloaded? created? Figma export?) and I'll help you find it!

### **Q: What if Set-ExecutionPolicy gives an error?**
**A:** Make sure you opened PowerShell as Administrator (Step 2). The title bar should say "Administrator: Windows PowerShell"

### **Q: What is RemoteSigned?**
**A:** It's a Windows security setting that allows npm and node to run scripts. It's safe and recommended for development.

---

## ✅ After This Works:

Once `npm run dev` runs successfully, you can:
1. Add your dice sound to: `public/audio/dice-roll.mp3`
2. Test the game at: http://localhost:5173/
3. Test the daily bonus system
4. Hear the natural dealer voice

**Everything will work!** 🚀

---

## 🆘 Still Stuck?

Tell me:
1. Did PowerShell open as Administrator? (Check title bar)
2. Did Set-ExecutionPolicy work? (Should show no errors)
3. Can you find your project folder? (Where did you save/download it?)
4. When you type `dir`, do you see `package.json`?

I'll help you through it! 😊
