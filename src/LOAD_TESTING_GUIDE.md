# 🚀 LOAD TESTING GUIDE FOR ROLLERS PARADISE

**Developer:** Ruski (avgelatt@gmail.com, 913-213-8666)  
**Purpose:** Find your REAL capacity and breaking points  
**Date:** December 1, 2025

---

## 📋 TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Test Scenarios Explained](#test-scenarios-explained)
4. [How to Read Results](#how-to-read-results)
5. [What to Look For](#what-to-look-for)
6. [Troubleshooting](#troubleshooting)
7. [Upgrade Path](#upgrade-path)

---

## 🛠️ PREREQUISITES

### Install Artillery (Load Testing Tool)

```bash
# Install globally with npm
npm install -g artillery

# Verify installation
artillery --version
# Should show: artillery: 2.x.x
```

### Get Your Supabase Credentials

You need:
1. **Project ID** - Found in Supabase dashboard URL
2. **Anon Key** - Found in Settings → API

---

## ⚡ QUICK START

### Step 1: Set Environment Variables

**On Mac/Linux:**
```bash
export SUPABASE_PROJECT_ID="your-project-id"
export SUPABASE_ANON_KEY="your-anon-key"
```

**On Windows (PowerShell):**
```powershell
$env:SUPABASE_PROJECT_ID="your-project-id"
$env:SUPABASE_ANON_KEY="your-anon-key"
```

**On Windows (Command Prompt):**
```cmd
set SUPABASE_PROJECT_ID=your-project-id
set SUPABASE_ANON_KEY=your-anon-key
```

### Step 2: Run Your First Test

```bash
# Start with the simple test (50 players, 5 minutes)
artillery run load-testing/simple-test.yml

# Generate HTML report
artillery run load-testing/simple-test.yml --output report.json
artillery report report.json --output report.html
```

### Step 3: Monitor in Real-Time

1. Open your app
2. Navigate to the Load Testing Dashboard
3. Click "Start Monitoring"
4. Watch metrics update in real-time while tests run

---

## 📊 TEST SCENARIOS EXPLAINED

### 1️⃣ Simple Test (`simple-test.yml`)

**Purpose:** Baseline performance measurement  
**Load:** 50 concurrent players  
**Duration:** 5 minutes  
**Good for:** Initial testing, daily health checks

```bash
artillery run load-testing/simple-test.yml
```

**What it tests:**
- Basic lobby functionality
- Stats endpoint performance
- Room listing performance
- Database query speed

**Expected Results (Free Tier):**
- ✅ 0% error rate
- ✅ Response time < 500ms
- ✅ All requests successful

---

### 2️⃣ Artillery Config Test (`artillery-config.yml`)

**Purpose:** Realistic load testing  
**Load:** 0 → 500 players over 15 minutes  
**Duration:** 15 minutes  
**Good for:** Understanding realistic capacity

```bash
artillery run load-testing/artillery-config.yml
```

**Phases:**
1. Warm-up: 0 → 50 players (2 min)
2. Normal load: 50 → 200 players (3 min)
3. Stress: 200 → 500 players (5 min)
4. Sustained: Hold 500 players (5 min)

**What it tests:**
- Multiple user behaviors (browsing, playing, watching)
- SSE connections under load
- Database performance under sustained load
- Cache effectiveness

**Expected Results:**
- ✅ Free Tier: Should handle up to 100-200 players smoothly
- ⚠️ 200-500 players: Expect increased response times
- ❌ 500+ players: Likely to see errors on free tier

---

### 3️⃣ Stress Test (`stress-test.yml`)

**Purpose:** Find your breaking point  
**Load:** 100 → 1000+ players over 20 minutes  
**Duration:** 20 minutes  
**Good for:** Finding maximum capacity

```bash
artillery run load-testing/stress-test.yml
```

**Phases:**
1. 100 players (3 min)
2. 200 players (3 min)
3. 300 players (3 min)
4. 500 players (3 min)
5. 750 players (3 min)
6. 1000 players (3 min) - **STRESS!**

**What it tests:**
- Maximum concurrent users before failure
- System behavior under extreme load
- Error recovery mechanisms
- Database connection pool limits

**Expected Results:**
- ✅ Free Tier: 100-200 players = smooth
- ⚠️ 300-500 players = degraded performance
- ❌ 750+ players = high error rates, likely failures

---

### 4️⃣ SSE Connection Test (`sse-test.yml`)

**Purpose:** Test Server-Sent Events capacity  
**Load:** 100 simultaneous SSE connections  
**Duration:** 7 minutes  
**Good for:** Validating real-time architecture

```bash
artillery run load-testing/sse-test.yml
```

**What it tests:**
- SSE connection establishment
- Long-lived connection stability
- Edge function concurrent connection limits
- Memory usage with many connections

**Expected Results:**
- ✅ 50-100 SSE connections should work
- ⚠️ 100-200 connections may be unstable
- ❌ 200+ connections likely to fail on free tier

---

## 📈 HOW TO READ RESULTS

### Understanding Artillery Output

```
Summary report @ 14:30:15(+0000)
  Scenarios launched:  1500
  Scenarios completed: 1450
  Requests completed:  4350
  Mean response/sec:   30.5
  Response time (msec):
    min: 125
    max: 3425
    median: 450
    p95: 1250
    p99: 2100
  Scenario counts:
    Lobby Browser: 600 (40%)
    Active Player: 450 (30%)
    Game Player: 300 (20%)
  Codes:
    200: 4200
    500: 100
    503: 50
  Errors:
    ETIMEDOUT: 50
```

### Key Metrics Explained

**Scenarios Launched vs Completed:**
- **Launched:** Total users started
- **Completed:** Users who finished successfully
- **Gap indicates failures!** (1500 - 1450 = 50 failed)

**Response Time:**
- **min/max:** Fastest and slowest responses
- **median:** Middle value (50% faster, 50% slower)
- **p95:** 95% of requests faster than this
- **p99:** 99% of requests faster than this

**✅ Good Performance:**
- Median < 500ms
- p95 < 1000ms
- p99 < 2000ms

**⚠️ Warning Signs:**
- Median > 1000ms
- p95 > 2000ms
- p99 > 5000ms

**❌ Critical Issues:**
- Median > 2000ms
- p95 > 5000ms
- Error rate > 5%

**HTTP Status Codes:**
- **200:** Success ✅
- **500:** Server error ❌
- **503:** Service unavailable (overloaded) ❌
- **ETIMEDOUT:** Request timed out ❌

---

## 🔍 WHAT TO LOOK FOR

### 1. Error Rate

```
Error Rate = (Failed Requests / Total Requests) × 100
```

**Acceptable:**
- Production: < 0.1% (99.9% uptime)
- Testing: < 1%
- Load testing: < 5% (expected under extreme load)

**If error rate > 5%:**
- ❌ System is overloaded
- ❌ Database connection pool exhausted
- ❌ You've exceeded capacity

---

### 2. Response Time Trends

Watch for:

**Gradual Increase:**
```
100 players: 300ms
200 players: 500ms
300 players: 800ms
```
✅ Normal - system slowing under load

**Sudden Spike:**
```
200 players: 500ms
201 players: 5000ms
```
❌ Breaking point reached!

**Flat Performance:**
```
100 players: 300ms
200 players: 310ms
300 players: 320ms
```
✅ Excellent caching! System scales well.

---

### 3. Cache Hit Rate

Monitor in Load Testing Dashboard:

**Good Cache Performance:**
- Hit rate > 90%
- DB reads reduced dramatically
- Response times stay consistent

**Poor Cache Performance:**
- Hit rate < 70%
- DB reads still high
- Response times increase linearly

**Fix poor cache:**
- Increase TTL values
- Add more cache keys
- Optimize cache invalidation logic

---

### 4. SSE Connection Stability

In Load Testing Dashboard, watch:

**Healthy SSE:**
- Connections stay stable
- No disconnects/reconnects
- Event delivery < 1 second

**Unhealthy SSE:**
- Frequent disconnects
- Connections dropping under load
- Event delivery delayed > 5 seconds

---

## 🔧 TROUBLESHOOTING

### Issue: High Error Rates (> 5%)

**Possible Causes:**
1. Database connection pool exhausted
2. Supabase free tier limits reached
3. Network bandwidth exceeded
4. Memory limits on Edge Functions

**Solutions:**
1. Reduce concurrent users
2. Increase cache TTL
3. Optimize database queries
4. Upgrade to Supabase Pro

---

### Issue: Slow Response Times (> 2s)

**Possible Causes:**
1. Cache not working
2. Database queries not optimized
3. Too many API calls
4. Network latency

**Solutions:**
1. Check cache hit rate in dashboard
2. Add database indexes
3. Batch API calls
4. Use CDN for static assets

---

### Issue: SSE Connections Failing

**Possible Causes:**
1. Edge Function concurrent connection limit
2. Supabase free tier limits
3. Network firewall blocking SSE
4. Browser connection limits

**Solutions:**
1. Reduce concurrent SSE connections
2. Upgrade Supabase plan
3. Test from different network
4. Use connection pooling

---

### Issue: Tests Not Running

**Check:**
```bash
# 1. Artillery installed?
artillery --version

# 2. Environment variables set?
echo $SUPABASE_PROJECT_ID
echo $SUPABASE_ANON_KEY

# 3. Network access?
curl https://YOUR-PROJECT.supabase.co/functions/v1/make-server-67091a4f/health

# 4. Correct file path?
ls load-testing/
```

---

## 📊 INTERPRETING YOUR RESULTS

### Scenario 1: Free Tier Performance

**Test Results:**
```
50 players:   0% errors, 300ms avg
100 players:  1% errors, 600ms avg
200 players:  5% errors, 1200ms avg
300 players: 15% errors, 3000ms avg
```

**Interpretation:**
- ✅ **Safe capacity:** 50-100 players
- ⚠️ **Maximum capacity:** 150-200 players
- ❌ **Over capacity:** 200+ players

**Recommendation:**
- Launch with max 100 players initially
- Monitor closely
- Upgrade when consistently hitting 80+ players

---

### Scenario 2: Good Cache Performance

**Test Results:**
```
Cache hit rate: 95%
DB reads: 50/minute (with 500 players)
Response time: Flat at 400ms even at 300 players
```

**Interpretation:**
- ✅ Caching working excellently
- ✅ System scales well
- ✅ Can handle more load

**Recommendation:**
- Push testing to higher player counts
- Caching is doing its job
- Focus on SSE connection limits next

---

### Scenario 3: Breaking Point Found

**Test Results:**
```
100 players: 0.1% errors, 400ms avg
200 players: 0.5% errors, 600ms avg
250 players: 10% errors, 2500ms avg ← BREAKING POINT
```

**Interpretation:**
- ✅ Safe capacity: 200 players
- ❌ Breaking point: 250 players
- 💡 System fails between 200-250 concurrent users

**Recommendation:**
- **Production max:** 150-180 players (80% of capacity)
- Set up alerts at 150 players
- Plan infrastructure upgrade before hitting 200

---

## 🚀 UPGRADE PATH

Based on your test results, here's when to upgrade:

### Free Tier → Supabase Pro ($25/month)

**Upgrade when:**
- Consistently hitting 80+ concurrent players
- Error rate > 1% during normal operations
- Response times > 1 second regularly

**You'll get:**
- 10x more database connections
- Higher bandwidth limits
- Better performance
- Can support 300-500 players

---

### Add Redis/Upstash ($10/month)

**Upgrade when:**
- Cache hit rate drops below 85%
- Database reads still high despite caching
- Need faster response times

**You'll get:**
- Persistent, fast caching
- Better cache performance
- Reduced database load
- Can support 500-1000 players

---

### Dedicated Infrastructure ($100-500/month)

**Upgrade when:**
- Need 1000+ concurrent players
- Revenue justifies investment
- Professional operation

**You'll get:**
- Dedicated database
- Load balancing
- Auto-scaling
- Professional monitoring
- Can support 5000+ players

---

## 📋 LOAD TEST CHECKLIST

Before launching to public:

- [ ] Run simple test (50 players) - all pass
- [ ] Run artillery config (500 players) - find safe zone
- [ ] Run stress test - find breaking point
- [ ] Run SSE test - validate real-time
- [ ] Monitor with dashboard during all tests
- [ ] Document your maximum safe capacity
- [ ] Set up alerts at 80% capacity
- [ ] Plan upgrade path
- [ ] Test error recovery (intentionally crash server)
- [ ] Test during peak hours (different results!)

---

## 💰 ROI CALCULATION

### Example: Free Tier Results

**Your test shows:**
- Safe capacity: 150 players
- Breaking point: 200 players
- Error rate at 150 players: < 0.5%

**Monthly cost to operate:**
- Free tier: $0/month

**Revenue potential:**
- 150 players × $10/month VIP = $1,500/month
- At 10% conversion = $150/month revenue
- At 20% conversion = $300/month revenue

**When to upgrade:**
- When 80% capacity (120 players) = Consistent $240+/month revenue
- Upgrade to Pro ($25/month) to scale to 500 players
- New revenue potential: $500-1000/month

---

## 🎯 SUCCESS METRICS

After load testing, you should know:

1. ✅ **Maximum safe capacity** (e.g., 150 players)
2. ✅ **Breaking point** (e.g., 250 players)
3. ✅ **Error rate at capacity** (e.g., 0.5%)
4. ✅ **Average response time** (e.g., 600ms)
5. ✅ **Cache hit rate** (e.g., 92%)
6. ✅ **SSE connection limit** (e.g., 100 connections)
7. ✅ **When to upgrade** (e.g., at 120 players)
8. ✅ **Cost to scale** (e.g., $25/month to 500 players)

---

## 📞 NEXT STEPS

1. **Run tests NOW** - Don't wait for launch
2. **Document results** - Save artillery reports
3. **Set up monitoring** - Use the dashboard daily
4. **Plan upgrades** - Know your scaling path
5. **Test regularly** - Weekly health checks

---

## 🎉 READY TO TEST!

You now have:
- ✅ 4 load test configurations
- ✅ Real-time monitoring dashboard
- ✅ Complete documentation
- ✅ Upgrade path planned

**Start with:**
```bash
artillery run load-testing/simple-test.yml
```

Then work your way up to stress testing!

---

**Built by Ruski**  
*"Know your limits before your players find them!"* 🚀
