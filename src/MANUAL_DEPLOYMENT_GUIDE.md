# 🎯 MANUAL DEPLOYMENT GUIDE - Figma Make to GitHub

## 📋 THE SITUATION

**Figma Make** (where you are now):
- Has ALL your casino game code
- Works at rollersparadise.figma.site
- NO automatic export to GitHub

**GitHub** (RuskiSvarog/rollers-paradise):
- Has old placeholder code
- Needs the REAL game code
- Connected to Vercel

---

## ✅ SOLUTION: Copy Files Manually

You need to copy each file from Figma Make's code editor to GitHub's web editor.

---

## 🚀 METHOD 1: GitHub Web Interface (EASIEST)

### Step 1: Open Two Browser Tabs

**Tab 1:** Figma Make (where you are now)
**Tab 2:** https://github.com/RuskiSvarog/rollers-paradise

### Step 2: Copy Core Files First

For EACH file below:

1. **In Figma Make:** Click the file in the left sidebar
2. **Select ALL code** (Ctrl+A or Cmd+A)
3. **Copy** (Ctrl+C or Cmd+C)
4. **In GitHub:** Navigate to the file
5. Click the **pencil icon** (Edit this file)
6. **Delete all existing code**
7. **Paste** your copied code (Ctrl+V or Cmd+V)
8. Click **"Commit changes"**
9. Add message: "Update [filename] from Figma Make"
10. Click **"Commit changes"** again

**CRITICAL FILES TO COPY (in this order):**

1. `App.tsx` ⭐ MOST IMPORTANT
2. `main.tsx`
3. `index.html`
4. `package.json`
5. `vite.config.ts`
6. `tsconfig.json`

### Step 3: Copy Component Files

Navigate to the `components` folder in GitHub and update these files:

**Main Game Components (CRITICAL):**
- `CrapsGame.tsx`
- `CrapsTable.tsx`
- `BettingArea.tsx`
- `DiceRoller.tsx`
- `ModeSelection.tsx`
- `MultiplayerCrapsGame.tsx`
- `AdminPanel.tsx`
- `MembershipModal.tsx`

**Other Components (do these if you have time):**
- All files in `/components/ui/` folder
- All other component files

### Step 4: Copy Critical Utility Files

In the `utils` folder:

- `utils/supabase/client.tsx`
- `utils/supabase/info.tsx` ⭐ CRITICAL (has your Supabase URL)
- `utils/cloudStorage.ts`
- `utils/adminPermissions.ts`

### Step 5: Copy Supabase Server Files

In `supabase/functions/server/`:

- `index.tsx` ⭐ CRITICAL
- `sse.tsx`
- `youtube.tsx`
- `caching.tsx`

### Step 6: Copy Styles

- `styles/globals.css`

---

## 🚀 METHOD 2: Use Git Locally (If You Have Git Installed)

### Step 1: Clone Your Repo

```bash
cd Desktop
git clone https://github.com/RuskiSvarog/rollers-paradise.git
cd rollers-paradise
```

### Step 2: Create Script to Copy Files

Since I can see all your files in Figma Make, you need to manually create each file locally, then push to GitHub.

Unfortunately, there's no automatic way to extract files from Figma Make.

---

## 🎯 FASTEST PATH TO GET WORKING

### MINIMUM FILES NEEDED:

If you copy JUST these files, your game should deploy:

1. ✅ `App.tsx`
2. ✅ `main.tsx` 
3. ✅ `index.html`
4. ✅ `package.json`
5. ✅ `vite.config.ts`
6. ✅ `styles/globals.css`
7. ✅ `utils/supabase/info.tsx`

Then copy these FOLDERS (create each file inside):
- `/components/` (ALL files - this is the big one)
- `/contexts/`
- `/utils/`
- `/supabase/`

---

## ⚡ ALTERNATIVE: Ask Figma Support

Since Figma Make doesn't have an export feature, you could:

1. Contact Figma Make support
2. Ask if there's a way to export/download the project
3. Or ask for API access to extract files

---

## 🆘 I CAN HELP!

If you want, I can:

1. **Show you the contents of specific files** - just ask "show me App.tsx"
2. **Create a ZIP file listing** - I'll tell you exactly what each file contains
3. **Generate deployment scripts** - though you'd still need to run them locally

---

## 📞 CONTACT

**Owner:** Ruski  
**Email:** avgelatt@gmail.com  
**GitHub:** https://github.com/RuskiSvarog
**Domain:** rollersparadise.com

---

**Let me know which method you want to try!** 🚀
