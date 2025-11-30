# 🚀 Deploy Rollers Paradise to GitHub & Vercel

## 📋 Current Situation
- ✅ Game works at: `rollersparadise.figma.site`
- ❌ Custom domain shows: "Coming Soon" page
- 🎯 Goal: Push real game code to GitHub so Vercel deploys it

---

## 🔧 Method 1: Manual File Export (RECOMMENDED)

### Step 1: Download Figma Make Project

1. In **Figma Make**, click the **3-dot menu** (⋮) in top-left
2. Select **"Download project"**
3. This will download a `.zip` file with ALL your code

### Step 2: Prepare Your Local Environment

```bash
# Open Terminal/Command Prompt
cd Desktop

# Clone your GitHub repo
git clone https://github.com/RuskiSvarog/rollers-paradise.git
cd rollers-paradise

# Check current files
ls
```

### Step 3: Replace Placeholder Files

1. **Unzip** the downloaded Figma Make project
2. **Delete EVERYTHING** in your local `rollers-paradise` folder EXCEPT:
   - `.git` folder (hidden)
   - `.gitignore` (if it exists)
3. **Copy ALL files** from the unzipped Figma Make project into `rollers-paradise` folder

### Step 4: Push to GitHub

```bash
# Check what changed
git status

# Add all files
git add .

# Commit with message
git commit -m "Deploy Rollers Paradise casino game from Figma Make"

# Push to GitHub
git push origin main
```

### Step 5: Verify Vercel Auto-Deploy

1. Go to https://vercel.com/ruskisvarogs-projects
2. Click **"rollers-paradise"** project
3. Watch the **"Deployments"** tab - should see new deployment starting
4. Wait ~2-3 minutes for build to complete
5. Visit `rollersparadise.com` - should show your REAL casino game! 🎰

---

## 🔧 Method 2: Use GitHub Web Interface (If Git Commands Don't Work)

### Step 1: Download Project from Figma Make
(Same as Method 1, Step 1)

### Step 2: Go to GitHub Repo

1. Visit: https://github.com/RuskiSvarog/rollers-paradise
2. Click **"Add file"** → **"Upload files"**
3. **Drag ALL files** from unzipped Figma Make project
4. At bottom, click **"Commit changes"**

### Step 3: Wait for Vercel
(Same as Method 1, Step 5)

---

## ⚡ Method 3: Use Figma Make Export Feature (EASIEST)

If Figma Make has a **"Deploy to GitHub"** or **"Export to Git"** button:

1. Look for **Settings** or **Deploy** option in Figma Make
2. Connect your GitHub account
3. Select repository: `RuskiSvarog/rollers-paradise`
4. Click **Deploy** or **Push to GitHub**

---

## 🔍 Troubleshooting

### If Vercel doesn't auto-deploy:

1. Go to Vercel project → **Settings** → **Git**
2. Click **"Disconnect"**
3. Click **"Connect Git Repository"**
4. Select `RuskiSvarog/rollers-paradise`
5. Click **"Deploy"**

### If build fails:

Check that these files exist in GitHub repo:
- ✅ `package.json`
- ✅ `vite.config.ts`
- ✅ `index.html`
- ✅ `main.tsx`
- ✅ `App.tsx`

### If "Coming Soon" still shows:

1. Clear browser cache (Ctrl+Shift+Delete)
2. Try incognito/private window
3. Check Vercel deployment logs for errors

---

## 📁 Critical Files Checklist

Make sure your GitHub repo contains:

**Root Level:**
- [ ] `App.tsx`
- [ ] `main.tsx`
- [ ] `index.html`
- [ ] `package.json`
- [ ] `tsconfig.json`
- [ ] `vite.config.ts`

**Folders:**
- [ ] `/components/` (150+ files)
- [ ] `/contexts/` (10+ files)
- [ ] `/hooks/` (5+ files)
- [ ] `/utils/` (30+ files)
- [ ] `/supabase/` (server functions + migrations)
- [ ] `/styles/globals.css`
- [ ] `/public/` (manifest.json, dice-icon.svg)

**Supabase Config:**
- [ ] `/utils/supabase/info.tsx` (has your project URL)
- [ ] `/supabase/functions/server/index.tsx`

---

## 🎯 Expected Result

After deployment, `rollersparadise.com` should show:

✅ **Rollers Paradise** logo
✅ **Single Player** / **Multiplayer** mode selection  
✅ Full craps table with betting areas
✅ Dice rolling animation
✅ All membership features
✅ Admin panel (for you, Ruski)

---

## 🆘 Need Help?

If deployment fails, check:

1. **Vercel Build Logs** - Look for specific errors
2. **GitHub Repo** - Verify all files uploaded
3. **Environment Variables** - Make sure Supabase keys are set in Vercel

---

## 📞 Contact

**Admin/Owner:** Ruski  
**Email:** avgelatt@gmail.com  
**Phone:** 913-213-8666  
**Domain:** rollersparadise.com  
**Supabase:** https://kckprtabirvtmhehnczg.supabase.co

---

**GOOD LUCK! 🎰🍀**
