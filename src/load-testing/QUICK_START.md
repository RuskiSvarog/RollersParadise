# ⚡ QUICK START - Load Testing in 5 Minutes

## Step 1: Install Artillery (one-time setup)

```bash
npm install -g artillery
```

## Step 2: Set Your Credentials

**Find in Supabase Dashboard:**
- Project ID: In your dashboard URL
- Anon Key: Settings → API

**Mac/Linux:**
```bash
export SUPABASE_PROJECT_ID="YOUR_PROJECT_ID_HERE"
export SUPABASE_ANON_KEY="YOUR_ANON_KEY_HERE"
```

**Windows PowerShell:**
```powershell
$env:SUPABASE_PROJECT_ID="YOUR_PROJECT_ID_HERE"
$env:SUPABASE_ANON_KEY="YOUR_ANON_KEY_HERE"
```

## Step 3: Run Your First Test

```bash
# Change to your project directory
cd /path/to/rollers-paradise

# Run simple test (50 players, 5 minutes)
artillery run load-testing/simple-test.yml
```

## Step 4: Monitor Live

While test runs:
1. Open your app in browser
2. Add `/load-testing-dashboard` to URL
3. Click "Start Monitoring"
4. Watch real-time metrics!

---

## 🎯 What You'll Learn

After 5 minutes, you'll know:
- ✅ Can your system handle 50 players?
- ✅ What's your average response time?
- ✅ Is caching working?
- ✅ Any errors under load?

---

## 📊 Understanding Results

### Good Results ✅
```
Scenarios completed: 100%
Response time (median): < 500ms
Errors: 0
```
→ **You can handle this load!**

### Warning Signs ⚠️
```
Scenarios completed: 95%
Response time (median): 1000-2000ms
Errors: 1-5%
```
→ **System stressed, at capacity**

### Critical Issues ❌
```
Scenarios completed: < 90%
Response time (median): > 2000ms
Errors: > 5%
```
→ **System overloaded, reduce load**

---

## 🚀 Next Steps

1. **If test passed** → Try `artillery-config.yml` (500 players)
2. **If test failed** → Optimize caching, upgrade infrastructure
3. **Find breaking point** → Run `stress-test.yml`

---

## 💡 Pro Tips

1. **Start small** - Don't jump to 1000 players immediately
2. **Test during development** - Not just before launch
3. **Monitor live** - Watch the dashboard during tests
4. **Save reports** - `--output report.json` to track over time
5. **Test weekly** - Performance can degrade over time

---

## 🆘 Having Issues?

**Tests won't run?**
```bash
# Check Artillery installed
artillery --version

# Check environment variables
echo $SUPABASE_PROJECT_ID
```

**Getting errors?**
- Check your anon key is correct
- Verify your Supabase project is running
- Test manually first: Visit your app, does it work?

**Need help?**
Read the full guide: `/LOAD_TESTING_GUIDE.md`

---

**That's it! You're ready to load test! 🎉**
