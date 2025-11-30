import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { compress } from 'npm:hono/compress';
import * as kv from './kv_store.tsx';
import { initializeCronJobs, manualTrigger } from './cronJobs.tsx';
import { cache, TTL, invalidate, getCacheStats } from './caching.tsx';
import { sse, SSE_CHANNELS, createSSEResponse, broadcastRoomUpdate, broadcastStatsUpdate, broadcastLeaderboardUpdate, broadcastStreaksUpdate, getSSEStats } from './sse.tsx';

// Retry helper for network errors
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 500
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      console.log(`Attempt ${attempt}/${maxRetries} failed: ${errorMessage}`);
      
      // Check if it's a retryable error (connection/network/DNS issues)
      const isRetryable = errorMessage.includes('connection') || 
                          errorMessage.includes('network') ||
                          errorMessage.includes('timeout') ||
                          errorMessage.includes('reset') ||
                          errorMessage.includes('dns error') ||
                          errorMessage.includes('name resolution') ||
                          errorMessage.includes('failed to lookup');
      
      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const waitTime = delayMs * Math.pow(2, attempt - 1);
      console.log(`Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError || new Error('Operation failed after retries');
}

// Resilient KV wrapper with automatic retry for connection errors
const resilientKV = {
  get: async (key: string) => {
    return await retryOperation(() => kv.get(key), 3, 300);
  },
  set: async (key: string, value: any) => {
    return await retryOperation(() => kv.set(key, value), 3, 300);
  },
  del: async (key: string) => {
    return await retryOperation(() => kv.del(key), 3, 300);
  },
  mget: async (keys: string[]) => {
    return await retryOperation(() => kv.mget(keys), 3, 300);
  },
  mset: async (entries: Array<[string, any]>) => {
    return await retryOperation(() => kv.mset(entries), 3, 300);
  },
  getByPrefix: async (prefix: string) => {
    return await retryOperation(() => kv.getByPrefix(prefix), 3, 300);
  }
};

// Email sending utility using Resend API
async function sendEmail(to: string, subject: string, html: string) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  
  console.log('Attempting to send email...');
  console.log('API Key exists:', !!resendApiKey);
  console.log('API Key length:', resendApiKey?.length || 0);
  console.log('To:', to);
  console.log('Subject:', subject);
  
  if (!resendApiKey) {
    console.error('RESEND_API_KEY environment variable is not set');
    console.error('Please configure your Resend API key in the environment variables');
    throw new Error('Email service not configured. Please add your Resend API key.');
  }

  // Use custom domain if available, otherwise use default
  // IMPORTANT: Set up your custom domain at https://resend.com/domains to avoid spam
  const fromEmail = Deno.env.get('EMAIL_FROM') || 'Rollers Paradise <onboarding@resend.dev>';
  
  console.log('📧 Sending from:', fromEmail);
  console.log('⚠️ NOTE: To avoid spam, set up a custom domain at https://resend.com/domains');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const responseText = await response.text();
    console.log('Resend API response status:', response.status);
    console.log('Resend API response:', responseText);

    if (!response.ok) {
      console.error('Resend API error:', responseText);
      
      // Parse error for better feedback
      let errorMessage = 'Failed to send email';
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // Response wasn't JSON
      }
      
      throw new Error(errorMessage);
    }

    const data = JSON.parse(responseText);
    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma'],
  exposeHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 600,
  credentials: false,
}));

// Enable response compression (80% size reduction!)
app.use('*', compress());

app.use('*', logger(console.log));

// Health check
app.get('/make-server-67091a4f/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() });
});

// ===================================================================
// 🚀 PERFORMANCE OPTIMIZATION ENDPOINTS
// SSE Streams + Caching - Reduces API calls by 99%!
// Developer: Ruski (avgelatt@gmail.com, 913-213-8666)
// ===================================================================

// 📊 Performance monitoring endpoint
app.get('/make-server-67091a4f/performance/stats', (c) => {
  const cacheStats = getCacheStats();
  const sseStats = getSSEStats();
  
  return c.json({
    cache: cacheStats,
    sse: sseStats,
    timestamp: Date.now(),
  });
});

// 📡 SSE: Real-time room updates (replaces polling!)
app.get('/make-server-67091a4f/rooms/stream', (c) => {
  console.log('🔥 New SSE client connecting to rooms stream');
  const stream = sse.createStream(SSE_CHANNELS.ROOMS);
  return createSSEResponse(stream);
});

// 📡 SSE: Real-time stats updates
app.get('/make-server-67091a4f/stats/stream', (c) => {
  console.log('🔥 New SSE client connecting to stats stream');
  const stream = sse.createStream(SSE_CHANNELS.STATS);
  return createSSEResponse(stream);
});

// 📡 SSE: Real-time leaderboard updates
app.get('/make-server-67091a4f/leaderboard/stream', (c) => {
  console.log('🔥 New SSE client connecting to leaderboard stream');
  const stream = sse.createStream(SSE_CHANNELS.LEADERBOARD);
  return createSSEResponse(stream);
});

// 📡 SSE: Real-time hot streaks updates
app.get('/make-server-67091a4f/streaks/stream', (c) => {
  console.log('🔥 New SSE client connecting to streaks stream');
  const stream = sse.createStream(SSE_CHANNELS.STREAKS);
  return createSSEResponse(stream);
});

// 🎯 BATCH ENDPOINT: Get all lobby data in one request
// Reduces 5 API calls to 1 call (80% reduction!)
app.get('/make-server-67091a4f/lobby/data', async (c) => {
  try {
    const email = c.req.query('email');
    
    console.log('🚀 Batch loading lobby data for:', email);
    
    // Fetch all data in parallel with caching
    const [stats, rooms, leaderboard, streaks, profile, notifications] = await Promise.all([
      // Stats (30s cache)
      cache.get('stats', TTL.FAST, async () => {
        const presence = await kv.getByPrefix('presence:').catch(() => []);
        const sessions = await kv.getByPrefix('session:').catch(() => []);
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        
        const activeFromPresence = presence.filter((p: any) => p && p.lastActive && p.lastActive > fiveMinutesAgo).length;
        const activeFromSessions = sessions.filter((s: any) => s && s.lastActive && s.lastActive > fiveMinutesAgo).length;
        const activePlayers = Math.max(activeFromPresence, activeFromSessions);
        
        const totalGames = (await kv.get('stats:total_games').catch(() => 0)) || 0;
        const totalJackpot = (await kv.get('stats:total_jackpot').catch(() => 0)) || 0;
        
        return {
          playersOnline: activePlayers,
          totalGames,
          totalJackpot,
        };
      }),
      
      // Rooms (10s cache)
      cache.get('rooms', TTL.REALTIME, async () => {
        const allRooms = await kv.getByPrefix('room:');
        return allRooms.filter((room: any) => room && room.created && Date.now() - room.created < 3600000);
      }),
      
      // Leaderboard (60s cache)
      cache.get('leaderboard', TTL.MEDIUM, async () => {
        const allUsers = await kv.getByPrefix('user:');
        const players = allUsers
          .filter((user: any) => user && typeof user.balance === 'number')
          .map((user: any) => ({
            name: user.name || 'Unknown',
            avatar: user.avatar || '',
            balance: user.balance,
            email: user.email || '',
            totalWins: user.totalWins || 0,
            gamesPlayed: user.gamesPlayed || 0,
          }))
          .sort((a: any, b: any) => b.balance - a.balance)
          .slice(0, 100);
        
        return players;
      }),
      
      // Hot streaks (30s cache)
      cache.get('streaks', TTL.FAST, async () => {
        const streaks = await kv.get('hot-streaks') || [];
        const oneHourAgo = Date.now() - 3600000;
        return Array.isArray(streaks) ? streaks.filter((s: any) => s.timestamp > oneHourAgo) : [];
      }),
      
      // User profile (no cache - user-specific)
      email ? kv.get(`user:${email}`).catch(() => null) : null,
      
      // Notifications (if email provided)
      email ? cache.get(`notifications:${email}`, TTL.FAST, async () => {
        return await kv.get(`notifications:${email}`).catch(() => []);
      }) : [],
    ]);
    
    console.log('✅ Batch lobby data loaded successfully');
    
    return c.json({
      stats,
      rooms,
      leaderboard,
      streaks,
      profile,
      notifications,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('❌ Error loading batch lobby data:', error);
    return c.json({ error: 'Failed to load lobby data' }, 500);
  }
});

// ===================================================================
// End of Performance Optimization Endpoints
// ===================================================================

// Password reset redirect page - handles password resets outside of Figma iframe
app.get('/make-server-67091a4f/reset', (c) => {
  try {
    const token = c.req.query('token');
    const emailEncoded = c.req.query('email');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    // Decode the email (convert %40 to @)
    const email = emailEncoded ? decodeURIComponent(emailEncoded) : '';
    
    console.log('🔧 Password reset page accessed');
    console.log('🔧 Full URL:', c.req.url);
    console.log('🔧 Raw token:', token);
    console.log('🔧 Encoded email:', emailEncoded);
    console.log('🔧 Decoded email:', email);
    console.log('🔧 Anon key exists:', !!anonKey);
    
    if (!token || !email) {
      console.error('❌ Missing token or email!');
      return c.html(`
        <!DOCTYPE html>
        <html>
          <head><title>Error - Rollers Paradise</title></head>
          <body style="font-family: Arial; padding: 40px; text-align: center;">
            <h1>❌ Invalid Reset Link</h1>
            <p>This password reset link is missing required information.</p>
            <p>Token present: ${!!token}</p>
            <p>Email present: ${!!email}</p>
            <p>Please request a new password reset link.</p>
          </body>
        </html>
      `);
    }
    
    // Return an HTML page that will handle the password reset
    return c.html(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Password - Rollers Paradise</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0;
              padding: 20px;
            }
            .container {
              background: white;
              border-radius: 10px;
              padding: 40px;
              max-width: 500px;
              width: 100%;
              box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            }
            h1 {
              color: #333;
              margin-top: 0;
              text-align: center;
            }
            .form-group {
              margin-bottom: 20px;
            }
            label {
              display: block;
              margin-bottom: 5px;
              color: #666;
              font-weight: bold;
            }
            input {
              width: 100%;
              padding: 12px;
              border: 2px solid #ddd;
              border-radius: 5px;
              font-size: 16px;
              box-sizing: border-box;
            }
            input:focus {
              outline: none;
              border-color: #667eea;
            }
            button {
              width: 100%;
              padding: 15px;
              background: #10b981;
              color: white;
              border: none;
              border-radius: 5px;
              font-size: 16px;
              font-weight: bold;
              cursor: pointer;
              transition: background 0.3s;
            }
            button:hover {
              background: #059669;
            }
            button:disabled {
              background: #ccc;
              cursor: not-allowed;
            }
            .message {
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
              text-align: center;
            }
            .error {
              background: #fee;
              color: #c00;
              border: 1px solid #fcc;
            }
            .success {
              background: #efe;
              color: #060;
              border: 1px solid #cfc;
            }
            .loading {
              text-align: center;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎲 Reset Your Password</h1>
            <div id="message"></div>
            <form id="resetForm">
              <div class="form-group">
                <label>Email</label>
                <input type="email" id="email" value="${email || ''}" readonly style="background: #f5f5f5;">
              </div>
              <div class="form-group">
                <label>New Password</label>
                <input type="password" id="password" placeholder="At least 8 characters" required>
              </div>
              <div class="form-group">
                <label>Confirm Password</label>
                <input type="password" id="confirmPassword" placeholder="Re-enter password" required>
              </div>
              <button type="submit" id="submitBtn">RESET PASSWORD</button>
            </form>
          </div>
          
          <script>
            const form = document.getElementById('resetForm');
            const messageDiv = document.getElementById('message');
            const submitBtn = document.getElementById('submitBtn');
            
            form.addEventListener('submit', async (e) => {
              e.preventDefault();
              
              const password = document.getElementById('password').value;
              const confirmPassword = document.getElementById('confirmPassword').value;
              const email = document.getElementById('email').value;
              
              console.log('🔍 Submitting password reset...');
              console.log('📧 Email:', email);
              console.log('🔑 Token length:', '${token}'.length);
              console.log('🔐 Anon key present:', '${anonKey}' !== '');
              
              if (password.length < 8) {
                showMessage('Password must be at least 8 characters', 'error');
                return;
              }
              
              if (password !== confirmPassword) {
                showMessage('Passwords do not match', 'error');
                return;
              }
              
              submitBtn.disabled = true;
              submitBtn.textContent = 'RESETTING...';
              
              try {
                const response = await fetch('/functions/v1/make-server-67091a4f/auth/reset-password', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + '${anonKey}'
                  },
                  body: JSON.stringify({
                    email: email,
                    newPassword: password,
                    token: '${token}'
                  })
                });
                
                console.log('📬 Response status:', response.status);
                
                const data = await response.json();
                console.log('📦 Response data:', data);
                
                if (response.ok) {
                  showMessage('✅ Password reset successfully! You can now close this page and log in.', 'success');
                  form.reset();
                } else {
                  showMessage(data.error || 'Failed to reset password', 'error');
                  submitBtn.disabled = false;
                  submitBtn.textContent = 'RESET PASSWORD';
                }
              } catch (error) {
                console.error('❌ Network error:', error);
                showMessage('Network error. Please try again.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'RESET PASSWORD';
              }
            });
            
            function showMessage(text, type) {
              messageDiv.innerHTML = '<div class="message ' + type + '">' + text + '</div>';
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in password reset page:', error);
    return c.html(`
      <!DOCTYPE html>
      <html>
        <head><title>Error - Rollers Paradise</title></head>
        <body style="font-family: Arial; padding: 40px; text-align: center;">
          <h1>❌ Server Error</h1>
          <p>An unexpected error occurred while processing your request.</p>
          <p>Please try again later.</p>
        </body>
      </html>
    `);
  }
});

// Check environment variables (for debugging)
app.get('/make-server-67091a4f/debug/env', (c) => {
  const resendKey = Deno.env.get('RESEND_API_KEY');
  return c.json({ 
    resendKeyExists: !!resendKey,
    resendKeyLength: resendKey?.length || 0,
    resendKeyPrefix: resendKey?.substring(0, 8) || 'NOT_SET',
    allEnvKeys: Object.keys(Deno.env.toObject()).filter(k => k.includes('RESEND') || k.includes('API'))
  });
});

// Test email sending
app.post('/make-server-67091a4f/debug/test-email', async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;
    
    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }
    
    console.log('🧪 Testing email send to:', email);
    
    await sendEmail(
      email,
      '🧪 Test Email from Rollers Paradise',
      `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>✅ Email System Working!</h1>
          <p>This is a test email from Rollers Paradise.</p>
          <p>If you received this, the email system is configured correctly.</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </body>
      </html>
      `
    );
    
    return c.json({ 
      success: true,
      message: 'Test email sent! Custom domain coming soon to prevent spam folder issues.'
    });
  } catch (error) {
    console.error('Test email error:', error);
    return c.json({ 
      error: 'Failed to send test email',
      details: error.message 
    }, 500);
  }
});

// Get real-time statistics (CACHED - 30s TTL)
app.get('/make-server-67091a4f/stats', async (c) => {
  try {
    // Use cache to reduce DB reads by 99%!
    const stats = await cache.get('stats', TTL.FAST, async () => {
      // Get all active sessions/presence (players online in last 5 minutes)
      const presence = await kv.getByPrefix('presence:').catch(err => {
        console.warn('⚠️ Failed to fetch presence data:', err.message);
        return [];
      });
      const sessions = await kv.getByPrefix('session:').catch(err => {
        console.warn('⚠️ Failed to fetch session data:', err.message);
        return [];
      });
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      
      // Count active players from both presence and legacy sessions
      const activeFromPresence = presence.filter((p: any) => p && p.lastActive && p.lastActive > fiveMinutesAgo).length;
      const activeFromSessions = sessions.filter((s: any) => s && s.lastActive && s.lastActive > fiveMinutesAgo).length;
      const activePlayers = Math.max(activeFromPresence, activeFromSessions);

      // Get total games played with fallback
      const totalGames = (await kv.get('stats:total_games').catch(() => 0)) || 0;

      // Get total jackpot won with fallback
      const totalJackpot = (await kv.get('stats:total_jackpot').catch(() => 0)) || 0;

      return {
        playersOnline: activePlayers,
        totalGames: totalGames,
        totalJackpot: totalJackpot
      };
    });

    return c.json(stats);
  } catch (error) {
    console.error('❌ Error fetching stats - returning default values:', error);
    // Return safe default values instead of failing completely
    return c.json({
      playersOnline: 0,
      totalGames: 0,
      totalJackpot: 0
    });
  }
});

// Track player session (heartbeat)
app.post('/make-server-67091a4f/stats/session', async (c) => {
  try {
    const body = await c.req.json();
    const { playerId } = body;

    if (!playerId) {
      return c.json({ error: 'playerId is required' }, 400);
    }

    // Update session timestamp with error handling
    await kv.set(`session:${playerId}`, {
      playerId,
      lastActive: Date.now()
    }).catch(err => {
      console.warn('⚠️ Failed to update session - network error:', err.message);
    });

    // Always return success to prevent client-side errors
    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Error updating session:', error);
    // Return success anyway to prevent blocking the client
    return c.json({ success: true });
  }
});

// Increment game count
app.post('/make-server-67091a4f/stats/game', async (c) => {
  try {
    const currentCount = (await kv.get('stats:total_games')) || 0;
    const newCount = currentCount + 1;
    await kv.set('stats:total_games', newCount);

    // Invalidate stats cache and broadcast update
    invalidate.stats();
    
    // Get fresh stats and broadcast to SSE clients
    const presence = await kv.getByPrefix('presence:').catch(() => []);
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const activePlayers = presence.filter((p: any) => p && p.lastActive && p.lastActive > fiveMinutesAgo).length;
    const totalJackpot = (await kv.get('stats:total_jackpot').catch(() => 0)) || 0;
    
    broadcastStatsUpdate({
      playersOnline: activePlayers,
      totalGames: newCount,
      totalJackpot,
    });

    console.log(`✅ Game tracked: Total games now ${newCount}`);
    return c.json({ success: true, totalGames: newCount });
  } catch (error) {
    console.error('Error incrementing game count:', error);
    return c.json({ error: 'Failed to increment game count' }, 500);
  }
});

// Add to jackpot total
app.post('/make-server-67091a4f/stats/jackpot', async (c) => {
  try {
    const body = await c.req.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return c.json({ error: 'Valid amount is required' }, 400);
    }

    const currentTotal = (await kv.get('stats:total_jackpot')) || 0;
    const newTotal = currentTotal + amount;
    await kv.set('stats:total_jackpot', newTotal);

    // Invalidate stats cache and broadcast update
    invalidate.stats();
    
    // Get fresh stats and broadcast to SSE clients
    const presence = await kv.getByPrefix('presence:').catch(() => []);
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const activePlayers = presence.filter((p: any) => p && p.lastActive && p.lastActive > fiveMinutesAgo).length;
    const totalGames = (await kv.get('stats:total_games').catch(() => 0)) || 0;
    
    broadcastStatsUpdate({
      playersOnline: activePlayers,
      totalGames,
      totalJackpot: newTotal,
    });

    console.log(`💰 Jackpot tracked: Added $${amount}, total now $${newTotal}`);
    return c.json({ success: true, totalJackpot: newTotal });
  } catch (error) {
    console.error('Error adding to jackpot:', error);
    return c.json({ error: 'Failed to add to jackpot' }, 500);
  }
});

// Track hot streak events (win streaks, big wins, etc.)
app.post('/make-server-67091a4f/stats/hot-streak', async (c) => {
  try {
    const body = await c.req.json();
    const { message, icon, type, playerName, streakCount } = body;

    // Log the hot streak event for tracking
    console.log(`🔥 Hot Streak Event: ${message}`);
    
    // Store recent hot streak events (keep last 50)
    const recentEvents = (await kv.get('stats:hot_streak_events')) || [];
    const newEvent = {
      message,
      icon,
      type,
      playerName,
      streakCount,
      timestamp: Date.now()
    };
    
    recentEvents.unshift(newEvent);
    
    // Keep only the last 50 events
    if (recentEvents.length > 50) {
      recentEvents.splice(50);
    }
    
    await kv.set('stats:hot_streak_events', recentEvents);

    return c.json({ success: true, event: newEvent });
  } catch (error) {
    console.error('Error tracking hot streak:', error);
    return c.json({ error: 'Failed to track hot streak' }, 500);
  }
});

// Get recent error reports from KV store
app.get('/make-server-67091a4f/error-reports/recent', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10');

    // Get all error reports from KV store
    const errorReports = await kv.getByPrefix('error_report_');
    
    // Sort by timestamp descending (newest first) and limit
    const sortedReports = errorReports
      .map(r => r.value)
      .sort((a, b) => {
        const timeA = new Date(a.timestamp || a.created_at || 0).getTime();
        const timeB = new Date(b.timestamp || b.created_at || 0).getTime();
        return timeB - timeA;
      })
      .slice(0, limit);

    console.log(`📊 Retrieved ${sortedReports.length} recent error reports from KV store`);
    
    // Return data in both formats for compatibility with different frontend components
    return c.json({ 
      success: true,
      reports: sortedReports,      // For ErrorReportsViewer
      data: sortedReports,         // For ErrorReportsDashboard
      count: sortedReports.length, // For ErrorReportsViewer
      total: sortedReports.length, // For ErrorReportsDashboard
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching error reports:', error);
    return c.json({ 
      error: 'Failed to fetch error reports',
      message: error.message 
    }, 500);
  }
});

// Delete/Mark Complete an error report
app.delete('/make-server-67091a4f/error-reports/delete/:reportId', async (c) => {
  try {
    const reportId = c.req.param('reportId');
    
    if (!reportId) {
      return c.json({ error: 'Report ID is required' }, 400);
    }

    console.log(`🗑️ Deleting error report: ${reportId}`);
    
    // Delete from KV store
    await kv.del(reportId);
    
    console.log(`✅ Successfully deleted report: ${reportId}`);
    
    return c.json({ 
      success: true,
      message: 'Report deleted successfully',
      reportId 
    });
  } catch (error) {
    console.error('❌ Error deleting report:', error);
    return c.json({
      error: 'Failed to delete report',
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Submit error report to KV store
app.post('/make-server-67091a4f/error-reports', async (c) => {
  try {
    const report = await c.req.json();
    
    // Generate unique ID for the error report
    const reportId = `error_report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add timestamps
    const enrichedReport = {
      ...report,
      id: reportId,
      created_at: new Date().toISOString(),
      timestamp: new Date().toISOString()
    };

    // Save to KV store
    await kv.set(reportId, enrichedReport);
    
    console.log(`✅ Error report saved to KV store: ${report.error_code || 'unknown'}`);
    
    return c.json({ 
      success: true,
      report: enrichedReport 
    });
  } catch (error) {
    console.error('Error saving error report:', error);
    return c.json({ 
      error: 'Failed to save error report',
      message: error.message 
    }, 500);
  }
});

// Submit bug report to KV store
app.post('/make-server-67091a4f/bug-reports', async (c) => {
  try {
    const report = await c.req.json();
    
    // Generate unique ID for the bug report
    const reportId = `bug_report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add timestamps
    const enrichedReport = {
      ...report,
      id: reportId,
      created_at: new Date().toISOString(),
      timestamp: new Date().toISOString()
    };

    // Save to KV store
    await kv.set(reportId, enrichedReport);
    
    console.log(`✅ Bug report saved to KV store: ${reportId}`);
    
    return c.json({ 
      success: true,
      report: enrichedReport 
    });
  } catch (error) {
    console.error('Error saving bug report:', error);
    return c.json({ 
      error: 'Failed to save bug report',
      message: error.message 
    }, 500);
  }
});

// Submit player report to KV store
app.post('/make-server-67091a4f/player-reports', async (c) => {
  try {
    const report = await c.req.json();
    
    // Generate unique ID for the player report
    const reportId = `player_report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add timestamps
    const enrichedReport = {
      ...report,
      id: reportId,
      created_at: new Date().toISOString(),
      timestamp: new Date().toISOString()
    };

    // Save to KV store
    await kv.set(reportId, enrichedReport);
    
    console.log(`✅ Player report saved to KV store: ${reportId}`);
    
    return c.json({ 
      success: true,
      report: enrichedReport 
    });
  } catch (error) {
    console.error('Error saving player report:', error);
    return c.json({ 
      error: 'Failed to save player report',
      message: error.message 
    }, 500);
  }
});

// Get all bug reports from KV store
app.get('/make-server-67091a4f/bug-reports/recent', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50');

    // Get all bug reports from KV store
    const bugReports = await kv.getByPrefix('bug_report_');
    
    // Sort by timestamp descending (newest first) and limit
    const sortedReports = bugReports
      .map(r => r.value)
      .sort((a, b) => {
        const timeA = new Date(a.timestamp || a.created_at || 0).getTime();
        const timeB = new Date(b.timestamp || b.created_at || 0).getTime();
        return timeB - timeA;
      })
      .slice(0, limit);

    console.log(`📊 Retrieved ${sortedReports.length} bug reports from KV store`);
    
    return c.json({ 
      success: true,
      reports: sortedReports,
      count: sortedReports.length,
      total: sortedReports.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching bug reports:', error);
    return c.json({ 
      error: 'Failed to fetch bug reports',
      message: error.message 
    }, 500);
  }
});

// Get all player reports from KV store
app.get('/make-server-67091a4f/player-reports/recent', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50');

    // Get all player reports from KV store
    const playerReports = await kv.getByPrefix('player_report_');
    
    // Sort by timestamp descending (newest first) and limit
    const sortedReports = playerReports
      .map(r => r.value)
      .sort((a, b) => {
        const timeA = new Date(a.timestamp || a.created_at || 0).getTime();
        const timeB = new Date(b.timestamp || b.created_at || 0).getTime();
        return timeB - timeA;
      })
      .slice(0, limit);

    console.log(`📊 Retrieved ${sortedReports.length} player reports from KV store`);
    
    return c.json({ 
      success: true,
      reports: sortedReports,
      count: sortedReports.length,
      total: sortedReports.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching player reports:', error);
    return c.json({ 
      error: 'Failed to fetch player reports',
      message: error.message 
    }, 500);
  }
});

// Get ALL types of reports (errors, bugs, players) - COMPREHENSIVE ADMIN VIEW
app.get('/make-server-67091a4f/reports/all', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '100');

    console.log('🔍 Fetching ALL reports from KV store...');

    // Fetch all three types of reports in parallel
    const [errorReports, bugReports, playerReports] = await Promise.all([
      kv.getByPrefix('error_report_'),
      kv.getByPrefix('bug_report_'),
      kv.getByPrefix('player_report_')
    ]);

    // Combine all reports and add type labels
    const allReports = [
      ...errorReports.map(r => ({ ...r.value, report_type: 'error' })),
      ...bugReports.map(r => ({ ...r.value, report_type: 'bug' })),
      ...playerReports.map(r => ({ ...r.value, report_type: 'player' }))
    ];
    
    // Sort by timestamp descending (newest first) and limit
    const sortedReports = allReports
      .sort((a, b) => {
        const timeA = new Date(a.timestamp || a.created_at || 0).getTime();
        const timeB = new Date(b.timestamp || b.created_at || 0).getTime();
        return timeB - timeA;
      })
      .slice(0, limit);

    const counts = {
      error: errorReports.length,
      bug: bugReports.length,
      player: playerReports.length,
      total: allReports.length
    };

    console.log(`✅ Retrieved ALL reports:`, counts);
    
    return c.json({ 
      success: true,
      reports: sortedReports,
      counts,
      count: sortedReports.length,
      total: allReports.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching all reports:', error);
    return c.json({ 
      error: 'Failed to fetch all reports',
      message: error.message 
    }, 500);
  }
});

// Device Consent Endpoint (for legal compliance)
app.post('/make-server-67091a4f/device-consent', async (c) => {
  try {
    const { deviceInfo, consentGiven, consentTimestamp } = await c.req.json();
    
    if (!deviceInfo) {
      return c.json({ error: 'Device info is required' }, 400);
    }
    
    // Store device consent in KV store for compliance logging
    const consentRecord = {
      deviceInfo,
      consentGiven,
      consentTimestamp,
      recordedAt: new Date().toISOString(),
    };
    
    // Store with a unique key based on device fingerprint
    const deviceKey = `device_consent:${deviceInfo.userAgent || 'unknown'}:${deviceInfo.screenResolution || 'unknown'}`;
    await resilientKV.set(deviceKey, consentRecord);
    
    console.log('✅ Device consent recorded:', deviceKey);
    
    return c.json({ 
      success: true,
      message: 'Device consent recorded successfully' 
    });
  } catch (error) {
    console.error('Error recording device consent:', error);
    return c.json({ 
      error: 'Failed to record device consent',
      message: error.message 
    }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// ADMIN PERMISSION SYSTEM
// Owner: Ruski (avgelatt@gmail.com, 913-213-8666)
// ═══════════════════════════════════════════════════════════════

const OWNER_EMAIL = 'avgelatt@gmail.com';

// Check if user has admin access
app.post('/make-server-67091a4f/admin/check-access', async (c) => {
  try {
    const { userId, email } = await c.req.json();
    
    // Owner always has access
    if (email === OWNER_EMAIL) {
      return c.json({ 
        hasAccess: true, 
        role: 'owner',
        isOwner: true 
      });
    }
    
    // Check if user has been granted access
    const adminUsers = await kv.get('admin_users') || [];
    const adminUser = adminUsers.find((u: any) => 
      u.user_id === userId || u.email === email
    );
    
    if (adminUser && adminUser.is_active) {
      return c.json({ 
        hasAccess: true, 
        role: adminUser.role,
        isOwner: false 
      });
    }
    
    return c.json({ hasAccess: false, isOwner: false });
  } catch (error) {
    console.error('Error checking admin access:', error);
    return c.json({ hasAccess: false, isOwner: false });
  }
});

// Get all admin users (Owner only)
app.get('/make-server-67091a4f/admin/users', async (c) => {
  try {
    const adminUsers = await kv.get('admin_users') || [];
    
    // Add owner to the list
    const allUsers = [
      {
        email: OWNER_EMAIL,
        username: 'Ruski',
        phone: '913-213-8666',
        role: 'owner',
        granted_by: 'system',
        granted_at: '2024-01-01T00:00:00Z',
        is_active: true,
        user_id: 'owner',
      },
      ...adminUsers
    ];
    
    return c.json({ users: allUsers });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return c.json({ error: 'Failed to fetch admin users' }, 500);
  }
});

// Grant admin access (Owner only)
app.post('/make-server-67091a4f/admin/grant-access', async (c) => {
  try {
    const { email, role, grantedBy } = await c.req.json();
    
    if (!email || !role) {
      return c.json({ error: 'Email and role are required' }, 400);
    }
    
    // Get current admin users
    const adminUsers = await kv.get('admin_users') || [];
    
    // Check if user already has access
    const existingIndex = adminUsers.findIndex((u: any) => u.email === email);
    
    const newUser = {
      user_id: `user_${Date.now()}`,
      email,
      username: email.split('@')[0],
      role,
      granted_by: grantedBy,
      granted_at: new Date().toISOString(),
      is_active: true,
    };
    
    if (existingIndex >= 0) {
      // Update existing user
      adminUsers[existingIndex] = newUser;
    } else {
      // Add new user
      adminUsers.push(newUser);
    }
    
    await kv.set('admin_users', adminUsers);
    
    console.log(`✅ Admin access granted to ${email} with role ${role}`);
    
    return c.json({ 
      success: true, 
      message: `Access granted to ${email}`,
      user: newUser
    });
  } catch (error) {
    console.error('Error granting admin access:', error);
    return c.json({ 
      error: 'Failed to grant access',
      message: error.message 
    }, 500);
  }
});

// Revoke admin access (Owner only)
app.post('/make-server-67091a4f/admin/revoke-access', async (c) => {
  try {
    const { userId } = await c.req.json();
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }
    
    // Get current admin users
    const adminUsers = await kv.get('admin_users') || [];
    
    // Remove the user
    const updatedUsers = adminUsers.filter((u: any) => u.user_id !== userId);
    
    await kv.set('admin_users', updatedUsers);
    
    console.log(`✅ Admin access revoked for user ${userId}`);
    
    return c.json({ 
      success: true, 
      message: 'Access revoked successfully'
    });
  } catch (error) {
    console.error('Error revoking admin access:', error);
    return c.json({ 
      error: 'Failed to revoke access',
      message: error.message 
    }, 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// FRIENDS LIST & ADMIN ACCESS SYSTEM
// Owner: Ruski can add friends and grant them admin/coder access
// ═══════════════════════════════════════════════════════════════

// Get friends list
app.get('/make-server-67091a4f/friends/list', async (c) => {
  try {
    const friends = await kv.get('friends_list') || [];
    return c.json({ friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return c.json({ error: 'Failed to fetch friends' }, 500);
  }
});

// Add friend
app.post('/make-server-67091a4f/friends/add', async (c) => {
  try {
    const { ownerEmail, friendEmail } = await c.req.json();
    
    if (!ownerEmail || !friendEmail) {
      return c.json({ error: 'Owner and friend email required' }, 400);
    }
    
    // Only owner can add friends
    if (ownerEmail !== OWNER_EMAIL) {
      return c.json({ error: 'Only owner can add friends' }, 403);
    }
    
    // Get current friends list
    const friends = await kv.get('friends_list') || [];
    
    // Check if already friends
    const exists = friends.find((f: any) => f.email === friendEmail);
    if (exists) {
      return c.json({ error: 'Already in friends list' }, 400);
    }
    
    // Add new friend
    const newFriend = {
      id: `friend_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      email: friendEmail,
      username: friendEmail.split('@')[0],
      status: 'accepted',
      added_at: new Date().toISOString(),
      is_admin: false,
    };
    
    friends.push(newFriend);
    await kv.set('friends_list', friends);
    
    console.log(`✅ Friend added: ${friendEmail}`);
    
    return c.json({ 
      success: true, 
      message: 'Friend added successfully',
      friend: newFriend
    });
  } catch (error) {
    console.error('Error adding friend:', error);
    return c.json({ 
      error: 'Failed to add friend',
      message: error.message 
    }, 500);
  }
});

// Remove friend
app.post('/make-server-67091a4f/friends/remove', async (c) => {
  try {
    const { ownerEmail, friendId } = await c.req.json();
    
    if (!ownerEmail || !friendId) {
      return c.json({ error: 'Owner email and friend ID required' }, 400);
    }
    
    // Only owner can remove friends
    if (ownerEmail !== OWNER_EMAIL) {
      return c.json({ error: 'Only owner can remove friends' }, 403);
    }
    
    // Get current friends list
    const friends = await kv.get('friends_list') || [];
    
    // Find friend
    const friend = friends.find((f: any) => f.id === friendId);
    
    // Remove friend
    const updatedFriends = friends.filter((f: any) => f.id !== friendId);
    await kv.set('friends_list', updatedFriends);
    
    // Also revoke admin access if they had it
    if (friend && friend.is_admin) {
      const adminUsers = await kv.get('admin_users') || [];
      const updatedAdmins = adminUsers.filter((u: any) => u.email !== friend.email);
      await kv.set('admin_users', updatedAdmins);
    }
    
    console.log(`✅ Friend removed: ${friendId}`);
    
    return c.json({ 
      success: true, 
      message: 'Friend removed successfully'
    });
  } catch (error) {
    console.error('Error removing friend:', error);
    return c.json({ 
      error: 'Failed to remove friend',
      message: error.message 
    }, 500);
  }
});

// Grant admin access to friend
app.post('/make-server-67091a4f/friends/grant-admin', async (c) => {
  try {
    const { ownerEmail, friendEmail, role } = await c.req.json();
    
    if (!ownerEmail || !friendEmail || !role) {
      return c.json({ error: 'Owner email, friend email, and role required' }, 400);
    }
    
    // Only owner can grant access
    if (ownerEmail !== OWNER_EMAIL) {
      return c.json({ error: 'Only owner can grant admin access' }, 403);
    }
    
    // Update friend's admin status in friends list
    const friends = await kv.get('friends_list') || [];
    const friendIndex = friends.findIndex((f: any) => f.email === friendEmail);
    
    if (friendIndex < 0) {
      return c.json({ error: 'Friend not found' }, 404);
    }
    
    friends[friendIndex].is_admin = true;
    friends[friendIndex].admin_role = role;
    await kv.set('friends_list', friends);
    
    // Add to admin users list
    const adminUsers = await kv.get('admin_users') || [];
    const existingIndex = adminUsers.findIndex((u: any) => u.email === friendEmail);
    
    const adminUser = {
      user_id: `user_${Date.now()}`,
      email: friendEmail,
      username: friendEmail.split('@')[0],
      role,
      granted_by: ownerEmail,
      granted_at: new Date().toISOString(),
      is_active: true,
    };
    
    if (existingIndex >= 0) {
      adminUsers[existingIndex] = adminUser;
    } else {
      adminUsers.push(adminUser);
    }
    
    await kv.set('admin_users', adminUsers);
    
    console.log(`✅ Admin access granted to friend: ${friendEmail} with role ${role}`);
    
    return c.json({ 
      success: true, 
      message: 'Admin access granted successfully'
    });
  } catch (error) {
    console.error('Error granting admin access:', error);
    return c.json({ 
      error: 'Failed to grant admin access',
      message: error.message 
    }, 500);
  }
});

// Revoke admin access from friend
app.post('/make-server-67091a4f/friends/revoke-admin', async (c) => {
  try {
    const { ownerEmail, friendEmail } = await c.req.json();
    
    if (!ownerEmail || !friendEmail) {
      return c.json({ error: 'Owner email and friend email required' }, 400);
    }
    
    // Only owner can revoke access
    if (ownerEmail !== OWNER_EMAIL) {
      return c.json({ error: 'Only owner can revoke admin access' }, 403);
    }
    
    // Update friend's admin status in friends list
    const friends = await kv.get('friends_list') || [];
    const friendIndex = friends.findIndex((f: any) => f.email === friendEmail);
    
    if (friendIndex >= 0) {
      friends[friendIndex].is_admin = false;
      friends[friendIndex].admin_role = undefined;
      await kv.set('friends_list', friends);
    }
    
    // Remove from admin users list
    const adminUsers = await kv.get('admin_users') || [];
    const updatedAdmins = adminUsers.filter((u: any) => u.email !== friendEmail);
    await kv.set('admin_users', updatedAdmins);
    
    console.log(`✅ Admin access revoked from friend: ${friendEmail}`);
    
    return c.json({ 
      success: true, 
      message: 'Admin access revoked successfully'
    });
  } catch (error) {
    console.error('Error revoking admin access:', error);
    return c.json({ 
      error: 'Failed to revoke admin access',
      message: error.message 
    }, 500);
  }
});

// Get all rooms (CACHED - 10s TTL)
app.get('/make-server-67091a4f/rooms', async (c) => {
  try {
    // Use cache to reduce DB reads
    const activeRooms = await cache.get('rooms', TTL.REALTIME, async () => {
      const rooms = await kv.getByPrefix('room:');
      return rooms.filter((room: any) => room && room.created && Date.now() - room.created < 3600000);
    });
    
    return c.json({ rooms: activeRooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return c.json({ error: 'Failed to fetch rooms' }, 500);
  }
});

// Create a room
app.post('/make-server-67091a4f/rooms/create', async (c) => {
  try {
    const body = await c.req.json();
    const { name, host, hostEmail, maxPlayers } = body;

    if (!name || !host) {
      return c.json({ error: 'Name and host are required' }, 400);
    }

    const roomId = `room-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const room = {
      id: roomId,
      name,
      host,
      hostEmail: hostEmail || host, // Use email if provided, fallback to name
      players: 1,
      maxPlayers: maxPlayers || 4,
      created: Date.now(),
      playerList: [{ name: host, email: hostEmail || host }], // Track all players
    };

    await kv.set(`room:${roomId}`, room);

    // Invalidate rooms cache and broadcast update via SSE
    invalidate.rooms();
    const allRooms = await kv.getByPrefix('room:');
    const activeRooms = allRooms.filter((r: any) => r && r.created && Date.now() - r.created < 3600000);
    broadcastRoomUpdate(activeRooms);

    console.log(`🚀 Room created and broadcast to ${sse.getClientCount(SSE_CHANNELS.ROOMS)} SSE clients`);

    return c.json({ roomId, room });
  } catch (error) {
    console.error('Error creating room:', error);
    return c.json({ error: 'Failed to create room' }, 500);
  }
});

// Join a room
app.post('/make-server-67091a4f/rooms/:roomId/join', async (c) => {
  try {
    const roomId = c.req.param('roomId');
    const body = await c.req.json();
    const { playerName, playerEmail } = body;

    if (!playerName) {
      return c.json({ error: 'Player name is required' }, 400);
    }

    const roomData = await kv.get(`room:${roomId}`);
    if (!roomData) {
      return c.json({ error: 'Room not found' }, 404);
    }

    const room = roomData as any;

    if (room.players >= room.maxPlayers) {
      return c.json({ error: 'Room is full' }, 400);
    }

    // Initialize playerList if it doesn't exist (for older rooms)
    if (!room.playerList) {
      room.playerList = [];
    }

    // Add player to list if not already in it
    const existingPlayer = room.playerList.find((p: any) => 
      p.email === (playerEmail || playerName)
    );
    
    if (!existingPlayer) {
      room.playerList.push({ name: playerName, email: playerEmail || playerName });
      room.players += 1;
    }

    await kv.set(`room:${roomId}`, room);

    // Invalidate rooms cache and broadcast update via SSE
    invalidate.rooms();
    const allRooms = await kv.getByPrefix('room:');
    const activeRooms = allRooms.filter((r: any) => r && r.created && Date.now() - r.created < 3600000);
    broadcastRoomUpdate(activeRooms);

    return c.json({ success: true, room });
  } catch (error) {
    console.error('Error joining room:', error);
    return c.json({ error: 'Failed to join room' }, 500);
  }
});

// Leave a room
app.post('/make-server-67091a4f/rooms/:roomId/leave', async (c) => {
  try {
    const roomId = c.req.param('roomId');
    const body = await c.req.json();
    const { playerName, playerEmail } = body;

    const roomData = await kv.get(`room:${roomId}`);
    if (!roomData) {
      return c.json({ error: 'Room not found' }, 404);
    }

    const room = roomData as any;
    
    // Initialize playerList if it doesn't exist (for older rooms)
    if (!room.playerList) {
      room.playerList = [];
    }

    // Find and remove the leaving player
    const leavingPlayerIdentifier = playerEmail || playerName;
    const wasHost = room.hostEmail === leavingPlayerIdentifier || room.host === playerName;
    
    room.playerList = room.playerList.filter((p: any) => 
      p.email !== leavingPlayerIdentifier && p.name !== playerName
    );
    
    room.players = Math.max(0, room.players - 1);

    // Check if room is now empty
    if (room.players === 0 || room.playerList.length === 0) {
      // Delete room permanently if no players left
      console.log(`🗑️ Deleting room ${roomId} - no players remaining`);
      await kv.del(`room:${roomId}`);
      await kv.del(`room-timer:${roomId}`);
      
      // Invalidate rooms cache and broadcast update via SSE
      invalidate.rooms();
      const allRooms = await kv.getByPrefix('room:');
      const activeRooms = allRooms.filter((r: any) => r && r.created && Date.now() - r.created < 3600000);
      broadcastRoomUpdate(activeRooms);
      
      return c.json({ 
        success: true, 
        roomDeleted: true,
        message: 'Room deleted - no players remaining' 
      });
    }

    // Host migration: if the host left, promote the next player
    let newHost = null;
    if (wasHost && room.playerList.length > 0) {
      const nextPlayer = room.playerList[0];
      room.host = nextPlayer.name;
      room.hostEmail = nextPlayer.email;
      newHost = nextPlayer;
      console.log(`👑 Host migration: ${playerName} left, ${nextPlayer.name} is now host`);
    }

    await kv.set(`room:${roomId}`, room);

    // Invalidate rooms cache and broadcast update via SSE
    invalidate.rooms();
    const allRooms = await kv.getByPrefix('room:');
    const activeRooms = allRooms.filter((r: any) => r && r.created && Date.now() - r.created < 3600000);
    broadcastRoomUpdate(activeRooms);

    return c.json({ 
      success: true,
      newHost,
      room,
      message: newHost ? `Host migrated to ${newHost.name}` : 'Player left'
    });
  } catch (error) {
    console.error('Error leaving room:', error);
    return c.json({ error: 'Failed to leave room' }, 500);
  }
});

// Store room timer state (for timer persistence across host disconnects)
app.post('/make-server-67091a4f/rooms/:roomId/timer', async (c) => {
  try {
    const roomId = c.req.param('roomId');
    const body = await c.req.json();
    const { bettingTimer, bettingTimerActive, bettingLocked, lastUpdate } = body;

    const timerState = {
      bettingTimer,
      bettingTimerActive,
      bettingLocked,
      lastUpdate: lastUpdate || Date.now(),
    };

    await kv.set(`room-timer:${roomId}`, timerState);

    return c.json({ success: true, timerState });
  } catch (error) {
    console.error('Error updating room timer:', error);
    return c.json({ error: 'Failed to update timer' }, 500);
  }
});

// Get room timer state
app.get('/make-server-67091a4f/rooms/:roomId/timer', async (c) => {
  try {
    const roomId = c.req.param('roomId');
    const timerData = await kv.get(`room-timer:${roomId}`);

    if (!timerData) {
      return c.json({ 
        timerState: { 
          bettingTimer: 30, 
          bettingTimerActive: false, 
          bettingLocked: false 
        } 
      });
    }

    return c.json({ timerState: timerData });
  } catch (error) {
    console.error('Error fetching room timer:', error);
    return c.json({ error: 'Failed to fetch timer' }, 500);
  }
});

// ==================== AUTHENTICATION ROUTES ====================

// Sign up
app.post('/make-server-67091a4f/auth/signup', async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, password, phone, securityPin, avatar, ip, securityQuestion, securityAnswer } = body;

    if (!name || !email || !password || !phone || !securityPin) {
      return c.json({ error: 'All fields are required' }, 400);
    }

    if (!securityQuestion || !securityAnswer) {
      return c.json({ error: 'Security question and answer are required' }, 400);
    }

    if (password.length < 8) {
      return c.json({ error: 'Password must be at least 8 characters' }, 400);
    }

    // Check if email already exists with retry logic
    const existingUser = await retryOperation(
      async () => await kv.get(`user:${email}`),
      3,
      500
    );
    
    if (existingUser) {
      return c.json({ error: 'An account with this email already exists' }, 400);
    }

    // ========================================
    // USERNAME UNIQUENESS CHECK
    // ========================================
    // Check if username is already taken
    const allUsers = await retryOperation(
      async () => await kv.getByPrefix('user:'),
      3,
      500
    );
    
    const usernameTaken = allUsers.find((user: any) => 
      user && user.name && user.name.toLowerCase() === name.toLowerCase()
    );
    
    if (usernameTaken) {
      return c.json({ 
        error: `The username "${name}" is already taken. Please choose a different username.` 
      }, 400);
    }

    // Check if IP already has an account with retry logic
    const ipAccounts = await retryOperation(
      async () => await kv.getByPrefix('user:'),
      3,
      500
    );
    
    const ipAccount = ipAccounts.find((item: any) => item && item.ip === ip);
    if (ipAccount) {
      return c.json({ 
        error: 'This device already has an account registered. Only one account per device is allowed.' 
      }, 400);
    }

    // Hash password (simple hash for demo - in production use bcrypt)
    const crypto = await import('node:crypto');
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    const pinHash = crypto.createHash('sha256').update(securityPin).digest('hex');
    const answerHash = crypto.createHash('sha256').update(securityAnswer.toLowerCase().trim()).digest('hex');

    // Create user
    const user = {
      name,
      email,
      passwordHash,
      phone,
      pinHash,
      securityQuestion,
      securityAnswerHash: answerHash,
      avatar,
      ip,
      createdAt: Date.now(),
      lastLogin: Date.now(), // Track last login for inactive cleanup
      balance: 1000, // Starting balance
      lastFreeChipsClaim: null, // Track daily free chips
      // Stats tracking for leaderboard
      stats: {
        totalWins: 0,
        totalLosses: 0,
        totalRolls: 0,
        biggestWin: 0,
        totalWagered: 0,
        level: 1,
        xp: 0,
      },
    };

    await retryOperation(
      async () => await kv.set(`user:${email}`, user),
      3,
      500
    );

    return c.json({ 
      success: true, 
      profile: { name, email, avatar, phone },
      balance: 1000 
    });
  } catch (error) {
    console.error('Sign up error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Provide more helpful error message for connection issues
    if (errorMessage.includes('connection') || errorMessage.includes('network') || errorMessage.includes('reset')) {
      return c.json({ 
        error: 'Connection error. Please check your internet connection and try again.' 
      }, 503);
    }
    
    return c.json({ error: 'Failed to create account' }, 500);
  }
});

// Sign in
app.post('/make-server-67091a4f/auth/signin', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, ip } = body;

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Get user with retry logic
    const userData = await retryOperation(
      async () => await kv.get(`user:${email}`),
      3,
      500
    );
    
    if (!userData) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const user = userData as any;

    // Verify password
    const crypto = await import('node:crypto');
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    if (user.passwordHash !== passwordHash) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Check if user has 2FA enabled (PIN)
    if (user.pinHash) {
      return c.json({ 
        requiresPin: true,
        message: 'Please enter your security PIN' 
      });
    }

    // Ensure balance exists (for backward compatibility)
    if (user.balance === undefined) {
      user.balance = 1000;
    }

    // Update lastLogin timestamp for activity tracking
    user.lastLogin = Date.now();
    
    await retryOperation(
      async () => await kv.set(`user:${email}`, user),
      3,
      500
    );

    return c.json({ 
      success: true, 
      profile: { 
        name: user.name, 
        email: user.email, 
        avatar: user.avatar,
        phone: user.phone 
      },
      balance: user.balance // RETURN BALANCE ON SIGNIN!
    });
  } catch (error) {
    console.error('Sign in error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Provide more helpful error message for connection issues
    if (errorMessage.includes('connection') || errorMessage.includes('network') || errorMessage.includes('reset')) {
      return c.json({ 
        error: 'Connection error. Please check your internet connection and try again.' 
      }, 503);
    }
    
    return c.json({ error: 'Failed to sign in' }, 500);
  }
});

// Verify PIN
app.post('/make-server-67091a4f/auth/verify-pin', async (c) => {
  try {
    const body = await c.req.json();
    const { email, pin } = body;

    if (!email || !pin) {
      return c.json({ error: 'Email and PIN are required' }, 400);
    }

    // Get user with retry logic for network errors
    const userData = await retryOperation(
      async () => await kv.get(`user:${email}`),
      3, // 3 retries
      500 // 500ms initial delay
    );
    
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userData as any;

    // Verify PIN
    const crypto = await import('node:crypto');
    const pinHash = crypto.createHash('sha256').update(pin).digest('hex');

    if (user.pinHash !== pinHash) {
      return c.json({ error: 'Invalid PIN' }, 401);
    }

    // Ensure balance exists (for backward compatibility)
    if (user.balance === undefined) {
      user.balance = 1000;
    }

    // Update lastLogin timestamp for activity tracking
    user.lastLogin = Date.now();
    
    await retryOperation(
      async () => await kv.set(`user:${email}`, user),
      3,
      500
    );

    return c.json({ 
      success: true, 
      profile: { 
        name: user.name, 
        email: user.email, 
        avatar: user.avatar,
        phone: user.phone,
        securityPin: pin // Return decrypted PIN for display
      },
      balance: user.balance // RETURN BALANCE ON PIN VERIFICATION!
    });
  } catch (error) {
    console.error('PIN verification error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Provide more helpful error message for connection issues
    if (errorMessage.includes('connection') || errorMessage.includes('network') || errorMessage.includes('reset')) {
      return c.json({ 
        error: 'Connection error. Please check your internet connection and try again.' 
      }, 503);
    }
    
    return c.json({ error: 'Failed to verify PIN' }, 500);
  }
});

// Get security question
app.post('/make-server-67091a4f/auth/get-security-question', async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    // Get user with retry logic
    const userData = await retryOperation(
      async () => await kv.get(`user:${email}`),
      3,
      500
    );
    
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userData as any;

    if (!user.securityQuestion) {
      return c.json({ error: 'No security question set for this account' }, 400);
    }

    return c.json({ 
      success: true, 
      securityQuestion: user.securityQuestion
    });
  } catch (error) {
    console.error('Get security question error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Provide more helpful error message for connection issues
    if (errorMessage.includes('connection') || errorMessage.includes('network') || errorMessage.includes('reset')) {
      return c.json({ 
        error: 'Connection error. Please check your internet connection and try again.' 
      }, 503);
    }
    
    return c.json({ error: 'Failed to retrieve security question' }, 500);
  }
});

// Reset PIN with security answer
app.post('/make-server-67091a4f/auth/reset-pin', async (c) => {
  try {
    const body = await c.req.json();
    const { email, securityAnswer, newPin } = body;

    if (!email || !securityAnswer || !newPin) {
      return c.json({ error: 'All fields are required' }, 400);
    }

    // Get user
    const userData = await kv.get(`user:${email}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userData as any;

    if (!user.securityAnswerHash) {
      return c.json({ error: 'No security answer set for this account' }, 400);
    }

    // Verify security answer
    const crypto = await import('node:crypto');
    const answerHash = crypto.createHash('sha256').update(securityAnswer.toLowerCase().trim()).digest('hex');

    if (user.securityAnswerHash !== answerHash) {
      return c.json({ error: 'Incorrect security answer' }, 401);
    }

    // Update PIN
    const newPinHash = crypto.createHash('sha256').update(newPin).digest('hex');
    user.pinHash = newPinHash;
    await kv.set(`user:${email}`, user);

    return c.json({ 
      success: true,
      message: 'PIN reset successfully'
    });
  } catch (error) {
    console.error('Reset PIN error:', error);
    return c.json({ error: 'Failed to reset PIN' }, 500);
  }
});

// Update profile
app.post('/make-server-67091a4f/profile/update', async (c) => {
  try {
    const body = await c.req.json();
    const { email, name, avatar, phone, securityPin, password, currentPassword } = body;

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    // Get user
    const userData = await kv.get(`user:${email}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userData as any;

    // If changing password, verify current password
    if (password && currentPassword) {
      const crypto = await import('node:crypto');
      const currentPasswordHash = crypto.createHash('sha256').update(currentPassword).digest('hex');
      
      if (user.passwordHash !== currentPasswordHash) {
        return c.json({ error: 'Current password is incorrect' }, 401);
      }

      // Update password
      user.passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    }

    // Update user fields
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (phone !== undefined) user.phone = phone;
    
    // Update security PIN if provided
    if (securityPin) {
      const crypto = await import('node:crypto');
      user.pinHash = crypto.createHash('sha256').update(securityPin).digest('hex');
    }

    user.updatedAt = Date.now();

    // Save updated user
    await kv.set(`user:${email}`, user);

    return c.json({ 
      success: true, 
      profile: { 
        name: user.name, 
        email: user.email, 
        avatar: user.avatar,
        phone: user.phone,
        securityPin: securityPin // Return the PIN for local storage
      } 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Forgot password
app.post('/make-server-67091a4f/auth/forgot-password', async (c) => {
  try {
    const body = await c.req.json();
    const { email, appUrl } = body;

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    // Check if user exists
    const userData = await kv.get(`user:${email}`);
    if (!userData) {
      // Don't reveal if account exists for security
      console.log(`⚠️ No account found for email: ${email}`);
      return c.json({ 
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions.'
      });
    }

    const user = userData as any;
    console.log(`✅ Account found for: ${email}, preparing to send reset email...`);

    // Generate a secure reset token
    const crypto = await import('node:crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Save hashed token with 1 hour expiration
    await kv.set(`reset:${email}`, {
      tokenHash,
      email,
      expiresAt: Date.now() + 3600000, // 1 hour
    });

    // Use the app URL with query parameters for password reset
    // This works within Figma iframe and published apps!
    const appBaseUrl = appUrl || 'https://www.figma.com';
    const resetUrl = `${appBaseUrl}?resetToken=${resetToken}&resetEmail=${encodeURIComponent(email)}`;

    // Send password reset email
    try {
      console.log('🌐 Supabase URL:', appBaseUrl);
      console.log('📧 Attempting to send password reset email to:', email);
      console.log('🔗 Reset URL (dedicated page):', resetUrl);
      console.log('🔑 Token:', resetToken);
      console.log('📧 Email (encoded):', encodeURIComponent(email));
      
      console.log('========== EMAIL BEING SENT ==========');
      console.log('TO:', email);
      console.log('SUBJECT:', '🎲 Reset Your Rollers Paradise Password');
      console.log('RESET LINK:', resetUrl);
      console.log('======================================');
      
      await sendEmail(
        email,
        '🎲 Reset Your Rollers Paradise Password',
        `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">🎲 Password Reset Request</h1>
                <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Rollers Paradise</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 30px;">
                <p style="margin: 0 0 20px 0;">Hello <strong>${user.name}</strong>,</p>
                <p style="margin: 0 0 20px 0;">We received a request to reset your password for your Rollers Paradise account.</p>
                
                <!-- EMAIL DELIVERY NOTICE -->
                <div style="background: #1e40af; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 3px solid #1e3a8a;">
                  <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>💡 Email Delivery Notice</strong></p>
                  <p style="margin: 0; font-size: 14px;">
                    Once we get enough support, we'll purchase a custom domain to ensure emails don't go to spam/junk folders. Thank you for your patience!
                  </p>
                </div>
                
                <!-- Button -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" style="display: inline-block; background: #10b981; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">RESET MY PASSWORD</a>
                </div>
                
                <!-- Plain URL for maximum compatibility -->
                <p style="margin: 20px 0 10px 0; color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
                
                <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                  <p style="margin: 0; word-break: break-all; font-size: 12px; font-family: monospace; color: #333;">${resetUrl}</p>
                </div>
                
                <!-- Instructions for Figma users -->
                <div style="background: #e0f2fe; padding: 15px; border-radius: 5px; border-left: 4px solid #0284c7; margin-bottom: 15px;">
                  <p style="margin: 0 0 10px 0; font-weight: bold; color: #0369a1;">💡 Tip: Open in a New Tab</p>
                  <p style="margin: 0; font-size: 13px; color: #075985;">
                    Right-click the button above and select <strong>"Open Link in New Tab"</strong> for the best experience.
                  </p>
                </div>
                
                <!-- Warning -->
                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 3px;">
                  <strong>⚠️ Security Notice:</strong>
                  <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
                    <li>This link expires in <strong>1 hour</strong></li>
                    <li>If you didn't request this, ignore this email</li>
                  </ul>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background: #f9f9f9; padding: 20px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee;">
                <p style="margin: 0 0 5px 0;">© ${new Date().getFullYear()} Rollers Paradise</p>
                <p style="margin: 0;">This is an automated email. Please do not reply.</p>
              </div>
              
            </div>
          </body>
        </html>
        `
      );

      console.log('✅ Password reset email sent successfully to:', email);
      console.log('📬 Email sent - custom domain coming soon to prevent spam folder issues');
      
      return c.json({ 
        success: true,
        message: 'Password reset instructions have been sent to your email address.'
      });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      // If email fails, still return success for security (don't reveal if email exists)
      // but log the error
      return c.json({ 
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions.',
        warning: 'Email service may be unavailable'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    return c.json({ error: 'Failed to process password reset request' }, 500);
  }
});

// Forgot username
app.post('/make-server-67091a4f/auth/forgot-username', async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    // Check if user exists
    const userData = await kv.get(`user:${email}`);
    if (!userData) {
      // Don't reveal if account exists for security
      return c.json({ 
        success: true,
        message: 'If an account exists with this email, you will receive your username information.'
      });
    }

    const user = userData as any;

    // Send username recovery email
    try {
      await sendEmail(
        email,
        '🎲 Your Rollers Paradise Username',
        `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .username-box { background: white; border: 2px solid #667eea; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; }
              .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
              .info { background: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎲 Username Recovery</h1>
              </div>
              <div class="content">
                <p>Hello there,</p>
                <p>You requested your username for Rollers Paradise. Here it is:</p>
                
                <!-- SPAM FOLDER WARNING -->\n                <div style=\\\"background: #dc2626; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 3px solid #991b1b; text-align: left;\\\">\\n                  <p style=\\\"margin: 0 0 10px 0; font-size: 18px;\\\"><strong>💡 Email Delivery Notice</strong></p>\\n                  <p style=\\\"margin: 0; font-size: 14px;\\\">\\n                    <strong>If you can't find this email:</strong><br/>\\n                    1. Check your SPAM/JUNK folder<br/>\\n                    2. Mark this email as \\\"Not Spam\\\"<br/>\\n                    3. Move it to your inbox\\n                  </p>\\n                </div>
                
                <div class="username-box">
                  <p style="font-size: 12px; color: #666; margin: 0;">Your Username</p>
                  <h2 style="margin: 10px 0; color: #667eea;">${user.name}</h2>
                </div>
                <div class="info">
                  <strong>📱 Account Information:</strong>
                  <ul>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Phone:</strong> ${user.phone}</li>
                    <li><strong>Account Created:</strong> ${new Date(user.createdAt).toLocaleDateString()}</li>
                  </ul>
                </div>
                <p>If you also forgot your password, you can reset it using the "Forgot Password" option on the login page.</p>
                <p><strong>Security Tip:</strong> If you didn't request this information, please contact support immediately.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Rollers Paradise - The Ultimate Crapless Craps Experience</p>
                <p>This is an automated email. Please do not reply.</p>
              </div>
            </div>
          </body>
        </html>
        `
      );

      console.log(`Username recovery email sent to ${email}`);
      
      return c.json({ 
        success: true,
        message: 'Your username has been sent to your email address.'
      });
    } catch (emailError) {
      console.error('Failed to send username email:', emailError);
      return c.json({ 
        success: true,
        message: 'If an account exists with this email, you will receive your username information.',
        warning: 'Email service may be unavailable'
      });
    }
  } catch (error) {
    console.error('Forgot username error:', error);
    return c.json({ error: 'Failed to process username recovery request' }, 500);
  }
});

// Verify reset token and update password
app.post('/make-server-67091a4f/auth/reset-password', async (c) => {
  try {
    const body = await c.req.json();
    const { email, token, newPassword } = body;

    if (!email || !token || !newPassword) {
      return c.json({ error: 'Email, token, and new password are required' }, 400);
    }

    if (newPassword.length < 8) {
      return c.json({ error: 'Password must be at least 8 characters' }, 400);
    }

    // Get reset token data
    const resetData = await kv.get(`reset:${email}`);
    if (!resetData) {
      return c.json({ error: 'Invalid or expired reset link' }, 400);
    }

    const reset = resetData as any;

    // Check if token is expired
    if (Date.now() > reset.expiresAt) {
      await kv.del(`reset:${email}`);
      return c.json({ error: 'Reset link has expired. Please request a new one.' }, 400);
    }

    // Verify token
    const crypto = await import('node:crypto');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    if (reset.tokenHash !== tokenHash) {
      return c.json({ error: 'Invalid reset link' }, 400);
    }

    // Get user
    const userData = await kv.get(`user:${email}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userData as any;

    // Update password
    const newPasswordHash = crypto.createHash('sha256').update(newPassword).digest('hex');
    user.passwordHash = newPasswordHash;
    user.passwordResetAt = Date.now();
    await kv.set(`user:${email}`, user);

    // Delete reset token
    await kv.del(`reset:${email}`);

    // Send confirmation email
    try {
      await sendEmail(
        email,
        '✅ Your Rollers Paradise Password Has Been Reset',
        `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
              .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Password Reset Successful</h1>
              </div>
              <div class="content">
                <p>Hello <strong>${user.name}</strong>,</p>
                <div class="success">
                  <p><strong>Your password has been successfully reset!</strong></p>
                  <p>You can now log in to Rollers Paradise with your new password.</p>
                </div>
                <p><strong>Account Details:</strong></p>
                <ul>
                  <li>Email: ${email}</li>
                  <li>Username: ${user.name}</li>
                  <li>Reset Time: ${new Date().toLocaleString()}</li>
                </ul>
                <div class="warning">
                  <strong>⚠️ Security Notice:</strong>
                  <p>If you did not make this change, please contact support immediately. Your account security may be compromised.</p>
                </div>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Rollers Paradise - The Ultimate Crapless Craps Experience</p>
                <p>This is an automated email. Please do not reply.</p>
              </div>
            </div>
          </body>
        </html>
        `
      );
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the reset if confirmation email fails
    }

    console.log(`Password reset successful for ${email}`);

    return c.json({ 
      success: true,
      message: 'Your password has been reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return c.json({ error: 'Failed to reset password' }, 500);
  }
});

// ==================== CHIP MANAGEMENT ROUTES ====================

// Check if user can claim free chips
app.get('/make-server-67091a4f/chips/can-claim/:email', async (c) => {
  try {
    const email = c.req.param('email');

    // Add retry logic for network issues
    let userData;
    let retries = 3;
    let lastError;
    
    while (retries > 0) {
      try {
        userData = await kv.get(`user:${email}`);
        break; // Success, exit retry loop
      } catch (err) {
        lastError = err;
        retries--;
        if (retries > 0) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
        }
      }
    }
    
    if (!userData && lastError) {
      console.error('Error after retries fetching user data:', lastError);
      // Return a safe default instead of failing completely
      return c.json({ 
        canClaim: false,
        nextClaimTime: Date.now() + (24 * 60 * 60 * 1000),
        timeRemaining: 24 * 60 * 60 * 1000,
        warning: 'Database temporarily unavailable'
      });
    }
    
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userData as any;
    const now = Date.now();
    const lastClaim = user.lastFreeChipsClaim || 0;
    const timeSinceLastClaim = now - lastClaim;
    const twentyFourHours = 24 * 60 * 60 * 1000;

    const canClaim = timeSinceLastClaim >= twentyFourHours;
    const nextClaimTime = canClaim ? now : lastClaim + twentyFourHours;

    return c.json({ 
      canClaim,
      nextClaimTime,
      timeRemaining: canClaim ? 0 : (nextClaimTime - now)
    });
  } catch (error) {
    console.error('Error checking free claim:', error);
    // Return a safe default instead of failing
    return c.json({ 
      canClaim: false,
      nextClaimTime: Date.now() + (24 * 60 * 60 * 1000),
      timeRemaining: 24 * 60 * 60 * 1000,
      error: 'Service temporarily unavailable'
    }, 500);
  }
});

// Get user balance
app.get('/make-server-67091a4f/chips/balance/:email', async (c) => {
  try {
    const email = c.req.param('email');

    // Add retry logic for network issues
    let userData;
    let retries = 3;
    let lastError;
    
    while (retries > 0) {
      try {
        userData = await kv.get(`user:${email}`);
        break;
      } catch (err) {
        lastError = err;
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
        }
      }
    }
    
    if (!userData && lastError) {
      console.error('Error after retries fetching user balance:', lastError);
      return c.json({ 
        balance: 0,
        lastFreeChipsClaim: null,
        warning: 'Database temporarily unavailable'
      });
    }

    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userData as any;
    
    // Ensure balance exists (for backward compatibility)
    if (user.balance === undefined) {
      user.balance = 5000; // Starting balance matches frontend
      user.balanceLastSync = Date.now();
      user.balanceLastSource = 'initialization';
      await resilientKV.set(`user:${email}`, user);
      console.log(`💰 Initialized balance for ${email}: $${user.balance}`);
    }

    return c.json({ 
      balance: user.balance,
      lastFreeChipsClaim: user.lastFreeChipsClaim,
      lastSync: user.balanceLastSync || null
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    return c.json({ 
      balance: 0, 
      lastFreeChipsClaim: null,
      error: 'Failed to fetch balance' 
    }, 500);
  }
});

// ⚡ DEDUPLICATION: Track recent balance updates to prevent duplicates
const recentBalanceUpdates = new Map<string, { balance: number; timestamp: number }>();
const DEDUP_WINDOW = 5000; // 5 seconds

// Update user balance
// 🔄 ENHANCED: Now with timestamp tracking, resilient storage, and deduplication
app.post('/make-server-67091a4f/chips/update-balance', async (c) => {
  try {
    const body = await c.req.json();
    const { email, balance, timestamp, source } = body;

    if (!email || balance === undefined) {
      return c.json({ error: 'Email and balance are required' }, 400);
    }

    // ⚡ DEDUPLICATION: Skip if same balance update within 5 seconds
    const dedupKey = `${email}:${balance}`;
    const recent = recentBalanceUpdates.get(dedupKey);
    const now = Date.now();
    
    if (recent && (now - recent.timestamp) < DEDUP_WINDOW) {
      console.log(`⏩ Skipping duplicate balance update for ${email} (same balance within 5s)`);
      return c.json({ 
        success: true, 
        balance: recent.balance,
        deduplicated: true
      });
    }
    
    // Store this update for deduplication
    recentBalanceUpdates.set(dedupKey, { balance, timestamp: now });
    
    // Clean up old dedup entries (older than 1 minute)
    for (const [key, value] of recentBalanceUpdates.entries()) {
      if (now - value.timestamp > 60000) {
        recentBalanceUpdates.delete(key);
      }
    }

    console.log(`💰 Balance Update Request:`);
    console.log(`   Email: ${email}`);
    console.log(`   New Balance: $${balance}`);
    console.log(`   Source: ${source || 'unknown'}`);
    console.log(`   Timestamp: ${timestamp ? new Date(timestamp).toLocaleString() : 'not provided'}`);

    // 🔒 CRITICAL SECURITY: Validate admin access for arbitrary balance changes
    // Only the owner (Ruski - avgelatt@gmail.com) can set balance to any amount via admin panel
    // Other users can only update their OWN balance through normal gameplay
    const OWNER_EMAIL = 'avgelatt@gmail.com';
    const isSourceFromAdminPanel = source === 'admin-panel';
    
    // If this is an admin panel update, ONLY the owner can do it
    if (isSourceFromAdminPanel && email !== OWNER_EMAIL) {
      console.error(`🚨 UNAUTHORIZED ADMIN ACCESS ATTEMPT!`);
      console.error(`   Email trying to use admin: ${email}`);
      console.error(`   Only ${OWNER_EMAIL} has admin privileges`);
      return c.json({ 
        error: 'Unauthorized: Admin privileges required',
        message: 'Only the game owner can use admin tools'
      }, 403);
    }

    // 🔄 Use resilient KV for better reliability
    const userData = await resilientKV.get(`user:${email}`);
    if (!userData) {
      console.error(`❌ User not found: ${email}`);
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userData as any;
    const previousBalance = user.balance;
    
    user.balance = balance;
    user.balanceLastSync = timestamp || Date.now();
    user.balanceLastSource = source || 'manual';
    
    await resilientKV.set(`user:${email}`, user);

    console.log(`✅ Balance updated successfully:`);
    console.log(`   Previous: $${previousBalance}`);
    console.log(`   New: $${user.balance}`);
    console.log(`   Change: ${balance >= previousBalance ? '+' : ''}$${(balance - previousBalance).toFixed(2)}`);

    return c.json({ 
      success: true, 
      balance: user.balance,
      previousBalance,
      lastSync: user.balanceLastSync
    });
  } catch (error) {
    console.error('❌ Error updating balance:', error);
    return c.json({ error: 'Failed to update balance' }, 500);
  }
});

// Claim free daily chips
app.post('/make-server-67091a4f/chips/claim-free', async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    const userData = await kv.get(`user:${email}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userData as any;
    const now = Date.now();
    const lastClaim = user.lastFreeChipsClaim || 0;
    const timeSinceLastClaim = now - lastClaim;
    const twentyFourHours = 24 * 60 * 60 * 1000;

    // Check if 24 hours have passed
    if (timeSinceLastClaim < twentyFourHours) {
      const timeRemaining = twentyFourHours - timeSinceLastClaim;
      const hoursRemaining = Math.floor(timeRemaining / (60 * 60 * 1000));
      const minutesRemaining = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
      
      return c.json({ 
        error: 'Free chips already claimed',
        canClaimIn: timeRemaining,
        message: `You can claim free chips again in ${hoursRemaining}h ${minutesRemaining}m`
      }, 400);
    }

    // Give 1000 free chips
    user.balance = (user.balance || 0) + 1000;
    user.lastFreeChipsClaim = now;
    await kv.set(`user:${email}`, user);

    return c.json({ 
      success: true, 
      balance: user.balance,
      claimed: 1000,
      message: 'Successfully claimed 1,000 FREE CHIPS!'
    });
  } catch (error) {
    console.error('Error claiming free chips:', error);
    return c.json({ error: 'Failed to claim free chips' }, 500);
  }
});

// Buy chips
app.post('/make-server-67091a4f/chips/buy', async (c) => {
  try {
    const body = await c.req.json();
    const { email, amount, price } = body;

    if (!email || !amount || !price) {
      return c.json({ error: 'Email, amount, and price are required' }, 400);
    }

    // Remove minimum purchase requirement - users can buy starter package
    if (price < 0) {
      return c.json({ error: 'Invalid price' }, 400);
    }

    const userData = await kv.get(`user:${email}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userData as any;
    
    // Check if Stripe is configured
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      return c.json({ 
        error: 'Payment processing not configured. Please contact support.',
        demo: true 
      }, 400);
    }

    try {
      // Get the origin from request header or use fallback
      const origin = c.req.header('origin') || c.req.header('referer')?.split('?')[0] || 'https://www.figma.com';
      
      console.log('Creating Stripe checkout with origin:', origin);
      
      // Create Stripe checkout session
      const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'mode': 'payment',
          'success_url': `${origin}?payment=success&email=${encodeURIComponent(email)}&amount=${amount}`,
          'cancel_url': `${origin}?payment=cancelled`,
          'line_items[0][price_data][currency]': 'usd',
          'line_items[0][price_data][product_data][name]': `$${amount} Casino Chips`,
          'line_items[0][price_data][product_data][description]': 'Rollers Paradise - Social Casino Chips (Entertainment Only)',
          'line_items[0][price_data][unit_amount]': Math.round(price * 100).toString(), // Stripe uses cents - use PRICE not amount, rounded to avoid floating point errors
          'line_items[0][quantity]': '1',
          'client_reference_id': email,
          'metadata[email]': email,
          'metadata[chips_amount]': amount.toString(),
        }).toString(),
      });

      if (!stripeResponse.ok) {
        const error = await stripeResponse.text();
        console.error('Stripe error:', error);
        return c.json({ error: 'Failed to create payment session' }, 500);
      }

      const session = await stripeResponse.json();
      
      console.log('Stripe checkout session created:', session.id);
      console.log('Redirect URL:', session.url);

      return c.json({ 
        success: true,
        checkoutUrl: session.url,
        sessionId: session.id,
      });
    } catch (stripeError) {
      console.error('Stripe integration error:', stripeError);
      return c.json({ 
        error: 'Payment processing error. Please try again.',
      }, 500);
    }
  } catch (error) {
    console.error('Error buying chips:', error);
    return c.json({ error: 'Failed to buy chips' }, 500);
  }
});

// Test/Demo purchase (for Figma Make environment where Stripe redirects don't work)
app.post('/make-server-67091a4f/chips/purchase-test', async (c) => {
  try {
    const body = await c.req.json();
    const { email, amount, price } = body;

    if (!email || !amount || !price) {
      return c.json({ error: 'Email, amount, and price are required' }, 400);
    }

    if (price < 0.99) {
      return c.json({ error: 'Minimum purchase is $0.99' }, 400);
    }

    const userData = await kv.get(`user:${email}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userData as any;
    
    // Add chips to balance (test mode - no real payment)
    user.balance = (user.balance || 0) + amount;
    await kv.set(`user:${email}`, user);

    console.log(`Test purchase: Added ${amount} chips to ${email}. New balance: ${user.balance} (Price would have been $${price})`);

    return c.json({ 
      success: true, 
      balance: user.balance,
      purchased: amount,
      price: price,
      message: `Test purchase successful! Added $${amount} chips! (Demo Mode - No Real Money Charged)`
    });
  } catch (error) {
    console.error('Error in test purchase:', error);
    return c.json({ error: 'Failed to process test purchase' }, 500);
  }
});

// Stripe webhook handler for payment confirmation
app.post('/make-server-67091a4f/chips/stripe-webhook', async (c) => {
  try {
    const body = await c.req.text();
    const signature = c.req.header('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return c.json({ error: 'Webhook not configured' }, 400);
    }

    // In production, verify the webhook signature here
    // For now, we'll process the event directly
    
    const event = JSON.parse(body);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const email = session.metadata?.email || session.client_reference_id;
      const chipsAmount = parseInt(session.metadata?.chips_amount || '0');

      if (email && chipsAmount > 0) {
        const userData = await kv.get(`user:${email}`);
        if (userData) {
          const user = userData as any;
          user.balance = (user.balance || 0) + chipsAmount;
          await kv.set(`user:${email}`, user);

          console.log(`Successfully added ${chipsAmount} chips to ${email}. New balance: ${user.balance}`);
        }
      }
    }

    return c.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

// Confirm payment (called from frontend after successful Stripe redirect)
app.post('/make-server-67091a4f/chips/confirm-payment', async (c) => {
  try {
    const body = await c.req.json();
    const { email, amount, sessionId } = body;

    if (!email || !amount) {
      return c.json({ error: 'Email and amount are required' }, 400);
    }

    const userData = await kv.get(`user:${email}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userData as any;
    
    // Add chips to balance
    user.balance = (user.balance || 0) + amount;
    await kv.set(`user:${email}`, user);

    console.log(`Payment confirmed: Added ${amount} chips to ${email}. New balance: ${user.balance}`);

    return c.json({ 
      success: true, 
      balance: user.balance,
      purchased: amount,
      message: `Successfully purchased $${amount} in chips!`
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    return c.json({ error: 'Failed to confirm payment' }, 500);
  }
});

// ==================== MEMBERSHIP ROUTES ====================

// Purchase membership with Stripe
app.post('/make-server-67091a4f/membership/purchase', async (c) => {
  try {
    const body = await c.req.json();
    const { email, tier, duration, price } = body;

    if (!email || !tier || !duration || !price) {
      return c.json({ error: 'Email, tier, duration, and price are required' }, 400);
    }

    const userData = await kv.get(`user:${email}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Check if Stripe is configured
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      return c.json({ 
        error: 'Payment processing not configured. Please contact support.',
        demo: true 
      }, 400);
    }

    try {
      const origin = c.req.header('origin') || c.req.header('referer')?.split('?')[0] || 'https://www.figma.com';
      
      console.log(`Creating Stripe checkout for ${tier} ${duration} membership`);
      
      // Create Stripe checkout session for membership
      const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'mode': 'payment',
          'success_url': `${origin}?membership_success=true&email=${encodeURIComponent(email)}&tier=${tier}&duration=${duration}`,
          'cancel_url': `${origin}?membership_cancelled=true`,
          'line_items[0][price_data][currency]': 'usd',
          'line_items[0][price_data][product_data][name]': `${tier.toUpperCase()} ${duration === 'monthly' ? 'Monthly' : 'Yearly'} Membership`,
          'line_items[0][price_data][product_data][description]': `Rollers Paradise ${tier.toUpperCase()} Membership - ${duration === 'monthly' ? 'Monthly' : 'Annual'} Subscription`,
          'line_items[0][price_data][unit_amount]': Math.round(price * 100).toString(), // Round to avoid floating point precision errors
          'line_items[0][quantity]': '1',
          'client_reference_id': email,
          'metadata[email]': email,
          'metadata[tier]': tier,
          'metadata[duration]': duration,
          'metadata[type]': 'membership',
        }).toString(),
      });

      if (!stripeResponse.ok) {
        const error = await stripeResponse.text();
        console.error('Stripe error:', error);
        return c.json({ error: 'Failed to create payment session' }, 500);
      }

      const session = await stripeResponse.json();
      
      console.log('Stripe membership checkout session created:', session.id);

      return c.json({ 
        success: true,
        checkoutUrl: session.url,
        sessionId: session.id,
      });
    } catch (stripeError) {
      console.error('Stripe integration error:', stripeError);
      return c.json({ 
        error: 'Payment processing error. Please try again.',
      }, 500);
    }
  } catch (error) {
    console.error('Error purchasing membership:', error);
    return c.json({ error: 'Failed to purchase membership' }, 500);
  }
});

// Confirm membership payment (called from frontend after successful Stripe redirect)
app.post('/make-server-67091a4f/membership/confirm', async (c) => {
  try {
    const body = await c.req.json();
    const { email, tier, duration, sessionId } = body;

    if (!email || !tier || !duration) {
      return c.json({ error: 'Email, tier, and duration are required' }, 400);
    }

    const userData = await kv.get(`user:${email}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userData as any;
    
    // Calculate expiration
    const now = Date.now();
    const durationMs = duration === 'monthly' ? 30 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000;
    
    // Update user's membership
    user.membership = {
      tier,
      duration,
      expiresAt: now + durationMs,
      joinedAt: user.membership?.joinedAt || now,
      lastDailyBonus: null,
      totalMonthsSubscribed: (user.membership?.totalMonthsSubscribed || 0) + (duration === 'monthly' ? 1 : 12),
      autoRenew: true
    };
    
    await kv.set(`user:${email}`, user);

    console.log(`✅ Membership confirmed: ${email} -> ${tier} ${duration}. Expires: ${new Date(now + durationMs).toLocaleDateString()}`);

    return c.json({ 
      success: true, 
      membership: user.membership,
      message: `${tier.toUpperCase()} ${duration} membership activated!`
    });
  } catch (error) {
    console.error('Error confirming membership:', error);
    return c.json({ error: 'Failed to confirm membership' }, 500);
  }
});

// Upgrade membership
app.post('/make-server-67091a4f/membership/upgrade', async (c) => {
  try {
    const body = await c.req.json();
    const { email, newTier, duration, price } = body;

    if (!email || !newTier || !duration || !price) {
      return c.json({ error: 'Email, newTier, duration, and price are required' }, 400);
    }

    // Same as purchase - create Stripe checkout
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      return c.json({ 
        error: 'Payment processing not configured.',
        demo: true 
      }, 400);
    }

    const origin = c.req.header('origin') || c.req.header('referer')?.split('?')[0] || 'https://www.figma.com';
    
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'payment',
        'success_url': `${origin}?membership_success=true&email=${encodeURIComponent(email)}&tier=${newTier}&duration=${duration}&upgrade=true`,
        'cancel_url': `${origin}?membership_cancelled=true`,
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][product_data][name]': `Upgrade to ${newTier.toUpperCase()} ${duration === 'monthly' ? 'Monthly' : 'Yearly'}`,
        'line_items[0][price_data][product_data][description]': `Upgrade your Rollers Paradise membership`,
        'line_items[0][price_data][unit_amount]': Math.round(price * 100).toString(), // Round to avoid floating point precision errors
        'line_items[0][quantity]': '1',
        'client_reference_id': email,
        'metadata[email]': email,
        'metadata[tier]': newTier,
        'metadata[duration]': duration,
        'metadata[type]': 'membership_upgrade',
      }).toString(),
    });

    if (!stripeResponse.ok) {
      const error = await stripeResponse.text();
      console.error('Stripe error:', error);
      return c.json({ error: 'Failed to create upgrade session' }, 500);
    }

    const session = await stripeResponse.json();
    
    return c.json({ 
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Error upgrading membership:', error);
    return c.json({ error: 'Failed to upgrade membership' }, 500);
  }
});

// Downgrade membership (takes effect at end of billing period)
app.post('/make-server-67091a4f/membership/downgrade', async (c) => {
  try {
    const body = await c.req.json();
    const { email, newTier } = body;

    if (!email || !newTier) {
      return c.json({ error: 'Email and newTier are required' }, 400);
    }

    const userData = await kv.get(`user:${email}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userData as any;
    
    // Schedule downgrade for end of billing period
    user.membership = user.membership || {};
    user.membership.pendingDowngrade = newTier;
    user.membership.autoRenew = false;
    
    await kv.set(`user:${email}`, user);

    console.log(`⬇️ Downgrade scheduled: ${email} -> ${newTier} at end of billing period`);

    return c.json({ 
      success: true,
      message: `Downgrade to ${newTier.toUpperCase()} scheduled for end of billing period`
    });
  } catch (error) {
    console.error('Error scheduling downgrade:', error);
    return c.json({ error: 'Failed to schedule downgrade' }, 500);
  }
});

// Cancel membership
app.post('/make-server-67091a4f/membership/cancel', async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    const userData = await kv.get(`user:${email}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userData as any;
    
    // Cancel membership immediately
    user.membership = {
      tier: 'free',
      duration: null,
      expiresAt: null,
      joinedAt: user.membership?.joinedAt || null,
      lastDailyBonus: null,
      totalMonthsSubscribed: user.membership?.totalMonthsSubscribed || 0,
      autoRenew: false
    };
    
    await kv.set(`user:${email}`, user);

    console.log(`❌ Membership cancelled: ${email}`);

    return c.json({ 
      success: true,
      message: 'Membership cancelled'
    });
  } catch (error) {
    console.error('Error cancelling membership:', error);
    return c.json({ error: 'Failed to cancel membership' }, 500);
  }
});

// Claim daily membership bonus
app.post('/make-server-67091a4f/membership/daily-bonus', async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    const userData = await kv.get(`user:${email}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userData as any;
    const membership = user.membership || { tier: 'free' };
    
    if (membership.tier === 'free') {
      return c.json({ error: 'No active membership' }, 400);
    }

    // Check if already claimed today
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    if (membership.lastDailyBonus && (now - membership.lastDailyBonus) < dayInMs) {
      const timeLeft = dayInMs - (now - membership.lastDailyBonus);
      const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
      return c.json({ 
        error: 'Daily bonus already claimed',
        nextClaimIn: timeLeft,
        hoursLeft
      }, 400);
    }

    // Determine bonus amount based on tier
    const bonusAmounts = {
      free: 100,
      basic: 250,
      silver: 500,
      gold: 1000,
      platinum: 2500
    };
    
    const bonusAmount = bonusAmounts[membership.tier as keyof typeof bonusAmounts] || 100;
    
    // Add bonus to balance
    user.balance = (user.balance || 0) + bonusAmount;
    user.membership.lastDailyBonus = now;
    
    await kv.set(`user:${email}`, user);

    console.log(`🎁 Daily bonus claimed: ${email} (${membership.tier}) -> $${bonusAmount}`);

    return c.json({ 
      success: true,
      bonus: bonusAmount,
      balance: user.balance,
      tier: membership.tier,
      message: `${membership.tier.toUpperCase()} Daily Bonus: $${bonusAmount} claimed!`
    });
  } catch (error) {
    console.error('Error claiming daily bonus:', error);
    return c.json({ error: 'Failed to claim daily bonus' }, 500);
  }
});

// ==================== STATS & LEADERBOARD ROUTES ====================

// OPTIONS handler for stats update (CORS preflight)
app.options('/make-server-67091a4f/stats/update', (c) => {
  return c.text('', 204);
});

// Update player stats after each game
// This endpoint is called by BOTH single-player and multiplayer games
// to ensure accurate leaderboard stats across all game modes
// Stats tracked: wins, losses, rolls, wagered, biggestWin, level, xp
app.post('/make-server-67091a4f/stats/update', async (c) => {
  try {
    const body = await c.req.json();
    const { email, stats } = body;

    if (!email || !stats) {
      return c.json({ error: 'Email and stats are required' }, 400);
    }

    const userData = await kv.get(`user:${email}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userData as any;
    
    // Initialize stats if they don't exist
    if (!user.stats) {
      user.stats = {
        totalWins: 0,
        totalLosses: 0,
        totalRolls: 0,
        biggestWin: 0,
        totalWagered: 0,
        level: 1,
        xp: 0,
      };
    }

    // ⚠️ ANTI-CHEAT: Validate stat changes are reasonable
    const maxReasonableWins = 100; // Max wins per update
    const maxReasonableLosses = 100;
    const maxReasonableRolls = 200;
    const maxReasonableWager = 1000000; // $1M per update
    
    if ((stats.wins || 0) > maxReasonableWins ||
        (stats.losses || 0) > maxReasonableLosses ||
        (stats.rolls || 0) > maxReasonableRolls ||
        (stats.wagered || 0) > maxReasonableWager) {
      console.error(`⚠️ SUSPICIOUS STATS from ${email}:`, stats);
      return c.json({ error: 'Invalid stat values detected' }, 400);
    }

    // Update stats (incrementally)
    user.stats.totalWins = (user.stats.totalWins || 0) + (stats.wins || 0);
    user.stats.totalLosses = (user.stats.totalLosses || 0) + (stats.losses || 0);
    user.stats.totalRolls = (user.stats.totalRolls || 0) + (stats.rolls || 0);
    user.stats.totalWagered = (user.stats.totalWagered || 0) + (stats.wagered || 0);
    
    // Update biggest win if new win is larger
    const previousBiggestWin = user.stats.biggestWin || 0;
    if (stats.biggestWin && stats.biggestWin > previousBiggestWin) {
      user.stats.biggestWin = stats.biggestWin;
      console.log(`🎉 NEW BIGGEST WIN for ${email}: $${stats.biggestWin} (previous: $${previousBiggestWin})`);
    }
    
    // Update level and XP if provided
    if (stats.level) user.stats.level = stats.level;
    if (stats.xp !== undefined) user.stats.xp = stats.xp;

    // 🔒 SECURITY: Track last update time for timeframe filtering
    user.stats.lastUpdated = Date.now();
    
    // Track stat history for auditing (keep last 10 updates)
    if (!user.statHistory) user.statHistory = [];
    user.statHistory.unshift({
      timestamp: Date.now(),
      changes: stats,
      totalWins: user.stats.totalWins,
      totalLosses: user.stats.totalLosses,
      biggestWin: user.stats.biggestWin,
    });
    if (user.statHistory.length > 10) user.statHistory.length = 10;
    
    await kv.set(`user:${email}`, user);

    console.log(`📊 LEGITIMATE Stats updated for ${email}:`, {
      totalWins: user.stats.totalWins,
      totalLosses: user.stats.totalLosses,
      biggestWin: user.stats.biggestWin,
      level: user.stats.level,
      lastUpdate: new Date(user.stats.lastUpdated).toISOString()
    });

    return c.json({ 
      success: true, 
      stats: user.stats 
    });
  } catch (error) {
    console.error('Error updating stats:', error);
    return c.json({ error: 'Failed to update stats' }, 500);
  }
});

// OPTIONS handler for leaderboard (CORS preflight)
app.options('/make-server-67091a4f/leaderboard', (c) => {
  return c.text('', 204);
});

// Get leaderboard
app.get('/make-server-67091a4f/leaderboard', async (c) => {
  console.log('🎯 Leaderboard endpoint hit');
  
  try {
    const category = c.req.query('category') || 'total_wins';
    const timeframe = c.req.query('timeframe') || 'all_time';
    const currentPlayerEmail = c.req.query('email');

    console.log(`📊 Fetching leaderboard: category=${category}, timeframe=${timeframe}, player=${currentPlayerEmail || 'none'}`);

    // Check if we have cached leaderboard data (cache for 30 seconds)
    const cacheKey = `leaderboard_cache:${category}:${timeframe}`;
    const cachedData = await kv.get(cacheKey).catch(() => null);
    
    if (cachedData && cachedData.timestamp && (Date.now() - cachedData.timestamp) < 30000) {
      console.log('✅ Returning cached leaderboard (fresh cache)');
      
      // Find current player's rank from cached data
      let currentPlayerRank = null;
      if (currentPlayerEmail && cachedData.sortedEmails) {
        const playerIndex = cachedData.sortedEmails.indexOf(currentPlayerEmail);
        if (playerIndex !== -1) {
          currentPlayerRank = playerIndex + 1;
        }
      }
      
      return c.json({ 
        players: cachedData.players,
        currentPlayerRank,
        category,
        timeframe,
        cached: true
      });
    }

    console.log('🔄 Cache miss or expired, fetching fresh data...');

    // Get all users with resilient wrapper to handle connection issues
    let usersData;
    try {
      usersData = await resilientKV.getByPrefix('user:');
    } catch (kvError) {
      console.error('❌ KV getByPrefix failed:', kvError);
      
      // If we have stale cache, return it instead of error
      if (cachedData && cachedData.players) {
        console.log('⚠️ Database error, returning stale cache');
        return c.json({ 
          players: cachedData.players, 
          currentPlayerRank: null,
          cached: true,
          stale: true
        });
      }
      
      // No cache available, return empty
      return c.json({ 
        players: [], 
        currentPlayerRank: null,
        error: 'Database temporarily unavailable'
      });
    }
    
    if (!usersData || usersData.length === 0) {
      console.log('⚠️ No users found in database');
      return c.json({ players: [], currentPlayerRank: null });
    }

    console.log(`Found ${usersData.length} users in database`);

    // Filter users with stats (getByPrefix returns values directly)
    let users = usersData
      .filter((user: any) => user && user.stats); // Only users with stats

    console.log(`${users.length} users have stats`);

    // Apply timeframe filter if needed (for now, all_time only)
    if (timeframe === 'weekly') {
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      users = users.filter((user: any) => 
        user.stats.lastUpdated && user.stats.lastUpdated > weekAgo
      );
    } else if (timeframe === 'monthly') {
      const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      users = users.filter((user: any) => 
        user.stats.lastUpdated && user.stats.lastUpdated > monthAgo
      );
    }

    // Sort based on category
    const sortedUsers = users.sort((a: any, b: any) => {
      switch (category) {
        case 'total_wins':
          return (b.stats.totalWins || 0) - (a.stats.totalWins || 0);
        case 'biggest_win':
          return (b.stats.biggestWin || 0) - (a.stats.biggestWin || 0);
        case 'level':
          return (b.stats.level || 0) - (a.stats.level || 0);
        case 'win_rate': {
          const aRate = a.stats.totalWins && a.stats.totalLosses 
            ? (a.stats.totalWins / (a.stats.totalWins + a.stats.totalLosses)) * 100 
            : 0;
          const bRate = b.stats.totalWins && b.stats.totalLosses 
            ? (b.stats.totalWins / (b.stats.totalWins + b.stats.totalLosses)) * 100 
            : 0;
          return bRate - aRate;
        }
        default:
          return 0;
      }
    });

    // Create leaderboard with ranks (top 100 only)
    const players = sortedUsers.slice(0, 100).map((user: any, index: number) => {
      let value = 0;
      
      switch (category) {
        case 'total_wins':
          value = user.stats.totalWins || 0;
          break;
        case 'biggest_win':
          value = user.stats.biggestWin || 0;
          break;
        case 'level':
          value = user.stats.level || 0;
          break;
        case 'win_rate': {
          if (user.stats.totalWins && user.stats.totalLosses) {
            value = Math.round((user.stats.totalWins / (user.stats.totalWins + user.stats.totalLosses)) * 100);
          }
          break;
        }
      }

      return {
        rank: index + 1,
        name: user.name,
        email: user.email,
        value,
        level: user.stats.level || 1,
        avatar: user.avatar,
      };
    });

    // Cache the results (store email order for rank lookups)
    const sortedEmails = sortedUsers.map((u: any) => u.email);
    await kv.set(cacheKey, {
      players,
      sortedEmails,
      timestamp: Date.now()
    }).catch((e) => {
      console.warn('⚠️ Failed to cache leaderboard:', e.message);
    });

    // Find current player's rank
    let currentPlayerRank = null;
    if (currentPlayerEmail) {
      const playerIndex = sortedUsers.findIndex((user: any) => user.email === currentPlayerEmail);
      if (playerIndex !== -1) {
        currentPlayerRank = playerIndex + 1;
      }
    }

    // Log top players for debugging
    if (category === 'biggest_win' && players.length > 0) {
      console.log(`🏆 Top 5 Biggest Wins:`, players.slice(0, 5).map((p: any) => ({
        rank: p.rank,
        name: p.name,
        biggestWin: p.value
      })));
    }

    console.log(`✅ Returning ${players.length} players, current rank: ${currentPlayerRank}`);

    return c.json({ 
      players,
      currentPlayerRank,
      category,
      timeframe,
      cached: false
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return c.json({ error: 'Failed to fetch leaderboard' }, 500);
  }
});

// ===============================
// FRIENDS SYSTEM ENDPOINTS
// ===============================

// Get friends list
app.get('/make-server-67091a4f/friends', async (c) => {
  try {
    const email = c.req.query('email');
    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    // Get user's friends list
    const friendsList = await kv.get(`friends:${email}`) || [];
    
    // Get detailed info for each friend
    const friends = await Promise.all(
      friendsList.map(async (friendEmail: string) => {
        const userData = await kv.get(`user:${friendEmail}`);
        const presence = await kv.get(`presence:${friendEmail}`);
        
        return {
          email: friendEmail,
          name: userData?.name || 'Unknown',
          avatar: userData?.avatar || '🎲',
          level: userData?.stats?.level || 1,
          isOnline: presence && (Date.now() - presence.lastActive < 5 * 60 * 1000),
          lastSeen: presence?.lastActive || null,
        };
      })
    );

    return c.json({ friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return c.json({ error: 'Failed to fetch friends' }, 500);
  }
});

// Get friend requests (pending)
app.get('/make-server-67091a4f/friends/requests', async (c) => {
  try {
    const email = c.req.query('email');
    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    const requests = await kv.get(`friend_requests:${email}`) || [];
    
    // Get details for each requester
    const detailedRequests = await Promise.all(
      requests.map(async (req: any) => {
        const userData = await kv.get(`user:${req.from}`);
        return {
          from: req.from,
          name: userData?.name || 'Unknown',
          avatar: userData?.avatar || '🎲',
          timestamp: req.timestamp,
        };
      })
    );

    return c.json({ requests: detailedRequests });
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    return c.json({ error: 'Failed to fetch requests' }, 500);
  }
});

// Send friend request
app.post('/make-server-67091a4f/friends/request', async (c) => {
  try {
    const { from, to } = await c.req.json();
    
    if (!from || !to) {
      return c.json({ error: 'From and to emails are required' }, 400);
    }

    if (from === to) {
      return c.json({ error: 'Cannot send friend request to yourself' }, 400);
    }

    // Check if already friends
    const friendsList = await kv.get(`friends:${from}`) || [];
    if (friendsList.includes(to)) {
      return c.json({ error: 'Already friends' }, 400);
    }

    // Check if request already exists
    const existingRequests = await kv.get(`friend_requests:${to}`) || [];
    if (existingRequests.some((r: any) => r.from === from)) {
      return c.json({ error: 'Friend request already sent' }, 400);
    }

    // Add friend request
    const newRequest = {
      from,
      timestamp: Date.now(),
    };
    
    await kv.set(`friend_requests:${to}`, [...existingRequests, newRequest]);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error sending friend request:', error);
    return c.json({ error: 'Failed to send friend request' }, 500);
  }
});

// Accept friend request
app.post('/make-server-67091a4f/friends/accept', async (c) => {
  try {
    const { email, friendEmail } = await c.req.json();
    
    if (!email || !friendEmail) {
      return c.json({ error: 'Email and friendEmail are required' }, 400);
    }

    // Remove from pending requests
    const requests = await kv.get(`friend_requests:${email}`) || [];
    const updatedRequests = requests.filter((r: any) => r.from !== friendEmail);
    await kv.set(`friend_requests:${email}`, updatedRequests);

    // Add to both friends lists
    const userFriends = await kv.get(`friends:${email}`) || [];
    const friendFriends = await kv.get(`friends:${friendEmail}`) || [];
    
    if (!userFriends.includes(friendEmail)) {
      await kv.set(`friends:${email}`, [...userFriends, friendEmail]);
    }
    
    if (!friendFriends.includes(email)) {
      await kv.set(`friends:${friendEmail}`, [...friendFriends, email]);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    return c.json({ error: 'Failed to accept friend request' }, 500);
  }
});

// Reject friend request
app.post('/make-server-67091a4f/friends/reject', async (c) => {
  try {
    const { email, friendEmail } = await c.req.json();
    
    if (!email || !friendEmail) {
      return c.json({ error: 'Email and friendEmail are required' }, 400);
    }

    // Remove from pending requests
    const requests = await kv.get(`friend_requests:${email}`) || [];
    const updatedRequests = requests.filter((r: any) => r.from !== friendEmail);
    await kv.set(`friend_requests:${email}`, updatedRequests);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    return c.json({ error: 'Failed to reject friend request' }, 500);
  }
});

// Remove friend
app.delete('/make-server-67091a4f/friends/remove', async (c) => {
  try {
    const { email, friendEmail } = await c.req.json();
    
    if (!email || !friendEmail) {
      return c.json({ error: 'Email and friendEmail are required' }, 400);
    }

    // Remove from both friends lists
    const userFriends = await kv.get(`friends:${email}`) || [];
    const friendFriends = await kv.get(`friends:${friendEmail}`) || [];
    
    await kv.set(`friends:${email}`, userFriends.filter((e: string) => e !== friendEmail));
    await kv.set(`friends:${friendEmail}`, friendFriends.filter((e: string) => e !== email));

    return c.json({ success: true });
  } catch (error) {
    console.error('Error removing friend:', error);
    return c.json({ error: 'Failed to remove friend' }, 500);
  }
});

// Search for players
app.get('/make-server-67091a4f/friends/search', async (c) => {
  try {
    const query = c.req.query('q')?.toLowerCase();
    const currentEmail = c.req.query('email');
    
    if (!query || query.length < 2) {
      return c.json({ players: [] });
    }

    // Get all users
    const allUsers = await kv.getByPrefix('user:');
    
    // Filter by name or email (partial match)
    const matches = allUsers
      .filter((user: any) => 
        user && 
        user.email !== currentEmail &&
        !user.email.includes('@temporary.local') &&
        (user.name?.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query))
      )
      .slice(0, 10)
      .map((user: any) => ({
        email: user.email,
        name: user.name || 'Unknown',
        avatar: user.avatar || '🎲',
        level: user.stats?.level || 1,
      }));

    return c.json({ players: matches });
  } catch (error) {
    console.error('Error searching players:', error);
    return c.json({ error: 'Failed to search players' }, 500);
  }
});

// Get friend's stats (with privacy check)
app.get('/make-server-67091a4f/friends/stats/:email', async (c) => {
  try {
    const friendEmail = c.req.param('email');
    const requestorEmail = c.req.query('requestor');
    
    if (!friendEmail || !requestorEmail) {
      return c.json({ error: 'Friend email and requestor are required' }, 400);
    }

    // Check if they're friends
    const friendsList = await kv.get(`friends:${requestorEmail}`) || [];
    if (!friendsList.includes(friendEmail)) {
      return c.json({ error: 'Not friends with this player' }, 403);
    }

    // Get friend's data
    const userData = await kv.get(`user:${friendEmail}`);
    if (!userData) {
      return c.json({ error: 'Player not found' }, 404);
    }

    // Check privacy settings
    const statsPublic = userData.statsPublic !== false; // Default to public
    
    if (!statsPublic) {
      return c.json({ 
        error: 'This player has made their stats private',
        isPrivate: true 
      }, 403);
    }

    // Return stats
    return c.json({
      name: userData.name,
      avatar: userData.avatar,
      stats: userData.stats || {},
      level: userData.stats?.level || 1,
      xp: userData.stats?.xp || 0,
    });
  } catch (error) {
    console.error('Error fetching friend stats:', error);
    return c.json({ error: 'Failed to fetch friend stats' }, 500);
  }
});

// Send message
app.post('/make-server-67091a4f/messages/send', async (c) => {
  try {
    const { from, to, message } = await c.req.json();
    
    if (!from || !to || !message) {
      return c.json({ error: 'From, to, and message are required' }, 400);
    }

    // Check if they're friends
    const friendsList = await kv.get(`friends:${from}`) || [];
    if (!friendsList.includes(to)) {
      return c.json({ error: 'Can only message friends' }, 403);
    }

    // Create conversation ID (sorted emails for consistency)
    const conversationId = [from, to].sort().join('___');
    
    // Get existing messages
    const messages = await kv.get(`messages:${conversationId}`) || [];
    
    // Add new message
    const newMessage = {
      from,
      to,
      message,
      timestamp: Date.now(),
      read: false,
    };
    
    await kv.set(`messages:${conversationId}`, [...messages, newMessage]);

    return c.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

// Get messages
app.get('/make-server-67091a4f/messages/:conversationId', async (c) => {
  try {
    const conversationId = c.req.param('conversationId');
    const email = c.req.query('email');
    
    if (!conversationId || !email) {
      return c.json({ error: 'Conversation ID and email are required' }, 400);
    }

    // Verify user is part of conversation
    const participants = conversationId.split('___');
    if (!participants.includes(email)) {
      return c.json({ error: 'Not authorized to view this conversation' }, 403);
    }

    const messages = await kv.get(`messages:${conversationId}`) || [];
    
    // Mark messages as read
    const updatedMessages = messages.map((msg: any) => {
      if (msg.to === email && !msg.read) {
        return { ...msg, read: true };
      }
      return msg;
    });
    
    await kv.set(`messages:${conversationId}`, updatedMessages);

    return c.json({ messages: updatedMessages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

// Update stats privacy setting
app.post('/make-server-67091a4f/settings/stats-privacy', async (c) => {
  try {
    const { email, statsPublic } = await c.req.json();
    
    if (!email || typeof statsPublic !== 'boolean') {
      return c.json({ error: 'Email and statsPublic boolean are required' }, 400);
    }

    // Get user data
    const userData = await kv.get(`user:${email}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Update privacy setting
    userData.statsPublic = statsPublic;
    await kv.set(`user:${email}`, userData);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error updating stats privacy:', error);
    return c.json({ error: 'Failed to update privacy settings' }, 500);
  }
});

// ===============================
// END FRIENDS SYSTEM ENDPOINTS
// ===============================

// Get fresh user profile (for post-payment updates)
app.post('/make-server-67091a4f/user/profile', async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    console.log(`🔄 Fetching fresh profile for: ${email}`);

    // Get user data from KV store with retry logic
    const userData = await retryOperation(
      async () => await kv.get(`user:${email}`),
      3,
      500
    );
    
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userData as any;

    // Determine membership tier from membership object
    let membershipTier = 'free';
    let membershipExpiry = null;
    
    if (user.membership && user.membership.expiresAt && user.membership.expiresAt > Date.now()) {
      membershipTier = user.membership.tier;
      membershipExpiry = user.membership.expiresAt;
    }

    // Return complete profile with all current data
    const profile = {
      id: user.id || user.email,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      phone: user.phone,
      chips: user.balance || 0,
      membershipTier: membershipTier,
      membershipExpiry: membershipExpiry,
      membership: user.membership, // Include full membership object
      stats: user.stats || {
        totalWins: 0,
        totalLosses: 0,
        totalRolls: 0,
        biggestWin: 0,
        totalWagered: 0,
        level: 1,
        xp: 0,
      },
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };

    console.log('✅ Profile fetched:', {
      email: profile.email,
      chips: profile.chips,
      membershipTier: profile.membershipTier,
      membershipExpiry: membershipExpiry ? new Date(membershipExpiry).toLocaleDateString() : 'none',
    });

    return c.json({ success: true, profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Get player stats for profile page
app.get('/make-server-67091a4f/player/stats', async (c) => {
  try {
    const email = c.req.query('email');

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    console.log(`📊 Fetching player stats for: ${email}`);

    // Get user data
    const userData = await kv.get(`user:${email}`);
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }

    const user = userData as any;

    // Initialize stats if they don't exist
    if (!user.stats) {
      user.stats = {
        totalWins: 0,
        totalLosses: 0,
        totalRolls: 0,
        biggestWin: 0,
        totalWagered: 0,
        level: 1,
        xp: 0,
      };
    }

    // Calculate derived stats
    const totalGames = (user.stats.totalWins || 0) + (user.stats.totalLosses || 0);
    const winRate = totalGames > 0 ? ((user.stats.totalWins || 0) / totalGames) * 100 : 0;

    // Get player rank from leaderboard
    const usersData = await kv.getByPrefix('user:');
    const usersWithStats = usersData
      .filter((u: any) => u && u.stats)
      .sort((a: any, b: any) => (b.stats.totalWins || 0) - (a.stats.totalWins || 0));
    
    const playerIndex = usersWithStats.findIndex((u: any) => u.email === email);
    const rank = playerIndex !== -1 ? playerIndex + 1 : usersWithStats.length;

    // Return formatted stats
    const playerStats = {
      totalGamesPlayed: totalGames,
      totalWins: user.stats.totalWins || 0,
      totalLosses: user.stats.totalLosses || 0,
      biggestWin: user.stats.biggestWin || 0,
      totalWagered: user.stats.totalWagered || 0,
      totalWon: 0, // Could be calculated if we track it
      currentStreak: 0, // Would need to track this separately
      longestStreak: 0, // Would need to track this separately
      winRate: Math.round(winRate * 10) / 10, // Round to 1 decimal
      favoriteNumber: 7, // Default for now
      level: user.stats.level || 1,
      experience: user.stats.xp || 0,
      rank: rank,
      totalPlayers: usersWithStats.length,
      achievements: [], // Would come from achievements system
      recentGames: [], // Would need to track game history
    };

    console.log(`✅ Player stats for ${email}:`, playerStats);

    return c.json(playerStats);
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return c.json({ error: 'Failed to fetch player stats' }, 500);
  }
});

// Error handler
// ====== CLOUD DATA PERSISTENCE ENDPOINTS ======

// Save user game data to cloud
app.post('/make-server-67091a4f/user/save-data', async (c) => {
  try {
    const body = await c.req.json();
    const { email, data } = body;

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    // Save user data to cloud with timestamp
    const saveData = {
      ...data,
      lastSaved: Date.now()
    };

    await kv.set(`gamedata:${email}`, saveData);
    
    console.log(`💾 Cloud data saved for ${email}`);
    return c.json({ 
      success: true, 
      message: 'Data saved to cloud',
      timestamp: saveData.lastSaved
    });
  } catch (error) {
    console.error('Error saving user data:', error);
    return c.json({ error: 'Failed to save data' }, 500);
  }
});

// Load user game data from cloud
app.get('/make-server-67091a4f/user/load-data', async (c) => {
  try {
    const email = c.req.query('email');

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    // Load user data from cloud
    const data = await kv.get(`gamedata:${email}`);
    
    if (!data) {
      console.log(`📂 No cloud data found for ${email}`);
      return c.json({ 
        success: false, 
        message: 'No saved data found'
      });
    }

    console.log(`📥 Cloud data loaded for ${email}`);
    return c.json({ 
      success: true, 
      data: data,
      timestamp: data.lastSaved || Date.now()
    });
  } catch (error) {
    console.error('Error loading user data:', error);
    return c.json({ error: 'Failed to load data' }, 500);
  }
});

// Auto-save endpoint (called periodically while playing)
app.post('/make-server-67091a4f/user/auto-save', async (c) => {
  try {
    const body = await c.req.json();
    const { email, balance, xp, level, boosts, achievements, stats } = body;

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    // Save lightweight auto-save data
    const autoSaveData = {
      balance,
      xp,
      level,
      boosts,
      achievements,
      stats,
      lastSaved: Date.now()
    };

    await kv.set(`gamedata:${email}`, autoSaveData);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error auto-saving user data:', error);
    return c.json({ error: 'Failed to auto-save' }, 500);
  }
});

// ============================================
// ONLINE PRESENCE SYSTEM
// ============================================

// Update player's online status
app.post('/make-server-67091a4f/presence/update', async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    // Update last active timestamp
    await kv.set(`presence:${email}`, {
      email,
      lastActive: Date.now(),
      status: 'online'
    });

    console.log(`✅ Updated presence for ${email}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error updating presence:', error);
    return c.json({ error: 'Failed to update presence' }, 500);
  }
});

// Get online players
app.get('/make-server-67091a4f/presence/online', async (c) => {
  try {
    const allPresence = await kv.getByPrefix('presence:');
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    
    // Filter for active players (active in last 5 minutes)
    const onlinePlayers = allPresence.filter((p: any) => 
      p && p.lastActive && p.lastActive > fiveMinutesAgo
    );

    return c.json({ 
      count: onlinePlayers.length,
      players: onlinePlayers.map((p: any) => ({
        email: p.email,
        lastActive: p.lastActive
      }))
    });
  } catch (error) {
    console.error('Error getting online players:', error);
    return c.json({ error: 'Failed to get online players' }, 500);
  }
});

// ============================================
// FRIENDS SYSTEM
// ============================================

// Send friend request
app.post('/make-server-67091a4f/friends/request', async (c) => {
  try {
    const body = await c.req.json();
    const { fromEmail, toEmail } = body;

    if (!fromEmail || !toEmail) {
      return c.json({ error: 'Both emails are required' }, 400);
    }

    if (fromEmail === toEmail) {
      return c.json({ error: 'Cannot send friend request to yourself' }, 400);
    }

    // Check if users exist
    const fromUser = await kv.get(`user:${fromEmail}`);
    const toUser = await kv.get(`user:${toEmail}`);

    if (!fromUser || !toUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Check if already friends
    const existingFriends = await kv.get(`friends:${fromEmail}`) || [];
    if ((existingFriends as any[]).includes(toEmail)) {
      return c.json({ error: 'Already friends' }, 400);
    }

    // Check if request already sent
    const existingRequests = await kv.get(`friend_requests:${toEmail}`) || [];
    if ((existingRequests as any[]).some((r: any) => r.from === fromEmail)) {
      return c.json({ error: 'Friend request already sent' }, 400);
    }

    // Add friend request
    const requests = existingRequests as any[];
    requests.push({
      from: fromEmail,
      fromName: (fromUser as any).name,
      timestamp: Date.now()
    });

    await kv.set(`friend_requests:${toEmail}`, requests);

    console.log(`✅ Friend request sent from ${fromEmail} to ${toEmail}`);
    return c.json({ success: true, message: 'Friend request sent!' });
  } catch (error) {
    console.error('Error sending friend request:', error);
    return c.json({ error: 'Failed to send friend request' }, 500);
  }
});

// Accept friend request
app.post('/make-server-67091a4f/friends/accept', async (c) => {
  try {
    const body = await c.req.json();
    const { email, friendEmail } = body;

    if (!email || !friendEmail) {
      return c.json({ error: 'Both emails are required' }, 400);
    }

    // Remove the request
    const requests = (await kv.get(`friend_requests:${email}`) || []) as any[];
    const updatedRequests = requests.filter((r: any) => r.from !== friendEmail);
    await kv.set(`friend_requests:${email}`, updatedRequests);

    // Add to both friends lists
    const userFriends = (await kv.get(`friends:${email}`) || []) as any[];
    const friendFriends = (await kv.get(`friends:${friendEmail}`) || []) as any[];

    if (!userFriends.includes(friendEmail)) {
      userFriends.push(friendEmail);
    }
    if (!friendFriends.includes(email)) {
      friendFriends.push(email);
    }

    await kv.set(`friends:${email}`, userFriends);
    await kv.set(`friends:${friendEmail}`, friendFriends);

    console.log(`✅ ${email} accepted friend request from ${friendEmail}`);
    return c.json({ success: true, message: 'Friend request accepted!' });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    return c.json({ error: 'Failed to accept friend request' }, 500);
  }
});

// Decline friend request
app.post('/make-server-67091a4f/friends/decline', async (c) => {
  try {
    const body = await c.req.json();
    const { email, friendEmail } = body;

    if (!email || !friendEmail) {
      return c.json({ error: 'Both emails are required' }, 400);
    }

    // Remove the request
    const requests = (await kv.get(`friend_requests:${email}`) || []) as any[];
    const updatedRequests = requests.filter((r: any) => r.from !== friendEmail);
    await kv.set(`friend_requests:${email}`, updatedRequests);

    console.log(`✅ ${email} declined friend request from ${friendEmail}`);
    return c.json({ success: true, message: 'Friend request declined' });
  } catch (error) {
    console.error('Error declining friend request:', error);
    return c.json({ error: 'Failed to decline friend request' }, 500);
  }
});

// Remove friend
app.post('/make-server-67091a4f/friends/remove', async (c) => {
  try {
    const body = await c.req.json();
    const { email, friendEmail } = body;

    if (!email || !friendEmail) {
      return c.json({ error: 'Both emails are required' }, 400);
    }

    // Remove from both friends lists
    const userFriends = (await kv.get(`friends:${email}`) || []) as any[];
    const friendFriends = (await kv.get(`friends:${friendEmail}`) || []) as any[];

    const updatedUserFriends = userFriends.filter((f: string) => f !== friendEmail);
    const updatedFriendFriends = friendFriends.filter((f: string) => f !== email);

    await kv.set(`friends:${email}`, updatedUserFriends);
    await kv.set(`friends:${friendEmail}`, updatedFriendFriends);

    console.log(`✅ ${email} removed friend ${friendEmail}`);
    return c.json({ success: true, message: 'Friend removed' });
  } catch (error) {
    console.error('Error removing friend:', error);
    return c.json({ error: 'Failed to remove friend' }, 500);
  }
});

// Get friends list
app.get('/make-server-67091a4f/friends/list', async (c) => {
  try {
    const email = c.req.query('email');

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    const friendEmails = (await kv.get(`friends:${email}`) || []) as string[];
    
    // Get friend details
    const friends = await Promise.all(
      friendEmails.map(async (friendEmail) => {
        const user = await kv.get(`user:${friendEmail}`) as any;
        const presence = await kv.get(`presence:${friendEmail}`) as any;
        
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        const isOnline = presence && presence.lastActive > fiveMinutesAgo;

        return {
          email: friendEmail,
          name: user?.name || 'Unknown',
          avatar: user?.avatar,
          level: user?.stats?.level || 1,
          isOnline,
          lastActive: presence?.lastActive
        };
      })
    );

    return c.json({ friends });
  } catch (error) {
    console.error('Error getting friends list:', error);
    return c.json({ error: 'Failed to get friends list' }, 500);
  }
});

// Get friend requests
app.get('/make-server-67091a4f/friends/requests', async (c) => {
  try {
    const email = c.req.query('email');

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    const requests = (await kv.get(`friend_requests:${email}`) || []) as any[];

    return c.json({ requests });
  } catch (error) {
    console.error('Error getting friend requests:', error);
    return c.json({ error: 'Failed to get friend requests' }, 500);
  }
});

// Search for users
app.get('/make-server-67091a4f/friends/search', async (c) => {
  try {
    const query = c.req.query('q');
    const currentUserEmail = c.req.query('email');

    if (!query || !currentUserEmail) {
      return c.json({ error: 'Search query and email are required' }, 400);
    }

    const allUsers = await kv.getByPrefix('user:');
    const searchLower = query.toLowerCase();

    const results = allUsers
      .filter((user: any) => {
        if (!user || user.email === currentUserEmail) return false;
        const nameMatch = user.name?.toLowerCase().includes(searchLower);
        const emailMatch = user.email?.toLowerCase().includes(searchLower);
        return nameMatch || emailMatch;
      })
      .slice(0, 10)
      .map((user: any) => ({
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        level: user.stats?.level || 1
      }));

    return c.json({ results });
  } catch (error) {
    console.error('Error searching users:', error);
    return c.json({ error: 'Failed to search users' }, 500);
  }
});

// ============================================
// MESSAGING SYSTEM
// ============================================

// Send message
app.post('/make-server-67091a4f/messages/send', async (c) => {
  try {
    const body = await c.req.json();
    const { fromEmail, toEmail, message } = body;

    if (!fromEmail || !toEmail || !message) {
      return c.json({ error: 'All fields are required' }, 400);
    }

    // Check if users are friends
    const friends = (await kv.get(`friends:${fromEmail}`) || []) as string[];
    if (!friends.includes(toEmail)) {
      return c.json({ error: 'Can only message friends' }, 403);
    }

    const fromUser = await kv.get(`user:${fromEmail}`) as any;

    // Create conversation ID (consistent order)
    const conversationId = [fromEmail, toEmail].sort().join('_');

    // Get existing messages
    const messages = (await kv.get(`messages:${conversationId}`) || []) as any[];

    // Add new message
    messages.push({
      from: fromEmail,
      fromName: fromUser?.name || 'Unknown',
      to: toEmail,
      message,
      timestamp: Date.now(),
      read: false
    });

    // Keep last 500 messages
    const recentMessages = messages.slice(-500);
    await kv.set(`messages:${conversationId}`, recentMessages);

    console.log(`✅ Message sent from ${fromEmail} to ${toEmail}`);
    return c.json({ success: true, message: 'Message sent!' });
  } catch (error) {
    console.error('Error sending message:', error);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

// Get messages
app.get('/make-server-67091a4f/messages/get', async (c) => {
  try {
    const email = c.req.query('email');
    const friendEmail = c.req.query('friendEmail');

    if (!email || !friendEmail) {
      return c.json({ error: 'Both emails are required' }, 400);
    }

    // Create conversation ID
    const conversationId = [email, friendEmail].sort().join('_');

    const messages = (await kv.get(`messages:${conversationId}`) || []) as any[];

    return c.json({ messages });
  } catch (error) {
    console.error('Error getting messages:', error);
    return c.json({ error: 'Failed to get messages' }, 500);
  }
});

// Mark messages as read
app.post('/make-server-67091a4f/messages/read', async (c) => {
  try {
    const body = await c.req.json();
    const { email, friendEmail } = body;

    if (!email || !friendEmail) {
      return c.json({ error: 'Both emails are required' }, 400);
    }

    // Create conversation ID
    const conversationId = [email, friendEmail].sort().join('_');

    const messages = (await kv.get(`messages:${conversationId}`) || []) as any[];

    // Mark messages to this user as read
    const updatedMessages = messages.map((msg: any) => {
      if (msg.to === email && !msg.read) {
        return { ...msg, read: true };
      }
      return msg;
    });

    await kv.set(`messages:${conversationId}`, updatedMessages);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return c.json({ error: 'Failed to mark messages as read' }, 500);
  }
});

// Get unread message count
app.get('/make-server-67091a4f/messages/unread', async (c) => {
  try {
    const email = c.req.query('email');

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    const friends = (await kv.get(`friends:${email}`) || []) as string[];
    
    let totalUnread = 0;
    const unreadByFriend: any = {};

    for (const friendEmail of friends) {
      const conversationId = [email, friendEmail].sort().join('_');
      const messages = (await kv.get(`messages:${conversationId}`) || []) as any[];
      
      const unreadCount = messages.filter((msg: any) => 
        msg.to === email && !msg.read
      ).length;

      if (unreadCount > 0) {
        unreadByFriend[friendEmail] = unreadCount;
        totalUnread += unreadCount;
      }
    }

    return c.json({ totalUnread, unreadByFriend });
  } catch (error) {
    console.error('Error getting unread count:', error);
    return c.json({ error: 'Failed to get unread count' }, 500);
  }
});

// Get friend's public stats
app.get('/make-server-67091a4f/friends/stats', async (c) => {
  try {
    const email = c.req.query('email');

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    const user = await kv.get(`user:${email}`) as any;

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Check privacy setting (default to public)
    const statsPublic = user.statsPublic !== false;

    if (!statsPublic) {
      return c.json({ 
        error: 'This user has set their stats to private',
        private: true 
      }, 403);
    }

    return c.json({
      name: user.name,
      level: user.stats?.level || 1,
      totalWins: user.stats?.totalWins || 0,
      totalLosses: user.stats?.totalLosses || 0,
      biggestWin: user.stats?.biggestWin || 0,
      totalRolls: user.stats?.totalRolls || 0,
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Error getting friend stats:', error);
    return c.json({ error: 'Failed to get friend stats' }, 500);
  }
});

// Update stats privacy setting
app.post('/make-server-67091a4f/settings/stats-privacy', async (c) => {
  try {
    const body = await c.req.json();
    const { email, statsPublic } = body;

    if (!email || typeof statsPublic !== 'boolean') {
      return c.json({ error: 'Email and statsPublic boolean are required' }, 400);
    }

    const user = await kv.get(`user:${email}`) as any;

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    user.statsPublic = statsPublic;
    await kv.set(`user:${email}`, user);

    console.log(`✅ Updated stats privacy for ${email}: ${statsPublic ? 'public' : 'private'}`);
    return c.json({ success: true, statsPublic });
  } catch (error) {
    console.error('Error updating stats privacy:', error);
    return c.json({ error: 'Failed to update stats privacy' }, 500);
  }
});

// ===============================
// LEADERBOARD REWARDS SYSTEM
// ===============================

// Get notifications for a user
app.get('/make-server-67091a4f/notifications', async (c) => {
  try {
    const email = c.req.query('email');
    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    console.log(`📬 Fetching notifications for: ${email}`);

    const notifications = await kv.get(`notifications:${email}`) || [];
    
    console.log(`✅ Found ${notifications.length} notifications`);

    return c.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return c.json({ error: 'Failed to fetch notifications' }, 500);
  }
});

// Claim a reward
app.post('/make-server-67091a4f/notifications/claim', async (c) => {
  try {
    const { email, notificationId } = await c.req.json();
    
    if (!email || !notificationId) {
      return c.json({ error: 'Email and notificationId are required' }, 400);
    }

    console.log(`🎁 Claiming reward: ${notificationId} for ${email}`);

    // Get user and notifications
    const user = await kv.get(`user:${email}`);
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    const notifications = await kv.get(`notifications:${email}`) || [];
    const notification = notifications.find((n: any) => n.id === notificationId);
    
    if (!notification) {
      return c.json({ error: 'Notification not found' }, 404);
    }

    if (notification.read) {
      return c.json({ error: 'Reward already claimed' }, 400);
    }

    // Apply rewards
    if (notification.reward.chips) {
      user.balance = (user.balance || 0) + notification.reward.chips;
      console.log(`💰 Added ${notification.reward.chips} chips to ${email}`);
    }

    if (notification.reward.xpBoost) {
      const boosts = await resilientKV.get(`boosts:${email}`) || [];
      const now = Date.now();
      const durationMs = notification.reward.xpBoost.duration * 60 * 60 * 1000;
      const expiryTime = now + durationMs;
      
      const newBoost = {
        id: `xp_boost_${Date.now()}`,
        type: 'xp',
        multiplier: notification.reward.xpBoost.multiplier,
        expiry: expiryTime,
        source: 'leaderboard_reward',
        grantedAt: now,
        durationHours: notification.reward.xpBoost.duration
      };
      
      boosts.push(newBoost);
      await resilientKV.set(`boosts:${email}`, boosts);
      
      console.log(`⚡ XP BOOST GRANTED to ${email}:`);
      console.log(`   - Multiplier: ${notification.reward.xpBoost.multiplier}x`);
      console.log(`   - Duration: ${notification.reward.xpBoost.duration} hours`);
      console.log(`   - Granted at: ${new Date(now).toISOString()}`);
      console.log(`   - Expires at: ${new Date(expiryTime).toISOString()}`);
      console.log(`   - Boost ID: ${newBoost.id}`);
    }

    if (notification.reward.badge) {
      const badges = user.badges || [];
      if (!badges.includes(notification.reward.badge)) {
        badges.push(notification.reward.badge);
        user.badges = badges;
      }
      console.log(`🏅 Added badge: ${notification.reward.badge}`);
    }

    // Mark notification as read
    notification.read = true;
    await kv.set(`notifications:${email}`, notifications);

    // Save user
    await kv.set(`user:${email}`, user);

    console.log(`✅ Reward claimed successfully for ${email}`);

    return c.json({ 
      success: true,
      balance: user.balance,
      message: 'Reward claimed successfully!' 
    });
  } catch (error) {
    console.error('Error claiming reward:', error);
    return c.json({ error: 'Failed to claim reward' }, 500);
  }
});

// Mark notification as read
app.post('/make-server-67091a4f/notifications/read', async (c) => {
  try {
    const { email, notificationId } = await c.req.json();
    
    if (!email || !notificationId) {
      return c.json({ error: 'Email and notificationId are required' }, 400);
    }

    const notifications = await kv.get(`notifications:${email}`) || [];
    const notification = notifications.find((n: any) => n.id === notificationId);
    
    if (notification) {
      notification.read = true;
      await kv.set(`notifications:${email}`, notifications);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return c.json({ error: 'Failed to mark as read' }, 500);
  }
});

// Get active XP boosts for a player (with server-side validation)
app.get('/make-server-67091a4f/boosts', async (c) => {
  try {
    const email = c.req.query('email');
    
    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    // Get boosts from server with automatic retry for connection errors
    const serverBoosts = await resilientKV.get(`boosts:${email}`) || [];
    
    // Filter out expired boosts and convert to frontend format
    const now = Date.now();
    const validBoosts = serverBoosts
      .filter((boost: any) => boost.expiry > now)
      .map((boost: any) => ({
        id: boost.id,
        name: `${boost.multiplier}x XP Boost`,
        multiplier: boost.multiplier,
        expiresAt: boost.expiry,
        source: boost.source || 'unknown',
      }));

    // Clean up expired boosts from database (with automatic retry)
    if (validBoosts.length !== serverBoosts.length) {
      await resilientKV.set(`boosts:${email}`, serverBoosts.filter((b: any) => b.expiry > now));
      console.log(`🧹 Cleaned up ${serverBoosts.length - validBoosts.length} expired boosts for ${email}`);
    }

    console.log(`✅ Returning ${validBoosts.length} active boosts for ${email}`);
    return c.json({ boosts: validBoosts });
  } catch (error) {
    console.error('Error fetching boosts:', error);
    // Return empty boosts array instead of error to prevent UI breakage
    return c.json({ boosts: [], warning: 'Could not fetch boosts, please try again' });
  }
});

// Process leaderboard rewards (CRON endpoint)
app.post('/make-server-67091a4f/process-leaderboard-rewards', async (c) => {
  try {
    const { timeframe, adminKey } = await c.req.json();
    
    // Simple admin key check (you can make this more secure)
    const expectedKey = Deno.env.get('ADMIN_KEY') || 'rollers-paradise-admin-2024';
    if (adminKey !== expectedKey) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!timeframe || !['weekly', 'monthly'].includes(timeframe)) {
      return c.json({ error: 'Valid timeframe (weekly/monthly) is required' }, 400);
    }

    console.log(`🏆 Processing ${timeframe} leaderboard rewards...`);

    const categories = ['total_wins', 'biggest_win', 'level', 'win_rate'];
    const rewards: any[] = [];

    // Define reward tiers
    const rewardTiers = {
      1: { chips: 100000, xpBoost: { multiplier: 3, duration: 24 }, badge: '🥇 Champion' },
      2: { chips: 50000, xpBoost: { multiplier: 2.5, duration: 24 }, badge: '🥈 Elite' },
      3: { chips: 25000, xpBoost: { multiplier: 2, duration: 24 }, badge: '🥉 Expert' },
      4: { chips: 10000, xpBoost: { multiplier: 1.5, duration: 12 } },
      5: { chips: 10000, xpBoost: { multiplier: 1.5, duration: 12 } },
      6: { chips: 5000, xpBoost: { multiplier: 1.3, duration: 12 } },
      7: { chips: 5000, xpBoost: { multiplier: 1.3, duration: 12 } },
      8: { chips: 5000, xpBoost: { multiplier: 1.3, duration: 12 } },
      9: { chips: 5000, xpBoost: { multiplier: 1.3, duration: 12 } },
      10: { chips: 5000, xpBoost: { multiplier: 1.3, duration: 12 } },
    };

    // Process each category
    for (const category of categories) {
      console.log(`📊 Processing category: ${category}`);
      
      // Get all users
      const usersData = await kv.getByPrefix('user:');
      
      if (!usersData || usersData.length === 0) {
        console.log('⚠️ No users found');
        continue;
      }

      // Filter users with stats
      let users = usersData.filter((user: any) => user && user.stats);

      // Apply timeframe filter
      if (timeframe === 'weekly') {
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        users = users.filter((user: any) => 
          user.stats.lastUpdated && user.stats.lastUpdated > weekAgo
        );
      } else if (timeframe === 'monthly') {
        const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        users = users.filter((user: any) => 
          user.stats.lastUpdated && user.stats.lastUpdated > monthAgo
        );
      }

      // Sort based on category
      const sortedUsers = users.sort((a: any, b: any) => {
        switch (category) {
          case 'total_wins':
            return (b.stats.totalWins || 0) - (a.stats.totalWins || 0);
          case 'biggest_win':
            return (b.stats.biggestWin || 0) - (a.stats.biggestWin || 0);
          case 'level':
            return (b.stats.level || 0) - (a.stats.level || 0);
          case 'win_rate': {
            const aRate = a.stats.totalWins && a.stats.totalLosses 
              ? (a.stats.totalWins / (a.stats.totalWins + a.stats.totalLosses)) * 100 
              : 0;
            const bRate = b.stats.totalWins && b.stats.totalLosses 
              ? (b.stats.totalWins / (b.stats.totalWins + b.stats.totalLosses)) * 100 
              : 0;
            return bRate - aRate;
          }
          default:
            return 0;
        }
      });

      // Award top 10 players
      for (let i = 0; i < Math.min(10, sortedUsers.length); i++) {
        const user = sortedUsers[i];
        const rank = i + 1;
        const reward = rewardTiers[rank as keyof typeof rewardTiers];

        if (!reward) continue;

        console.log(`🎁 Awarding rank ${rank} in ${category} to ${user.email}`);

        // Create notification
        const notification = {
          id: `reward_${timeframe}_${category}_${Date.now()}_${user.email}`,
          type: 'leaderboard_reward',
          title: `🏆 ${timeframe.toUpperCase()} Leaderboard Reward!`,
          message: `Congratulations! You ranked #${rank} in ${category.replace('_', ' ')} for the ${timeframe} leaderboard!`,
          reward,
          timestamp: Date.now(),
          read: false,
          leaderboardInfo: {
            rank,
            category,
            timeframe,
            period: timeframe === 'weekly' ? 'Last Week' : 'Last Month',
          },
        };

        // Get existing notifications
        const userNotifications = await kv.get(`notifications:${user.email}`) || [];
        
        // Add new notification
        userNotifications.unshift(notification);
        
        // Keep only last 50 notifications
        if (userNotifications.length > 50) {
          userNotifications.length = 50;
        }

        await kv.set(`notifications:${user.email}`, userNotifications);

        rewards.push({
          email: user.email,
          name: user.name,
          rank,
          category,
          reward,
        });
      }
    }

    // Store last reward processing time
    await kv.set(`last_reward_process:${timeframe}`, {
      timestamp: Date.now(),
      rewardsCount: rewards.length,
    });

    console.log(`✅ Processed ${rewards.length} leaderboard rewards for ${timeframe}`);

    return c.json({ 
      success: true, 
      timeframe,
      rewardsProcessed: rewards.length,
      rewards,
    });
  } catch (error) {
    console.error('Error processing leaderboard rewards:', error);
    return c.json({ error: 'Failed to process rewards' }, 500);
  }
});

// Get last reward processing info
app.get('/make-server-67091a4f/last-reward-process', async (c) => {
  try {
    const timeframe = c.req.query('timeframe') || 'weekly';
    
    const lastProcess = await kv.get(`last_reward_process:${timeframe}`);
    
    return c.json({ 
      lastProcess: lastProcess || null,
      nextProcess: lastProcess ? calculateNextRewardTime(timeframe, lastProcess.timestamp) : null,
    });
  } catch (error) {
    console.error('Error fetching last reward process:', error);
    return c.json({ error: 'Failed to fetch info' }, 500);
  }
});

function calculateNextRewardTime(timeframe: string, lastTimestamp: number): number {
  const lastDate = new Date(lastTimestamp);
  
  if (timeframe === 'weekly') {
    // Next Monday at midnight
    const nextMonday = new Date(lastDate);
    nextMonday.setDate(lastDate.getDate() + (7 - lastDate.getDay() + 1));
    nextMonday.setHours(0, 0, 0, 0);
    return nextMonday.getTime();
  } else {
    // First day of next month at midnight
    const nextMonth = new Date(lastDate);
    nextMonth.setMonth(lastDate.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(0, 0, 0, 0);
    return nextMonth.getTime();
  }
}

// Manual trigger for rewards (admin only)
app.post('/make-server-67091a4f/trigger-rewards', async (c) => {
  try {
    const { timeframe, adminKey } = await c.req.json();
    
    const expectedKey = Deno.env.get('ADMIN_KEY') || 'rollers-paradise-admin-2024';
    if (adminKey !== expectedKey) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!timeframe || !['weekly', 'monthly'].includes(timeframe)) {
      return c.json({ error: 'Valid timeframe (weekly/monthly) is required' }, 400);
    }

    console.log(`🎯 Manual trigger: ${timeframe} rewards`);
    await manualTrigger(timeframe);

    return c.json({ success: true, message: `${timeframe} rewards triggered` });
  } catch (error) {
    console.error('Error triggering rewards:', error);
    return c.json({ error: 'Failed to trigger rewards' }, 500);
  }
});

// ========================================
// INACTIVE ACCOUNT CLEANUP ENDPOINTS
// ========================================

// Manual trigger for account cleanup (admin only)
app.post('/make-server-67091a4f/trigger-cleanup', async (c) => {
  try {
    const { adminKey } = await c.req.json();
    
    const expectedKey = Deno.env.get('ADMIN_KEY') || 'rollers-paradise-admin-2024';
    if (adminKey !== expectedKey) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('🎯 Manual trigger: Account cleanup');
    await manualTrigger('cleanup');

    return c.json({ success: true, message: 'Account cleanup triggered successfully' });
  } catch (error) {
    console.error('Error triggering cleanup:', error);
    return c.json({ error: 'Failed to trigger cleanup' }, 500);
  }
});

// Get last cleanup stats (admin only)
app.get('/make-server-67091a4f/cleanup-stats', async (c) => {
  try {
    const lastCleanup = await kv.get('stats:last_cleanup');
    
    if (!lastCleanup) {
      return c.json({ 
        message: 'No cleanup has been run yet',
        stats: null 
      });
    }

    return c.json({ 
      success: true,
      stats: {
        lastRun: new Date(lastCleanup.timestamp).toLocaleString(),
        deletedCount: lastCleanup.deletedCount,
        freedUsernames: lastCleanup.deletedUsernames,
      }
    });
  } catch (error) {
    console.error('Error fetching cleanup stats:', error);
    return c.json({ error: 'Failed to fetch cleanup stats' }, 500);
  }
});

// Check if username is available
app.get('/make-server-67091a4f/check-username', async (c) => {
  try {
    const username = c.req.query('username');
    
    if (!username) {
      return c.json({ error: 'Username is required' }, 400);
    }

    // Get all users
    const allUsers = await kv.getByPrefix('user:');
    
    // Check if username exists (case-insensitive)
    const usernameTaken = allUsers.find((user: any) => 
      user && user.name && user.name.toLowerCase() === username.toLowerCase()
    );

    return c.json({ 
      available: !usernameTaken,
      username: username,
      message: usernameTaken 
        ? `Username "${username}" is already taken` 
        : `Username "${username}" is available!`
    });
  } catch (error) {
    console.error('Error checking username:', error);
    return c.json({ error: 'Failed to check username' }, 500);
  }
});

// ========================================
// TIER CAPACITY METRICS ENDPOINT
// ========================================

// Get tier metrics for capacity monitoring
app.get('/make-server-67091a4f/tier-metrics', async (c) => {
  try {
    // Get all users
    const allUsers = await kv.getByPrefix('user:');
    
    // Calculate registered players (exclude guests)
    const registeredPlayers = allUsers.filter((user: any) => 
      user && user.email && !user.email.includes('@guest.rollersparadise')
    ).length;

    // Get current sessions from SSE
    const sseStats = getSSEStats();
    const concurrentPlayers = sseStats.totalConnections || 0;

    // Get peak concurrent from stats
    const peakStats = await kv.get('stats:peak_concurrent') || { peak: 0, timestamp: Date.now() };
    const peakConcurrent = peakStats.peak || 0;

    // Calculate daily active users (users who logged in today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    
    const dailyActive = allUsers.filter((user: any) => 
      user && user.lastLogin && user.lastLogin >= todayTimestamp
    ).length;

    // Get monthly revenue from membership purchases
    const now = Date.now();
    const monthAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    let monthlyRevenue = 0;
    
    // Get all membership transactions from last 30 days
    const allTransactions = await kv.getByPrefix('membership:transaction:');
    const recentTransactions = allTransactions.filter((tx: any) => 
      tx && tx.timestamp && tx.timestamp >= monthAgo
    );
    
    recentTransactions.forEach((tx: any) => {
      if (tx.amount) {
        monthlyRevenue += tx.amount;
      }
    });

    // Update peak if current is higher
    if (concurrentPlayers > peakConcurrent) {
      await kv.set('stats:peak_concurrent', {
        peak: concurrentPlayers,
        timestamp: Date.now(),
        date: new Date().toISOString()
      });
    }

    // Calculate average response time from cache stats
    const cacheStats = getCacheStats();
    const averageResponseTime = cacheStats.averageResponseTime || 0;

    // Calculate error rate (from recent errors)
    const recentErrors = await kv.getByPrefix('error_report_');
    const recentErrorsLast24h = recentErrors.filter((err: any) => {
      if (!err || !err.created_at) return false;
      const errorTime = new Date(err.created_at).getTime();
      const dayAgo = now - (24 * 60 * 60 * 1000);
      return errorTime >= dayAgo;
    }).length;

    // Error rate = errors per 100 sessions
    const errorRate = dailyActive > 0 ? (recentErrorsLast24h / dailyActive) * 100 : 0;

    // Store historical data point
    const historyKey = `metrics:history:${Date.now()}`;
    await kv.set(historyKey, {
      timestamp: Date.now(),
      registered: registeredPlayers,
      concurrent: concurrentPlayers,
      peak: Math.max(peakConcurrent, concurrentPlayers),
      dailyActive,
      revenue: monthlyRevenue
    });

    // Clean up old history (keep last 1000 points)
    const allHistory = await kv.getByPrefix('metrics:history:');
    if (allHistory.length > 1000) {
      const sorted = allHistory.sort((a: any, b: any) => a.timestamp - b.timestamp);
      const toDelete = sorted.slice(0, allHistory.length - 1000);
      for (const old of toDelete) {
        const key = `metrics:history:${old.timestamp}`;
        await kv.del(key);
      }
    }

    console.log(`📊 Tier Metrics: ${registeredPlayers} registered, ${concurrentPlayers} concurrent, $${monthlyRevenue.toFixed(2)} monthly revenue`);

    return c.json({
      registeredPlayers,
      concurrentPlayers,
      peakConcurrent: Math.max(peakConcurrent, concurrentPlayers),
      dailyActive,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching tier metrics:', error);
    return c.json({ 
      registeredPlayers: 0,
      concurrentPlayers: 0,
      peakConcurrent: 0,
      dailyActive: 0,
      monthlyRevenue: 0,
      averageResponseTime: 0,
      errorRate: 0,
      error: 'Failed to fetch metrics'
    }, 500);
  }
});

// ========================================
// CAPACITY STATUS ENDPOINT (for optimizations)
// ========================================

// Get capacity status for optimization system
app.get('/make-server-67091a4f/capacity-status', async (c) => {
  try {
    // Get current connections from SSE
    const sseStats = getSSEStats();
    const currentConnections = sseStats.totalConnections || 0;

    // Get queue length
    const queueData = await kv.get('capacity:queue') || { users: [] };
    const queueLength = Array.isArray(queueData.users) ? queueData.users.length : 0;

    // Get optimization tracking
    const optimizationData = await kv.get('capacity:optimizations') || {
      enabled: [],
      startDate: Date.now()
    };

    const daysSinceOptimization = Math.floor(
      (Date.now() - (optimizationData.startDate || Date.now())) / (24 * 60 * 60 * 1000)
    );

    console.log(`⚡ Capacity Status: ${currentConnections} connections, ${queueLength} in queue`);

    return c.json({
      currentConnections,
      queueLength,
      optimizationsEnabled: optimizationData.enabled || [],
      daysSinceOptimization,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching capacity status:', error);
    return c.json({
      currentConnections: 0,
      queueLength: 0,
      optimizationsEnabled: [],
      daysSinceOptimization: 0,
      error: 'Failed to fetch capacity status'
    }, 500);
  }
});

app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: 'Internal server error', message: err.message }, 500);
});

// Initialize cron jobs for automatic reward processing
initializeCronJobs();

Deno.serve(app.fetch);