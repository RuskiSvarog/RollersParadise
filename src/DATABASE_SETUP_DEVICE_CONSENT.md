# 🗄️ Database Setup for Device Consent

**IMPORTANT:** You MUST run the SQL migration to enable device consent storage!

---

## ⚡ Quick Setup (3 Steps)

### **Step 1: Open Supabase Dashboard**
1. Go to https://supabase.com
2. Select your project
3. Click "SQL Editor" in sidebar

### **Step 2: Run Migration**
1. Click "New query"
2. Copy **ALL** contents from `/DATABASE_DEVICE_CONSENT.sql`
3. Paste into SQL editor
4. Click "Run" (or press Ctrl+Enter)

### **Step 3: Verify**
1. Click "Table Editor" in sidebar
2. Look for `device_consents` table
3. You should see all columns listed below

---

## ✅ What Gets Created

### **Tables:**
- ✅ `device_consents` - Main table for device information

### **Indexes:**
- ✅ `idx_device_consents_user_id` - User lookups
- ✅ `idx_device_consents_device_type` - Analytics
- ✅ `idx_device_consents_ip_address` - Fraud detection
- ✅ `idx_device_consents_created_at` - Time queries
- ✅ `idx_device_consents_car_browsers` - Safety monitoring
- ✅ `idx_device_consents_tesla` - Tesla tracking
- ✅ `idx_device_consents_user_created` - User history

### **Functions:**
- ✅ `get_user_device_history(user_id)` - Get user's devices
- ✅ `check_suspicious_devices(ip_address)` - Fraud detection
- ✅ `get_device_type_stats()` - Analytics
- ✅ `update_user_last_device_consent()` - Trigger function

### **RLS Policies:**
- ✅ Users can view own device consents
- ✅ Service role can manage all
- ✅ Anyone can insert (for registration)

### **Triggers:**
- ✅ Auto-update user's last device consent timestamp

---

## 📋 Table Schema

```sql
device_consents (
  id                 UUID PRIMARY KEY
  user_id            UUID (nullable - might not be logged in)
  
  -- Device Type
  device_type        TEXT NOT NULL
  device_model       TEXT
  
  -- OS
  os                 TEXT NOT NULL
  os_version         TEXT
  
  -- Browser
  browser            TEXT NOT NULL
  browser_version    TEXT
  
  -- Screen
  screen_width       INTEGER NOT NULL
  screen_height      INTEGER NOT NULL
  screen_resolution  TEXT NOT NULL
  pixel_ratio        DECIMAL(4,2) NOT NULL
  orientation        TEXT NOT NULL
  
  -- Hardware
  cores              INTEGER
  memory             INTEGER
  touch_support      BOOLEAN NOT NULL
  connection         TEXT
  
  -- Special Flags
  is_tesla           BOOLEAN NOT NULL DEFAULT false
  is_car_browser     BOOLEAN NOT NULL DEFAULT false
  is_tv              BOOLEAN NOT NULL DEFAULT false
  is_gaming_console  BOOLEAN NOT NULL DEFAULT false
  
  -- Raw Data
  user_agent         TEXT NOT NULL
  platform           TEXT NOT NULL
  
  -- Location
  timezone           TEXT NOT NULL
  language           TEXT NOT NULL
  ip_address         TEXT NOT NULL
  
  -- Consent
  consent_given      BOOLEAN NOT NULL DEFAULT true
  consent_timestamp  TIMESTAMPTZ NOT NULL
  
  -- Timestamps
  detected_at        TIMESTAMPTZ NOT NULL
  created_at         TIMESTAMPTZ DEFAULT NOW()
  
  -- Metadata
  metadata           JSONB
)
```

---

## 🧪 Test Queries

### **After Migration, Test These:**

```sql
-- 1. Check table exists
SELECT * FROM device_consents LIMIT 1;

-- 2. Check indexes
SELECT indexname FROM pg_indexes 
WHERE tablename = 'device_consents';

-- 3. Check RLS is enabled
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'device_consents';

-- 4. Test helper function
SELECT * FROM get_device_type_stats();
```

---

## 🔍 Useful Queries After Setup

### **View All Device Consents:**
```sql
SELECT 
  device_type,
  device_model,
  os,
  browser,
  is_tesla,
  is_car_browser,
  created_at
FROM device_consents
ORDER BY created_at DESC
LIMIT 50;
```

### **Count by Device Type:**
```sql
SELECT 
  device_type,
  COUNT(*) as total,
  COUNT(DISTINCT user_id) as unique_users
FROM device_consents
GROUP BY device_type
ORDER BY total DESC;
```

### **Find Tesla Users:**
```sql
SELECT 
  user_id,
  device_model,
  screen_resolution,
  created_at
FROM device_consents
WHERE is_tesla = true
ORDER BY created_at DESC;
```

### **Find Suspicious IPs (Multiple Accounts):**
```sql
SELECT 
  ip_address,
  COUNT(DISTINCT user_id) as user_count,
  COUNT(*) as device_count
FROM device_consents
GROUP BY ip_address
HAVING COUNT(DISTINCT user_id) > 3
ORDER BY user_count DESC;
```

### **Recent Consents:**
```sql
SELECT 
  device_type,
  os,
  browser,
  screen_resolution,
  ip_address,
  created_at
FROM device_consents
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

---

## ⚠️ Important Notes

### **1. Run Migration ONCE**
- Don't run the migration multiple times
- It has `IF NOT EXISTS` checks, but still...
- If you need to reset, drop table first

### **2. Environment Variables**
Make sure these are set in your `.env` file:
```bash
VITE_SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### **3. API Endpoint**
The API endpoint `/api/device-consent.ts` requires:
- Supabase project URL
- Service role key (for RLS bypass)
- Vercel deployment (or local dev)

### **4. Testing Locally**
```bash
# 1. Start local Supabase (if using)
supabase start

# 2. Run migration
supabase db reset

# 3. Or apply migration
cat DATABASE_DEVICE_CONSENT.sql | supabase db execute
```

---

## 🔒 Security Checklist

Before going live:

- ✅ RLS policies enabled
- ✅ Service role key is SECRET (never expose)
- ✅ API endpoint rate-limited
- ✅ IP addresses hashed (optional - for privacy)
- ✅ Data retention policy set
- ✅ GDPR compliance documented
- ✅ Privacy policy updated
- ✅ User consent properly stored

---

## 📊 Monitoring

### **Things to Monitor:**

1. **Device Type Distribution**
   ```sql
   SELECT * FROM get_device_type_stats();
   ```

2. **Tesla/Car Usage**
   ```sql
   SELECT COUNT(*) FROM device_consents 
   WHERE is_car_browser = true;
   ```

3. **Suspicious Activity**
   ```sql
   SELECT * FROM check_suspicious_devices('ip-here');
   ```

4. **Growth Over Time**
   ```sql
   SELECT DATE(created_at), COUNT(*) 
   FROM device_consents 
   GROUP BY DATE(created_at) 
   ORDER BY DATE(created_at) DESC;
   ```

---

## 🚨 Troubleshooting

### **Error: "Table does not exist"**
**Solution:** Run the migration SQL file

### **Error: "Permission denied"**
**Solution:** Check RLS policies, use service role key

### **Error: "Column does not exist"**
**Solution:** Migration didn't complete - check Supabase logs

### **No Data Showing Up**
**Solution:** 
1. Check API endpoint is working
2. Check browser console for errors
3. Verify consent modal is showing
4. Check Supabase logs

### **Cannot Insert**
**Solution:**
1. Verify RLS policy allows inserts
2. Check API endpoint CORS settings
3. Ensure service role key is correct

---

## 📝 Migration Checklist

```
✅ [ ] Opened Supabase dashboard
✅ [ ] Clicked SQL Editor
✅ [ ] Created new query
✅ [ ] Copied DATABASE_DEVICE_CONSENT.sql contents
✅ [ ] Pasted into editor
✅ [ ] Clicked Run
✅ [ ] Saw success messages
✅ [ ] Verified table exists (Table Editor)
✅ [ ] Ran test queries
✅ [ ] Checked indexes created
✅ [ ] Verified RLS enabled
✅ [ ] Tested helper functions
✅ [ ] Updated .env with keys
✅ [ ] Tested API endpoint
✅ [ ] Tested frontend consent modal
✅ [ ] Verified data being stored
✅ [ ] Set up monitoring queries
✅ [ ] Documented for team
```

**If ALL checkboxes are ✅, you're ready!**

---

## 🎉 Success Criteria

**Your setup is complete when:**

1. ✅ Table exists in Supabase
2. ✅ Indexes are created
3. ✅ RLS is enabled
4. ✅ Helper functions work
5. ✅ Frontend shows consent modal
6. ✅ User can accept consent
7. ✅ Data appears in table
8. ✅ API endpoint responds
9. ✅ Queries return results
10. ✅ No errors in console

---

## 🔗 Related Files

- `/DATABASE_DEVICE_CONSENT.sql` - The migration file
- `/api/device-consent.ts` - API endpoint
- `/utils/deviceDetection.ts` - Detection logic
- `/components/DeviceConsentModal.tsx` - UI modal
- `/DEVICE_DETECTION_COMPLIANCE.md` - Full documentation

---

**🎰 Ready to Track Devices Compliantly! 🎲**

**Last Updated:** November 28, 2025
