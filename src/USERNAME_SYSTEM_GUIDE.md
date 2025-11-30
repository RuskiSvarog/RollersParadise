# 🎯 Username Uniqueness & Account Cleanup System

## Overview

Rollers Paradise now has a comprehensive username management system that ensures:
- ✅ **Unique Usernames**: No two users can have the same username
- 🧹 **Automatic Cleanup**: Inactive accounts are deleted after 90 days
- ♻️ **Username Recycling**: Usernames become available again when accounts are deleted
- 📊 **Activity Tracking**: Every login updates the lastLogin timestamp

---

## 🔐 Username Uniqueness

### How It Works

When a user signs up:
1. The system checks all existing usernames (case-insensitive)
2. If the username is taken, signup is rejected with a clear error message
3. If available, the account is created with that unique username

### Error Messages

```
❌ "The username 'PlayerName' is already taken. Please choose a different username."
✅ Account created successfully
```

### API Endpoint

**Check Username Availability:**
```
GET /make-server-67091a4f/check-username?username=YourName

Response:
{
  "available": true,
  "username": "YourName",
  "message": "Username 'YourName' is available!"
}
```

---

## 🧹 Automatic Inactive Account Cleanup

### Cleanup Policy

**Inactivity Threshold:** 90 days (3 months)

Accounts are considered inactive if:
- `lastLogin` timestamp is older than 90 days
- OR account was created but never logged in after 90+ days

### What Gets Deleted

When an account is marked as inactive, the system deletes:
- ✅ User account data (`user:email`)
- ✅ Presence data (`presence:email`)
- ✅ Session data (`session:email`)
- ✅ Friends list (`friends:email`)
- ✅ Friend requests (`friend_requests:email`)

### Cleanup Schedule

**Automatic Cleanup:** Every day at 3:00 AM

The cron job runs hourly and checks if it's time to run cleanup.

### Manual Cleanup (Admin Only)

**Endpoint:**
```
POST /make-server-67091a4f/trigger-cleanup

Headers:
  Content-Type: application/json

Body:
{
  "adminKey": "rollers-paradise-admin-2024"
}

Response:
{
  "success": true,
  "message": "Account cleanup triggered successfully"
}
```

---

## 📊 Cleanup Statistics

### View Last Cleanup Stats

**Endpoint:**
```
GET /make-server-67091a4f/cleanup-stats

Response:
{
  "success": true,
  "stats": {
    "lastRun": "11/29/2024, 3:00:00 AM",
    "deletedCount": 5,
    "freedUsernames": [
      "InactivePlayer1",
      "OldAccount2",
      "UnusedName3"
    ]
  }
}
```

### Console Logs

During cleanup, the server logs:
```
🧹 CRON: Starting inactive account cleanup...
📊 Checking 247 accounts for inactivity...
🗑️ Deleting inactive account: PlayerName (email@example.com) - Inactive for 95 days
✅ Cleanup complete: Deleted 5 inactive accounts
📝 Freed usernames: PlayerName, OldUser, InactivePerson
```

---

## 🔄 Activity Tracking

### When lastLogin Updates

The `lastLogin` timestamp is updated:
- ✅ During signup (set to account creation time)
- ✅ During successful signin
- ✅ During PIN verification (2FA)

### Implementation

```javascript
// On signin
user.lastLogin = Date.now();
await kv.set(`user:${email}`, user);

// On PIN verification
user.lastLogin = Date.now();
await kv.set(`user:${email}`, user);
```

---

## 🎮 User Experience Benefits

### For Players

1. **Fair Usernames**: Popular usernames become available if previous owner is inactive
2. **Clean System**: No abandoned accounts cluttering the database
3. **Fresh Start**: Inactive players can rejoin with new accounts using old usernames

### For Admins (Ruski)

1. **Database Cleanup**: Automatic removal of unused data
2. **Username Pool**: More usernames available for new players
3. **Activity Metrics**: Track when users were last active

---

## 🛠️ Technical Details

### Database Structure

Each user account includes:
```javascript
{
  name: "PlayerName",           // Username (unique)
  email: "user@example.com",    // Email (unique)
  createdAt: 1234567890,        // Account creation timestamp
  lastLogin: 1234567890,        // Last login timestamp
  balance: 1000,
  stats: { ... },
  // ... other fields
}
```

### Cleanup Algorithm

```javascript
const INACTIVITY_THRESHOLD = 90 * 24 * 60 * 60 * 1000; // 90 days
const now = Date.now();

for (const user of allUsers) {
  const lastActivity = user.lastLogin || user.createdAt || now;
  const inactiveDays = (now - lastActivity) / (24 * 60 * 60 * 1000);
  
  if (now - lastActivity > INACTIVITY_THRESHOLD) {
    // Delete account and associated data
  }
}
```

---

## 📅 Cron Jobs Schedule

| Job Name | Schedule | Description |
|----------|----------|-------------|
| Weekly Leaderboard Rewards | Every Monday at midnight | Process weekly rewards |
| Monthly Leaderboard Rewards | 1st of month at midnight | Process monthly rewards |
| **Inactive Account Cleanup** | **Every day at 3:00 AM** | **Delete 90+ day inactive accounts** |

---

## ⚙️ Configuration

### Environment Variables

```bash
ADMIN_KEY=rollers-paradise-admin-2024  # For admin endpoints
```

### Adjusting Inactivity Threshold

To change the 90-day threshold, edit `/supabase/functions/server/cronJobs.tsx`:

```javascript
// Change this value (currently 90 days)
const INACTIVITY_THRESHOLD = 90 * 24 * 60 * 60 * 1000;

// Examples:
// 30 days:  30 * 24 * 60 * 60 * 1000
// 60 days:  60 * 24 * 60 * 60 * 1000
// 180 days: 180 * 24 * 60 * 60 * 1000
```

---

## 🔍 Testing

### Test Username Availability

1. Open browser console
2. Run:
```javascript
fetch('https://YOUR-PROJECT.supabase.co/functions/v1/make-server-67091a4f/check-username?username=TestName', {
  headers: { Authorization: 'Bearer YOUR-ANON-KEY' }
})
.then(r => r.json())
.then(console.log);
```

### Test Manual Cleanup (Admin)

```javascript
fetch('https://YOUR-PROJECT.supabase.co/functions/v1/make-server-67091a4f/trigger-cleanup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer YOUR-ANON-KEY'
  },
  body: JSON.stringify({
    adminKey: 'rollers-paradise-admin-2024'
  })
})
.then(r => r.json())
.then(console.log);
```

---

## ✅ System Verification

### Check Cron Jobs Are Running

Server logs should show:
```
✅ Cron jobs initialized
📅 Weekly rewards: Every Monday at midnight
📅 Monthly rewards: 1st of each month at midnight
📅 Account cleanup: Every day at 3 AM (90 days inactivity threshold)
⏰ Checking scheduled jobs at 2024-11-29T03:00:00.000Z
```

### Verify Cleanup Stats

Visit:
```
GET /make-server-67091a4f/cleanup-stats
```

---

## 📞 Owner Access

**Owner:** Ruski  
**Email:** avgelatt@gmail.com  
**Phone:** 913-213-8666

As the owner, you have full access to:
- ✅ Manual cleanup triggers
- ✅ Cleanup statistics
- ✅ Admin endpoints
- ✅ Error reporting dashboard

---

## 🎯 Summary

✅ **Unique Usernames** - No duplicates allowed, checked at signup  
✅ **90-Day Cleanup** - Inactive accounts automatically deleted  
✅ **Username Recycling** - Freed usernames available for new users  
✅ **Activity Tracking** - lastLogin updated on every signin  
✅ **Admin Control** - Manual cleanup trigger available  
✅ **Transparent Logs** - Full console logging of cleanup process  

**The system is now 100% operational and will keep the username pool fresh!** 🎲
