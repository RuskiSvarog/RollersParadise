-- Create error_reports table for comprehensive error tracking
-- This table stores all frontend, backend, and middleware errors

CREATE TABLE IF NOT EXISTS error_reports (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Error details
  error_code TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  component_stack TEXT,
  
  -- Context information
  user_agent TEXT,
  url TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  
  -- User information
  user_id TEXT,
  session_id TEXT,
  user_description TEXT,
  user_email TEXT,
  
  -- Additional technical details (JSON)
  additional_info JSONB,
  
  -- Resolution tracking
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_error_reports_code ON error_reports(error_code);
CREATE INDEX IF NOT EXISTS idx_error_reports_timestamp ON error_reports(timestamp);
CREATE INDEX IF NOT EXISTS idx_error_reports_user_id ON error_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_error_reports_session_id ON error_reports(session_id);
CREATE INDEX IF NOT EXISTS idx_error_reports_resolved ON error_reports(resolved);
CREATE INDEX IF NOT EXISTS idx_error_reports_created_at ON error_reports(created_at DESC);

-- Create index on additional_info for JSON queries
CREATE INDEX IF NOT EXISTS idx_error_reports_additional_info ON error_reports USING GIN (additional_info);

-- Add comment to table
COMMENT ON TABLE error_reports IS 'Stores all application error reports from frontend, backend, and middleware';

-- Add comments to important columns
COMMENT ON COLUMN error_reports.error_code IS 'Error code (e.g., FE-001, BE-002, MW-003)';
COMMENT ON COLUMN error_reports.error_message IS 'Human-readable error message';
COMMENT ON COLUMN error_reports.stack_trace IS 'JavaScript stack trace';
COMMENT ON COLUMN error_reports.component_stack IS 'React component stack trace';
COMMENT ON COLUMN error_reports.additional_info IS 'JSON object with additional context';
COMMENT ON COLUMN error_reports.resolved IS 'Whether the error has been resolved';

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_error_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER error_reports_updated_at
  BEFORE UPDATE ON error_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_error_reports_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert error reports (needed for error tracking)
CREATE POLICY "Anyone can insert error reports" ON error_reports
  FOR INSERT
  WITH CHECK (true);

-- Only authenticated admins can view error reports
CREATE POLICY "Admins can view error reports" ON error_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Only authenticated admins can update error reports
CREATE POLICY "Admins can update error reports" ON error_reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Create a view for error statistics
CREATE OR REPLACE VIEW error_reports_stats AS
SELECT
  error_code,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE resolved = false) as unresolved_count,
  COUNT(*) FILTER (WHERE resolved = true) as resolved_count,
  MAX(timestamp) as last_occurrence,
  MIN(timestamp) as first_occurrence,
  COUNT(DISTINCT user_id) as affected_users,
  COUNT(DISTINCT session_id) as affected_sessions
FROM error_reports
GROUP BY error_code
ORDER BY total_count DESC;

-- Add comment to view
COMMENT ON VIEW error_reports_stats IS 'Statistics about error reports grouped by error code';

-- Grant permissions to service role (for API access)
GRANT ALL ON error_reports TO service_role;
GRANT SELECT ON error_reports_stats TO service_role;

-- Create function to clean up old resolved errors (optional maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_resolved_errors(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM error_reports
  WHERE resolved = true
    AND resolved_at < NOW() - (days_old || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_resolved_errors IS 'Deletes resolved error reports older than specified days (default 90)';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Error reports table created successfully!';
  RAISE NOTICE 'Table: error_reports';
  RAISE NOTICE 'Indexes: 6 created for optimal query performance';
  RAISE NOTICE 'RLS Policies: Enabled with admin access control';
  RAISE NOTICE 'View: error_reports_stats for aggregated statistics';
END $$;
