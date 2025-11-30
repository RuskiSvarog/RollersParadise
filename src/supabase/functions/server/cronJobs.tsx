// Cron Jobs for Leaderboard Rewards and Account Cleanup
// This file contains scheduled jobs that run automatically

import * as kv from './kv_store.tsx';

const ADMIN_KEY = Deno.env.get('ADMIN_KEY') || 'rollers-paradise-admin-2024';
const SERVER_URL = Deno.env.get('SUPABASE_URL')?.replace('//', '//').replace('https://', 'https://');

interface CronJob {
  name: string;
  schedule: string; // cron format
  handler: () => Promise<void>;
  lastRun?: number;
}

// Process weekly leaderboard rewards every Monday at midnight
async function processWeeklyRewards() {
  console.log('🏆 CRON: Processing weekly leaderboard rewards...');
  
  try {
    const response = await fetch(
      `${SERVER_URL}/functions/v1/make-server-67091a4f/process-leaderboard-rewards`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeframe: 'weekly',
          adminKey: ADMIN_KEY,
        }),
      }
    );

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Weekly rewards processed: ${data.rewardsProcessed} rewards`);
    } else {
      console.error('❌ Weekly rewards processing failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Error processing weekly rewards:', error);
  }
}

// Process monthly leaderboard rewards on the 1st of each month at midnight
async function processMonthlyRewards() {
  console.log('🏆 CRON: Processing monthly leaderboard rewards...');
  
  try {
    const response = await fetch(
      `${SERVER_URL}/functions/v1/make-server-67091a4f/process-leaderboard-rewards`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeframe: 'monthly',
          adminKey: ADMIN_KEY,
        }),
      }
    );

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Monthly rewards processed: ${data.rewardsProcessed} rewards`);
    } else {
      console.error('❌ Monthly rewards processing failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Error processing monthly rewards:', error);
  }
}

// ========================================
// INACTIVE ACCOUNT CLEANUP SYSTEM
// ========================================
// Delete accounts that haven't logged in for 90 days (3 months)
// This frees up usernames for new players
async function cleanupInactiveAccounts() {
  console.log('🧹 CRON: Starting inactive account cleanup...');
  
  try {
    const INACTIVITY_THRESHOLD = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
    const now = Date.now();
    
    // Get all users
    const allUsers = await kv.getByPrefix('user:');
    
    if (!allUsers || allUsers.length === 0) {
      console.log('ℹ️ No users found in database');
      return;
    }
    
    console.log(`📊 Checking ${allUsers.length} accounts for inactivity...`);
    
    let deletedCount = 0;
    const deletedUsernames: string[] = [];
    
    for (const user of allUsers) {
      if (!user || !user.email) continue;
      
      // Get last login time (default to creation time if never logged in after creation)
      const lastActivity = user.lastLogin || user.createdAt || now;
      const inactiveDays = Math.floor((now - lastActivity) / (24 * 60 * 60 * 1000));
      
      // Check if account is inactive
      if (now - lastActivity > INACTIVITY_THRESHOLD) {
        console.log(`🗑️ Deleting inactive account: ${user.name} (${user.email}) - Inactive for ${inactiveDays} days`);
        
        // Delete the user account
        await kv.del(`user:${user.email}`);
        
        // Delete associated data
        await kv.del(`presence:${user.email}`);
        await kv.del(`session:${user.email}`);
        await kv.del(`friends:${user.email}`);
        await kv.del(`friend_requests:${user.email}`);
        
        deletedCount++;
        deletedUsernames.push(user.name);
      }
    }
    
    if (deletedCount > 0) {
      console.log(`✅ Cleanup complete: Deleted ${deletedCount} inactive accounts`);
      console.log(`📝 Freed usernames: ${deletedUsernames.join(', ')}`);
      
      // Store cleanup stats
      await kv.set('stats:last_cleanup', {
        timestamp: now,
        deletedCount,
        deletedUsernames,
      });
    } else {
      console.log('✅ No inactive accounts found - all users are active!');
    }
    
  } catch (error) {
    console.error('❌ Error during account cleanup:', error);
  }
}

// Check if it's time to run a job based on schedule
function shouldRunJob(schedule: string, lastRun?: number): boolean {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentHour = now.getHours();
  const currentDate = now.getDate();

  // If never run or last run was more than 23 hours ago
  if (!lastRun || Date.now() - lastRun > 23 * 60 * 60 * 1000) {
    // Weekly job (every Monday at midnight)
    if (schedule === 'weekly' && currentDay === 1 && currentHour === 0) {
      return true;
    }

    // Monthly job (1st of month at midnight)
    if (schedule === 'monthly' && currentDate === 1 && currentHour === 0) {
      return true;
    }

    // Daily job (every day at 3 AM)
    if (schedule === 'daily' && currentHour === 3) {
      return true;
    }
  }

  return false;
}

// Initialize and run cron jobs
export function initializeCronJobs() {
  console.log('⏰ Initializing cron jobs for leaderboard rewards and account cleanup...');

  const jobs: CronJob[] = [
    {
      name: 'Weekly Leaderboard Rewards',
      schedule: 'weekly',
      handler: processWeeklyRewards,
    },
    {
      name: 'Monthly Leaderboard Rewards',
      schedule: 'monthly',
      handler: processMonthlyRewards,
    },
    {
      name: 'Inactive Account Cleanup',
      schedule: 'daily',
      handler: cleanupInactiveAccounts,
    },
  ];

  // Check every hour if jobs need to run
  setInterval(async () => {
    const now = new Date();
    console.log(`⏰ Checking scheduled jobs at ${now.toISOString()}`);

    for (const job of jobs) {
      if (shouldRunJob(job.schedule, job.lastRun)) {
        console.log(`🚀 Running job: ${job.name}`);
        await job.handler();
        job.lastRun = Date.now();
      }
    }
  }, 60 * 60 * 1000); // Check every hour

  console.log('✅ Cron jobs initialized');
  console.log('📅 Weekly rewards: Every Monday at midnight');
  console.log('📅 Monthly rewards: 1st of each month at midnight');
  console.log('📅 Account cleanup: Every day at 3 AM (90 days inactivity threshold)');
}

// Manual trigger endpoint (for testing or admin use)
export async function manualTrigger(timeframe: 'weekly' | 'monthly' | 'cleanup') {
  console.log(`🎯 Manual trigger: ${timeframe}`);
  
  if (timeframe === 'weekly') {
    await processWeeklyRewards();
  } else if (timeframe === 'monthly') {
    await processMonthlyRewards();
  } else if (timeframe === 'cleanup') {
    await cleanupInactiveAccounts();
  }
}
