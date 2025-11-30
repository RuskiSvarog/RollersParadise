-- Create ai_error_reports table for Figma AI Assistant
-- This table stores errors so the AI assistant can read and help fix them

CREATE TABLE IF NOT EXISTS ai_error_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Error details
  error_code TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  component_stack TEXT,
  
  -- User context
  user_description TEXT,
  user_id TEXT,
  
  -- Technical context
  url TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  browser_info TEXT,
  game_state JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  fixed BOOLEAN DEFAULT FALSE,
  fixed_at TIMESTAMPTZ,
  fix_notes TEXT
);

-- Create indexes for AI to query efficiently
CREATE INDEX IF NOT EXISTS idx_ai_errors_timestamp ON ai_error_reports(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_errors_code ON ai_error_reports(error_code);
CREATE INDEX IF NOT EXISTS idx_ai_errors_fixed ON ai_error_reports(fixed);
CREATE INDEX IF NOT EXISTS idx_ai_errors_user ON ai_error_reports(user_id);

-- Enable RLS
ALTER TABLE ai_error_reports ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (needed for error reporting)
CREATE POLICY "Anyone can report errors" ON ai_error_reports
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read (so AI assistant can read them)
CREATE POLICY "Anyone can read errors" ON ai_error_reports
  FOR SELECT
  USING (true);

-- Only authenticated users can update (mark as fixed)
CREATE POLICY "Authenticated users can update errors" ON ai_error_reports
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Create a simple view for recent errors
CREATE OR REPLACE VIEW recent_ai_errors AS
SELECT 
  id,
  error_code,
  error_message,
  user_description,
  timestamp,
  fixed,
  created_at
FROM ai_error_reports
WHERE fixed = false
ORDER BY timestamp DESC
LIMIT 50;

-- Grant permissions
GRANT ALL ON ai_error_reports TO anon;
GRANT ALL ON ai_error_reports TO authenticated;
GRANT SELECT ON recent_ai_errors TO anon;
GRANT SELECT ON recent_ai_errors TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ AI Error Reports table created!';
  RAISE NOTICE 'Table: ai_error_reports';
  RAISE NOTICE 'View: recent_ai_errors (last 50 unfixed errors)';
  RAISE NOTICE 'The AI assistant can now read errors from this table';
END $$;
