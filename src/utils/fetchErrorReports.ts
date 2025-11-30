import { projectId, publicAnonKey } from './supabase/info';

export interface ErrorReport {
  id: string;
  error_code: string;
  error_message: string;
  stack_trace?: string;
  component_stack?: string;
  user_agent?: string;
  url?: string;
  timestamp: string;
  user_id?: string;
  session_id?: string;
  user_description?: string;
  user_email?: string;
  additional_info?: any;
  resolved: boolean;
  created_at: string;
  report_type?: 'error' | 'bug' | 'player'; // Added to distinguish report types
  
  // Bug report specific fields
  reporter_id?: string;
  reporter_name?: string;
  reason?: string;
  description?: string;
  room_id?: string;
  status?: string;
  
  // Player report specific fields
  target_id?: string;
  target_name?: string;
  type?: string;
}

/**
 * Delete/Mark Complete an error report
 */
export async function deleteErrorReport(reportId: string): Promise<{ success: boolean; message: string }> {
  try {
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/error-reports/delete/${reportId}`;
    
    console.log('🗑️ Deleting error report:', reportId);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete report: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Report deleted successfully');
    
    return { success: true, message: 'Report marked complete and removed' };
  } catch (error) {
    console.error('❌ Error deleting report:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Fetch error reports from the backend
 * This is used by the AI assistant to view user-submitted reports
 */
export async function fetchErrorReports(limit: number = 50): Promise<ErrorReport[]> {
  try {
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/error-reports/recent?limit=${limit}`;
    
    console.log('🔍 Fetching error reports from backend...');
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch reports: ${response.status}`);
    }

    const data = await response.json();
    const reports = data.reports || data.data || [];
    
    console.log(`✅ Fetched ${reports.length} error reports`);
    return reports;
  } catch (error) {
    console.error('❌ Error fetching reports:', error);
    throw error;
  }
}

/**
 * Alias for fetching all reports (same as fetchErrorReports)
 */
export async function fetchAllReports(limit: number = 100): Promise<ErrorReport[]> {
  return fetchErrorReports(limit);
}

/**
 * Display error reports in console
 */
export function displayErrorReports(reports: ErrorReport[]): void {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('           ROLLERS PARADISE - ERROR REPORTS');
  console.log(`           Total Reports: ${reports.length}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  reports.forEach((report, index) => {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`REPORT #${index + 1}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`ID: ${report.id}`);
    console.log(`Date: ${new Date(report.created_at).toLocaleString()}`);
    console.log(`Error Code: ${report.error_code}`);
    console.log(`Status: ${report.resolved ? '✅ RESOLVED' : '❌ UNRESOLVED'}`);
    console.log(`\nError Message:\n${report.error_message}`);

    if (report.user_description) {
      console.log(`\n👤 USER DESCRIPTION:\n"${report.user_description}"`);
    }

    if (report.user_email) {
      console.log(`\n📧 Contact Email: ${report.user_email}`);
    }

    if (report.user_id) {
      console.log(`\n🆔 User ID: ${report.user_id}`);
    }

    if (report.url) {
      console.log(`\n🔗 Page URL: ${report.url}`);
    }

    if (report.stack_trace) {
      console.log(`\n📋 STACK TRACE:\n${report.stack_trace}`);
    }
  });

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('                        SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Total Reports: ${reports.length}`);
  console.log(`Unresolved: ${reports.filter(r => !r.resolved).length}`);
  console.log(`Resolved: ${reports.filter(r => r.resolved).length}\n`);
}