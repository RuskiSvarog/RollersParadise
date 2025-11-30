# Leaderboard Rewards System - Rollers Paradise

## Overview
Automatic reward distribution system that awards top players on the leaderboard every week and month. Players receive notifications even when offline and can claim rewards when they log in.

## Features

### ✅ Automatic Reward Processing
- **Weekly Rewards**: Distributed every Monday at midnight (UTC)
- **Monthly Rewards**: Distributed on the 1st of each month at midnight (UTC)
- **Cron Jobs**: Server-side scheduled tasks run automatically without manual intervention

### 🏆 Leaderboard Categories
Rewards are given for top 10 players in each category:
1. **Total Wins** - Most wins achieved
2. **Biggest Win** - Largest single win amount
3. **Level** - Highest player level
4. **Win Rate** - Best win/loss percentage

### 💰 Reward Tiers

#### 🥇 First Place
- **$100,000 chips**
- **3x XP Boost** (24 hours)
- **🥇 Champion Badge**

#### 🥈 Second Place
- **$50,000 chips**
- **2.5x XP Boost** (24 hours)
- **🥈 Elite Badge**

#### 🥉 Third Place
- **$25,000 chips**
- **2x XP Boost** (24 hours)
- **🥉 Expert Badge**

#### 4th-5th Place
- **$10,000 chips**
- **1.5x XP Boost** (12 hours)

#### 6th-10th Place
- **$5,000 chips**
- **1.3x XP Boost** (12 hours)

## How It Works

### 1. Automatic Processing
The server runs cron jobs that check every hour if it's time to distribute rewards:
- Weekly: Every Monday at midnight
- Monthly: 1st of each month at midnight

### 2. Notification System
When rewards are processed:
- System looks at current leaderboard standings
- Awards top 10 players in each category (4 categories × 10 players = up to 40 notifications per timeframe)
- Creates notifications for each winner
- Notifications are stored in database even if player is offline

### 3. Player Experience
- **Gift icon** appears in top-right corner with notification count
- **Red badge** shows number of unclaimed rewards
- **Auto-popup** when new notifications arrive
- Players can **claim rewards** or **dismiss** notifications
- Claimed rewards are immediately added to account

### 4. Fairness
- Rewards are based on ACTUAL leaderboard standings at the time of processing
- No fake data or manipulation possible
- All rewards are equal between single and multiplayer
- Complete transparency in reward distribution

## Admin Controls

### Manual Trigger
Admins (Owner only) can manually trigger rewards for testing:
1. Access admin dashboard (Ctrl+Shift+Alt+R or ?admin-reports=true)
2. Click **"Rewards"** button
3. Enter admin key: `rollers-paradise-admin-2024`
4. Click **"Process Weekly Rewards"** or **"Process Monthly Rewards"**

### Monitoring
- View last reward processing time
- See how many rewards were distributed
- Check which players received rewards
- Track reward claim status

## Technical Implementation

### Backend Endpoints

#### GET `/notifications`
- Fetch all notifications for a player
- Query: `?email=player@email.com`

#### POST `/notifications/claim`
- Claim a reward and apply it to player account
- Body: `{ email, notificationId }`

#### POST `/notifications/read`
- Mark notification as read/dismissed
- Body: `{ email, notificationId }`

#### POST `/process-leaderboard-rewards`
- Manual trigger for reward processing
- Body: `{ timeframe: 'weekly' | 'monthly', adminKey }`

### Cron Jobs
Located in `/supabase/functions/server/cronJobs.tsx`:
- Checks every hour if scheduled time has passed
- Prevents duplicate processing with lastRun timestamps
- Handles weekly and monthly schedules independently

### Data Storage
- **Notifications**: `notifications:{email}` (array of up to 50 notifications)
- **Last Process**: `last_reward_process:{timeframe}` (timestamp and count)
- **User Boosts**: `boosts:{email}` (active XP boosts)

## Security

### Admin Access
- Only Owner (Ruski - avgelatt@gmail.com) can trigger manual rewards
- Admin key required: `rollers-paradise-admin-2024`
- Can be changed via `ADMIN_KEY` environment variable

### Cheat Prevention
- Rewards based on verified stats in database
- Cannot claim same reward twice
- Notifications expire after claiming
- No client-side manipulation possible

## Player Notification UI

### Gift Bell Icon
- Fixed top-right corner
- Glowing purple/blue gradient
- Red badge with unread count
- Hover animation

### Notification Panel
- Slides in from right side
- Shows all unclaimed rewards
- Rank badges (🥇🥈🥉🏆)
- Detailed reward breakdown
- One-click claim button
- Dismiss option

### Reward Details
Each notification shows:
- Leaderboard rank achieved
- Category (Total Wins, Biggest Win, etc.)
- Time period (Last Week/Last Month)
- Chips reward amount
- XP boost multiplier and duration
- Badge (if applicable)

## Accessibility

### For All Players (Including Elderly)
- **Large, clear text** with good contrast
- **Simple one-click** claim process
- **Visual indicators** (medals, colors, icons)
- **No time pressure** - rewards don't expire
- **Non-disruptive** - doesn't interrupt gameplay
- **Clear explanations** of what was achieved

## Timeframes

### Weekly Leaderboard
- Tracks players active in last 7 days
- Resets every Monday at midnight
- Awards distributed Monday morning

### Monthly Leaderboard
- Tracks players active in last 30 days
- Resets 1st of each month at midnight
- Awards distributed monthly

### All-Time Leaderboard
- No rewards (for viewing only)
- Shows lifetime achievements

## XP Boost Details

### Temporary Time-Limited Boosts
- **NOT permanent** - expire after set duration
- **24 hours** for top 3 ranks
- **12 hours** for ranks 4-10
- **Stackable** - multiple boosts can be active
- **Auto-applies** when claimed
- **Countdown timer** shows remaining time

### Purpose
Keeps players engaged and active:
- Incentive to use boost before expiration
- Encourages playing during boost period
- Prevents hoarding of permanent advantages

## Future Enhancements

### Potential Features
- Email notifications for offline players
- Reward history/achievement page
- Special seasonal/holiday rewards
- Streak bonuses for consecutive rankings
- Team/guild leaderboards
- Custom reward tiers for special events

---

## Quick Start for Admins

1. **Check Current System Status**
   - Login as Ruski (avgelatt@gmail.com)
   - Open admin panel: `Ctrl+Shift+Alt+R`
   - Click "Rewards" button

2. **Manually Trigger Rewards (Testing)**
   - Enter admin key
   - Click "Process Weekly Rewards"
   - View results and distributed rewards

3. **Monitor Player Notifications**
   - Players will see gift icon when rewards available
   - They can claim at any time
   - No action needed from admin

## Support

**Owner**: Ruski  
**Email**: avgelatt@gmail.com  
**Phone**: 913-213-8666

For technical issues or reward system questions, contact the owner directly.
