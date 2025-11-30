import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

/**
 * Device Consent API
 * Stores device information for legal compliance and game regulations
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request body exists
    if (!req.body) {
      console.error('❌ No request body received');
      return res.status(400).json({ 
        error: 'No request body', 
        message: 'Request body is required' 
      });
    }

    const { deviceInfo, consentGiven, consentTimestamp } = req.body;

    if (!deviceInfo) {
      console.error('❌ No device info in request');
      return res.status(400).json({ 
        error: 'Device info is required',
        received: req.body 
      });
    }

    // Get user info from request (if authenticated)
    let userId: string | undefined;
    try {
      // Try to get user from authorization header or cookie
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id;
      }
    } catch (e) {
      // User not authenticated - that's okay, we'll store it anyway
    }

    // Get IP address for fraud detection
    const ipAddress = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Check environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables');
      console.log('Supabase URL present:', !!supabaseUrl);
      console.log('Supabase Service Key present:', !!supabaseServiceKey);
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Supabase is not configured properly'
      });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store device consent in database
    const { data, error } = await supabase
      .from('device_consents')
      .insert([
        {
          user_id: userId,
          device_type: deviceInfo.deviceType,
          device_model: deviceInfo.deviceModel,
          os: deviceInfo.os,
          os_version: deviceInfo.osVersion,
          browser: deviceInfo.browser,
          browser_version: deviceInfo.browserVersion,
          screen_width: deviceInfo.screenWidth,
          screen_height: deviceInfo.screenHeight,
          screen_resolution: deviceInfo.screenResolution,
          pixel_ratio: deviceInfo.pixelRatio,
          orientation: deviceInfo.orientation,
          cores: deviceInfo.cores,
          memory: deviceInfo.memory,
          touch_support: deviceInfo.touchSupport,
          connection: deviceInfo.connection,
          is_tesla: deviceInfo.isTesla,
          is_car_browser: deviceInfo.isCarBrowser,
          is_tv: deviceInfo.isTV,
          is_gaming_console: deviceInfo.isGamingConsole,
          user_agent: deviceInfo.userAgent,
          platform: deviceInfo.platform,
          timezone: deviceInfo.timezone,
          language: deviceInfo.language,
          ip_address: ipAddress,
          consent_given: consentGiven,
          consent_timestamp: consentTimestamp,
          detected_at: deviceInfo.detectedAt,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to store device consent in database:', error);
      return res.status(500).json({ 
        error: 'Failed to store device consent', 
        details: error.message,
        code: error.code,
        hint: error.hint
      });
    }

    console.log('✅ Device consent stored successfully:', data?.id);

    return res.status(200).json({
      success: true,
      consentId: data?.id,
      message: 'Device consent recorded successfully',
    });
  } catch (error: any) {
    console.error('❌ Device consent API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error?.message || 'Unknown error occurred',
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    });
  }
}
