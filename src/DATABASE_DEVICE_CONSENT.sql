-- ============================================================================
-- DEVICE CONSENT TABLE FOR LEGAL COMPLIANCE
-- ============================================================================
-- This table stores device information for gaming regulations compliance
-- Required by law to prevent fraud, ensure fair play, and track user devices
-- ============================================================================

-- Create device_consents table
CREATE TABLE IF NOT EXISTS device_consents (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User Reference (nullable - might not be logged in yet)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Device Type Information
  device_type TEXT NOT NULL, -- desktop, mobile, tablet, tv, car, tesla, gaming-console, unknown
  device_model TEXT, -- Specific model if detectable (e.g., "iPhone 14", "Tesla Model 3")
  
  -- Operating System
  os TEXT NOT NULL,
  os_version TEXT,
  
  -- Browser Information
  browser TEXT NOT NULL,
  browser_version TEXT,
  
  -- Screen Information
  screen_width INTEGER NOT NULL,
  screen_height INTEGER NOT NULL,
  screen_resolution TEXT NOT NULL,
  pixel_ratio DECIMAL(4,2) NOT NULL,
  orientation TEXT NOT NULL, -- portrait, landscape
  
  -- Hardware Information
  cores INTEGER,
  memory INTEGER, -- in GB
  touch_support BOOLEAN NOT NULL DEFAULT false,
  connection TEXT, -- 4g, 5g, wifi, etc.
  
  -- Special Device Flags
  is_tesla BOOLEAN NOT NULL DEFAULT false,
  is_car_browser BOOLEAN NOT NULL DEFAULT false,
  is_tv BOOLEAN NOT NULL DEFAULT false,
  is_gaming_console BOOLEAN NOT NULL DEFAULT false,
  
  -- Raw User Agent
  user_agent TEXT NOT NULL,
  platform TEXT NOT NULL,
  
  -- Location Information
  timezone TEXT NOT NULL,
  language TEXT NOT NULL,
  ip_address TEXT NOT NULL, -- For fraud detection
  
  -- Consent Information
  consent_given BOOLEAN NOT NULL DEFAULT true,
  consent_timestamp TIMESTAMPTZ NOT NULL,
  
  -- Timestamps
  detected_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB -- For any additional device info we might want to store
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index on user_id for quick lookups
CREATE INDEX IF NOT EXISTS idx_device_consents_user_id 
ON device_consents(user_id);

-- Index on device_type for analytics
CREATE INDEX IF NOT EXISTS idx_device_consents_device_type 
ON device_consents(device_type);

-- Index on IP address for fraud detection
CREATE INDEX IF NOT EXISTS idx_device_consents_ip_address 
ON device_consents(ip_address);

-- Index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_device_consents_created_at 
ON device_consents(created_at DESC);

-- Index on special device flags for safety monitoring
CREATE INDEX IF NOT EXISTS idx_device_consents_car_browsers 
ON device_consents(is_car_browser) 
WHERE is_car_browser = true;

CREATE INDEX IF NOT EXISTS idx_device_consents_tesla 
ON device_consents(is_tesla) 
WHERE is_tesla = true;

-- Composite index for user device history
CREATE INDEX IF NOT EXISTS idx_device_consents_user_created 
ON device_consents(user_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE device_consents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own device consents
CREATE POLICY "Users can view own device consents"
ON device_consents
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Service role can do everything (for API)
CREATE POLICY "Service role can manage all device consents"
ON device_consents
FOR ALL
USING (auth.role() = 'service_role');

-- Policy: Anyone can insert device consents (for registration)
CREATE POLICY "Anyone can insert device consents"
ON device_consents
FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get user's device history
CREATE OR REPLACE FUNCTION get_user_device_history(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  device_type TEXT,
  device_model TEXT,
  os TEXT,
  browser TEXT,
  screen_resolution TEXT,
  is_tesla BOOLEAN,
  is_car_browser BOOLEAN,
  ip_address TEXT,
  consent_timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.id,
    dc.device_type,
    dc.device_model,
    dc.os,
    dc.browser,
    dc.screen_resolution,
    dc.is_tesla,
    dc.is_car_browser,
    dc.ip_address,
    dc.consent_timestamp,
    dc.created_at
  FROM device_consents dc
  WHERE dc.user_id = p_user_id
  ORDER BY dc.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check for suspicious activity (multiple devices from same IP)
CREATE OR REPLACE FUNCTION check_suspicious_devices(p_ip_address TEXT)
RETURNS TABLE (
  ip_address TEXT,
  device_count BIGINT,
  user_count BIGINT,
  first_seen TIMESTAMPTZ,
  last_seen TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.ip_address,
    COUNT(DISTINCT dc.id) as device_count,
    COUNT(DISTINCT dc.user_id) as user_count,
    MIN(dc.created_at) as first_seen,
    MAX(dc.created_at) as last_seen
  FROM device_consents dc
  WHERE dc.ip_address = p_ip_address
  GROUP BY dc.ip_address;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get device type statistics
CREATE OR REPLACE FUNCTION get_device_type_stats()
RETURNS TABLE (
  device_type TEXT,
  total_count BIGINT,
  unique_users BIGINT,
  percentage DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  WITH totals AS (
    SELECT COUNT(DISTINCT id) as total_devices
    FROM device_consents
  )
  SELECT 
    dc.device_type,
    COUNT(DISTINCT dc.id) as total_count,
    COUNT(DISTINCT dc.user_id) as unique_users,
    ROUND(
      (COUNT(DISTINCT dc.id)::DECIMAL / totals.total_devices::DECIMAL) * 100,
      2
    ) as percentage
  FROM device_consents dc
  CROSS JOIN totals
  GROUP BY dc.device_type, totals.total_devices
  ORDER BY total_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update user's last_device_consent timestamp
CREATE OR REPLACE FUNCTION update_user_last_device_consent()
RETURNS TRIGGER AS $$
BEGIN
  -- Update users table if user_id exists
  IF NEW.user_id IS NOT NULL THEN
    UPDATE users
    SET last_device_consent = NEW.consent_timestamp
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_last_device_consent
AFTER INSERT ON device_consents
FOR EACH ROW
EXECUTE FUNCTION update_user_last_device_consent();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE device_consents IS 'Stores device information for legal compliance and fraud prevention';
COMMENT ON COLUMN device_consents.device_type IS 'Type of device: desktop, mobile, tablet, tv, car, tesla, gaming-console, unknown';
COMMENT ON COLUMN device_consents.ip_address IS 'IP address for fraud detection and multi-account prevention';
COMMENT ON COLUMN device_consents.consent_given IS 'User consent for device detection (required by law)';
COMMENT ON COLUMN device_consents.is_tesla IS 'Flag indicating if user is playing from a Tesla vehicle';
COMMENT ON COLUMN device_consents.is_car_browser IS 'Flag indicating if user is playing from any vehicle browser';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant access to authenticated users
GRANT SELECT ON device_consents TO authenticated;
GRANT INSERT ON device_consents TO authenticated;

-- Grant full access to service role
GRANT ALL ON device_consents TO service_role;

-- ============================================================================
-- SAMPLE QUERIES FOR COMPLIANCE REPORTING
-- ============================================================================

-- Get all Tesla users (for safety monitoring)
-- SELECT * FROM device_consents WHERE is_tesla = true ORDER BY created_at DESC;

-- Get all car browser users (for safety monitoring)
-- SELECT * FROM device_consents WHERE is_car_browser = true ORDER BY created_at DESC;

-- Check for multiple accounts from same IP
-- SELECT ip_address, COUNT(DISTINCT user_id) as user_count 
-- FROM device_consents 
-- GROUP BY ip_address 
-- HAVING COUNT(DISTINCT user_id) > 3;

-- Get device type distribution
-- SELECT * FROM get_device_type_stats();

-- Get user's device history
-- SELECT * FROM get_user_device_history('user-uuid-here');

-- Check suspicious activity from IP
-- SELECT * FROM check_suspicious_devices('123.456.789.0');

-- ============================================================================
-- COMPLIANCE NOTES
-- ============================================================================
-- 
-- This table helps comply with:
-- 1. Gaming regulations requiring device verification
-- 2. Fraud prevention and multi-account detection
-- 3. Responsible gaming practices (e.g., detecting car browsers)
-- 4. Audit trail for legal investigations
-- 5. Fair play enforcement
-- 
-- IMPORTANT: Data retention policies should be set according to your
-- jurisdiction's legal requirements. Consult with legal counsel.
-- 
-- ============================================================================

PRINT '✅ Device consent table created successfully';
PRINT '✅ Indexes created for performance';
PRINT '✅ RLS policies enabled for security';
PRINT '✅ Helper functions created for compliance';
PRINT '✅ Triggers configured for user tracking';
PRINT '🎰 Ready for legal compliance!';
