import { createClient } from '@supabase/supabase-js';

/**
 * API Endpoint: Error Reports
 * Receives and stores error reports from the frontend
 */

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

// Initialize Supabase client with service role key for backend operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ErrorReport {
  code: string;
  message: string;
  stack?: string;
  componentStack?: string;
  userAgent?: string;
  url?: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  userDescription?: string;
  userEmail?: string;
  additionalInfo?: Record<string, any>;
}

export default async function handler(req: Request) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  // POST - Create new error report
  if (req.method === 'POST') {
    try {
      const errorReport: ErrorReport = await req.json();

      console.log('📧 Received error report:', errorReport.code);

      // Validate required fields
      if (!errorReport.code || !errorReport.message || !errorReport.timestamp) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Missing required fields: code, message, timestamp' 
          }),
          { status: 400, headers }
        );
      }

      // Insert into Supabase
      const { data, error } = await supabase
        .from('error_reports')
        .insert([
          {
            error_code: errorReport.code,
            error_message: errorReport.message,
            stack_trace: errorReport.stack,
            component_stack: errorReport.componentStack,
            user_agent: errorReport.userAgent,
            url: errorReport.url,
            timestamp: errorReport.timestamp,
            user_id: errorReport.userId,
            session_id: errorReport.sessionId,
            user_description: errorReport.userDescription,
            user_email: errorReport.userEmail,
            additional_info: errorReport.additionalInfo,
            resolved: false,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('❌ Database error:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Database error', 
            details: error.message 
          }),
          { status: 500, headers }
        );
      }

      console.log('✅ Error report saved:', data.id);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Error report received',
          reportId: data.id,
        }),
        { status: 200, headers }
      );
    } catch (error) {
      console.error('❌ Error processing error report:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Internal server error',
          details: error instanceof Error ? error.message : String(error),
        }),
        { status: 500, headers }
      );
    }
  }

  // GET - Retrieve error reports (with optional filtering)
  if (req.method === 'GET') {
    try {
      const url = new URL(req.url);
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const errorCode = url.searchParams.get('errorCode');
      const resolved = url.searchParams.get('resolved');
      const userId = url.searchParams.get('userId');

      let query = supabase
        .from('error_reports')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (errorCode) {
        query = query.eq('error_code', errorCode);
      }
      if (resolved !== null && resolved !== undefined) {
        query = query.eq('resolved', resolved === 'true');
      }
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Database error:', error);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Database error',
            details: error.message,
          }),
          { status: 500, headers }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          data,
          total: count,
          limit,
          offset,
        }),
        { status: 200, headers }
      );
    } catch (error) {
      console.error('❌ Error retrieving error reports:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Internal server error',
          details: error instanceof Error ? error.message : String(error),
        }),
        { status: 500, headers }
      );
    }
  }

  return new Response(
    JSON.stringify({ success: false, error: 'Method not allowed' }),
    { status: 405, headers }
  );
}

/**
 * Supabase Table Schema for error_reports:
 * 
 * CREATE TABLE error_reports (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   error_code TEXT NOT NULL,
 *   error_message TEXT NOT NULL,
 *   stack_trace TEXT,
 *   component_stack TEXT,
 *   user_agent TEXT,
 *   url TEXT,
 *   timestamp TIMESTAMPTZ NOT NULL,
 *   user_id TEXT,
 *   session_id TEXT,
 *   user_description TEXT,
 *   user_email TEXT,
 *   additional_info JSONB,
 *   resolved BOOLEAN DEFAULT FALSE,
 *   resolved_at TIMESTAMPTZ,
 *   resolved_by TEXT,
 *   notes TEXT,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * CREATE INDEX idx_error_reports_code ON error_reports(error_code);
 * CREATE INDEX idx_error_reports_timestamp ON error_reports(timestamp);
 * CREATE INDEX idx_error_reports_user_id ON error_reports(user_id);
 * CREATE INDEX idx_error_reports_resolved ON error_reports(resolved);
 * CREATE INDEX idx_error_reports_created_at ON error_reports(created_at);
 */
