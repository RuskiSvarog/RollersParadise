-- Create player_reports table
CREATE TABLE IF NOT EXISTS player_reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL,
  reporter_name TEXT NOT NULL,
  target_id TEXT,
  target_name TEXT,
  type TEXT NOT NULL CHECK (type IN ('player', 'bug')),
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  room_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bug_reports table
CREATE TABLE IF NOT EXISTS bug_reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL,
  reporter_name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'bug',
  description TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  room_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'resolved', 'wont-fix')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  assigned_to TEXT,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_player_reports_status ON player_reports(status);
CREATE INDEX IF NOT EXISTS idx_player_reports_reporter ON player_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_player_reports_target ON player_reports(target_id);
CREATE INDEX IF NOT EXISTS idx_player_reports_timestamp ON player_reports(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_reporter ON bug_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_severity ON bug_reports(severity);
CREATE INDEX IF NOT EXISTS idx_bug_reports_timestamp ON bug_reports(timestamp DESC);

-- Enable Row Level Security
ALTER TABLE player_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for player_reports
-- Users can insert their own reports
CREATE POLICY "Users can insert their own reports" ON player_reports
  FOR INSERT
  WITH CHECK (auth.uid()::text = reporter_id);

-- Users can view their own reports
CREATE POLICY "Users can view their own reports" ON player_reports
  FOR SELECT
  USING (auth.uid()::text = reporter_id);

-- Admins can view all reports (you'll need to create an admin role)
CREATE POLICY "Admins can view all reports" ON player_reports
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM players 
    WHERE players.id = auth.uid()::text 
    AND players.is_admin = true
  ));

-- RLS Policies for bug_reports
-- Users can insert bug reports
CREATE POLICY "Users can insert bug reports" ON bug_reports
  FOR INSERT
  WITH CHECK (auth.uid()::text = reporter_id);

-- Users can view their own bug reports
CREATE POLICY "Users can view their own bug reports" ON bug_reports
  FOR SELECT
  USING (auth.uid()::text = reporter_id);

-- Admins can view all bug reports
CREATE POLICY "Admins can view all bug reports" ON bug_reports
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM players 
    WHERE players.id = auth.uid()::text 
    AND players.is_admin = true
  ));

-- Add is_admin column to players table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE players ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Comments for documentation
COMMENT ON TABLE player_reports IS 'Stores player behavior reports submitted by users';
COMMENT ON TABLE bug_reports IS 'Stores bug reports submitted by users';
COMMENT ON COLUMN player_reports.status IS 'pending: awaiting review, reviewed: admin reviewed, resolved: action taken';
COMMENT ON COLUMN bug_reports.status IS 'pending: new bug, in-progress: being fixed, resolved: fixed, wont-fix: will not fix';
COMMENT ON COLUMN bug_reports.severity IS 'Bug severity level: low, medium, high, critical';
