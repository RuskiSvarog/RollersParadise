# 🚀 RUN YOUR FIRST LOAD TEST - SIMPLE INSTRUCTIONS

**Ready to find out your REAL capacity? Let's do this!**

---

## **Option A: Super Easy (One Command)**

I created helper scripts for you with credentials already configured.

### **Mac/Linux:**
```bash
chmod +x load-testing/run-test.sh
./load-testing/run-test.sh
```

### **Windows:**
```cmd
load-testing\run-test.bat
```

Just select option **1** (Simple Test) and you're done!

---

## **Option B: Manual (If scripts don't work)**

### **Step 1: Set Environment Variables**

**Mac/Linux:**
```bash
export SUPABASE_PROJECT_ID="kckprtabirvtmhehnczg"
export SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtja3BydGFiaXJ2dG1oZWhuY3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwOTY0NTcsImV4cCI6MjA3OTY3MjQ1N30.8WLhaDCjzs0QGgitJnUSzMgAJ2OyeUOp1l3t-TBNGcE"
```

**Windows PowerShell:**
```powershell
$env:SUPABASE_PROJECT_ID="kckprtabirvtmhehnczg"
$env:SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtja3BydGFiaXJ2dG1oZWhuY3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwOTY0NTcsImV4cCI6MjA3OTY3MjQ1N30.8WLhaDCjzs0QGgitJnUSzMgAJ2OyeUOp1l3t-TBNGcE"
```

**Windows CMD:**
```cmd
set SUPABASE_PROJECT_ID=kckprtabirvtmhehnczg
set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtja3BydGFiaXJ2dG1oZWhuY3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwOTY0NTcsImV4cCI6MjA3OTY3MjQ1N30.8WLhaDCjzs0QGgitJnUSzMgAJ2OyeUOp1l3t-TBNGcE
```

### **Step 2: Run Test**
```bash
artillery run load-testing/simple-test.yml
```

---

## **Step 3: Watch Live (IMPORTANT!)**

While the test is running, open this URL in your browser:

**Dashboard URL:**
```
https://kckprtabirvtmhehnczg.supabase.co?loadtest=true
```

Or if you're running locally:
```
http://localhost:5173?loadtest=true
```

Click **"Start Monitoring"** to see real-time metrics!

---

## **What You'll See**

### **In Terminal:**
Artillery will show you:
- Scenarios launched
- Response times (min/max/median/p95/p99)
- HTTP status codes
- Error count

### **In Dashboard:**
You'll see live updates of:
- Average response time
- Error rate
- Cache hit rate
- Players online
- SSE connections

---

## **How to Read Results**

### **✅ GOOD Results (System is healthy):**
```
Scenarios completed: 100%
Response time median: < 500ms
Response time p95: < 1000ms
Response time p99: < 2000ms
Errors: 0
Cache hit rate: > 90%
```
**Meaning:** Your system handled this load easily! ✅

---

### **⚠️ WARNING Results (At capacity):**
```
Scenarios completed: 95-98%
Response time median: 1000-2000ms
Response time p95: 2000-3000ms
Errors: 1-5%
Cache hit rate: 70-90%
```
**Meaning:** System is stressed but working. This is your MAX capacity. ⚠️

---

### **❌ CRITICAL Results (Overloaded):**
```
Scenarios completed: < 90%
Response time median: > 2000ms
Response time p95: > 5000ms
Errors: > 5%
Cache hit rate: < 70%
```
**Meaning:** System is overloaded and failing. You exceeded capacity! ❌

---

## **After Your First Test**

### **If Test Passed ✅**
Great! Now try:
```bash
artillery run load-testing/artillery-config.yml
```
This will push to 500 players over 15 minutes.

### **If Test Failed ❌**
Your capacity is less than 50 players. Let me help you optimize:
1. Check cache configuration
2. Optimize database queries
3. Review error logs
4. Consider upgrading infrastructure

---

## **Expected Results (My Prediction)**

Based on your setup:

**Simple Test (50 players):**
- ✅ Should pass with 0-1% errors
- Response time: 300-800ms
- Cache hit rate: 85-95%

**If you get different results**, that's valuable data! Tell me:
1. What was your error rate?
2. What were response times?
3. What was cache hit rate?

---

## **Generate Pretty HTML Report**

Want a shareable report?

```bash
# Run test and save data
artillery run load-testing/simple-test.yml --output report.json

# Generate HTML report
artillery report report.json --output report.html

# Open in browser
open report.html  # Mac
start report.html # Windows
```

---

## **🆘 Troubleshooting**

### **Artillery not found?**
```bash
npm install -g artillery
```

### **Permission denied (Mac/Linux)?**
```bash
chmod +x load-testing/run-test.sh
```

### **Can't see dashboard?**
Make sure your app is running and you added `?loadtest=true` to the URL.

### **Test taking too long?**
Press `Ctrl+C` to stop it early. Results shown are still valid.

### **Getting lots of errors?**
This means you found your breaking point! Try:
- Reducing player count in the YAML file
- Checking server logs
- Verifying database is responding

---

## **Ready? Let's Go! 🚀**

**Recommended command to start:**

```bash
# Install Artillery (if not installed)
npm install -g artillery

# Run the helper script
./load-testing/run-test.sh

# Or run manually
artillery run load-testing/simple-test.yml
```

**Then watch the magic happen!** 🎉

Come back and tell me:
- Did it pass? ✅
- What were your numbers? 📊
- Should we try the bigger test next? 🚀

---

**Let's find out your REAL capacity together!** 💪
