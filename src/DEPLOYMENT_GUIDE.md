# 🎲 Rollers Paradise - Vercel Deployment Guide

## Quick Deployment Steps

### Step 1: Get Your Supabase Keys

1. Go to: https://supabase.com/dashboard/project/kckprtabirvtmhehnczg/settings/api
2. Copy these two keys:
   - **Project URL**: `https://kckprtabirvtmhehnczg.supabase.co`
   - **anon/public key**: (long string starting with "eyJ...")

---

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel CLI (Fastest)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from your project directory**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project? → **No**
   - Project name? → **rollers-paradise**
   - Directory? → **./  (just press Enter)**
   - Want to modify settings? → **No**

5. **Add Environment Variables** (when prompted or after):
   ```bash
   vercel env add VITE_SUPABASE_URL
   # Paste: https://kckprtabirvtmhehnczg.supabase.co

   vercel env add VITE_SUPABASE_ANON_KEY
   # Paste your anon key
   ```

6. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

#### Option B: Deploy via Vercel Dashboard (Easier)

1. **Go to**: https://vercel.com/new

2. **Import Git Repository**:
   - Click "Add New Project"
   - Import your GitHub/GitLab repo
   - OR upload your project folder directly

3. **Configure Project**:
   - Framework Preset: **Vite**
   - Root Directory: **./  (leave as is)**
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Add Environment Variables**:
   Click "Environment Variables" and add:
   
   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | `https://kckprtabirvtmhehnczg.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | Your anon key from Supabase |

5. **Click "Deploy"** 🚀

---

### Step 3: Connect Custom Domain

1. **In Vercel Dashboard**:
   - Go to your project
   - Click **"Settings"** → **"Domains"**
   - Add domain: `rollersparadise.com`

2. **Vercel will show DNS instructions** like:

   ```
   A Record:
   Type: A
   Name: @
   Value: 76.76.21.21
   TTL: Auto

   CNAME Record:
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: Auto
   ```

3. **Update GoDaddy DNS**:
   - Login to GoDaddy
   - Go to your domain → DNS Management
   - Delete any existing A or CNAME records for @ and www
   - Add the records Vercel provided

4. **Wait for DNS propagation** (5-30 minutes)

5. **Verify**: Visit https://rollersparadise.com 🎉

---

### Step 4: Configure SSL (Automatic)

Vercel automatically provisions SSL certificates via Let's Encrypt. Your site will be available at:
- ✅ https://rollersparadise.com
- ✅ https://www.rollersparadise.com
- ✅ https://rollers-paradise.vercel.app (Vercel subdomain)

---

## Important Notes

### Environment Variables
- Your Supabase keys are already configured in the backend
- The frontend needs access to:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- These are prefixed with `VITE_` so they're available in the browser

### Backend (Supabase Edge Functions)
- Your backend stays on Supabase at:
  `https://kckprtabirvtmhehnczg.supabase.co/functions/v1/make-server-67091a4f`
- No changes needed to backend code
- All API calls will continue working

### Testing Your Deployment

After deployment, test these features:
- ✅ Homepage loads
- ✅ Sign up/Login works
- ✅ Single player game works
- ✅ Multiplayer lobby connects
- ✅ Voice chat functions
- ✅ Membership purchases work
- ✅ Admin panel accessible (your email only)

---

## Troubleshooting

### "Module not found" errors
- Make sure all dependencies are in package.json
- Run `npm install` before deploying

### "Build failed"
- Check Vercel build logs
- Ensure TypeScript has no errors
- Verify all imports are correct

### Environment variables not working
- Ensure they start with `VITE_`
- Redeploy after adding variables
- Check Vercel dashboard → Settings → Environment Variables

### Domain not connecting
- Wait 30 minutes for DNS propagation
- Use https://dnschecker.org to verify DNS changes
- Make sure you deleted old DNS records in GoDaddy

---

## Post-Deployment Checklist

- [ ] Site loads at rollersparadise.com
- [ ] SSL certificate is active (https works)
- [ ] Sign up/login functional
- [ ] Single player mode works
- [ ] Multiplayer mode works
- [ ] Voice chat enabled
- [ ] Admin panel accessible (as Ruski)
- [ ] Membership system functional
- [ ] All betting areas responsive

---

## Support

If you have issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify Supabase API keys are correct
4. Test on different devices/browsers

Your app is production-ready! 🎲🎰✨
