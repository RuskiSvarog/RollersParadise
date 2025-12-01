import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import { ErrorDetails } from './errorCodes';
import { fetchErrorReports, displayErrorReports } from './fetchErrorReports';

/**
 * Simple Error Reporter for Figma AI Assistant
 * 
 * Captures errors and stores them in Supabase so the AI assistant
 * can read and help fix them in future conversations.
 */

export interface SimpleErrorReport {
  error_code: string;
  error_message: string;
  stack_trace?: string;
  component_stack?: string;
  user_description?: string;
  user_id?: string;
  url?: string;
  timestamp: string;
  browser_info?: string;
  game_state?: any;
}

/**
 * Send error report to Supabase for AI assistant to review
 */
export async function sendErrorToAI(
  errorCode: string,
  errorMessage: string,
  stackTrace?: string,
  componentStack?: string,
  additionalContext?: Record<string, any>
): Promise<boolean> {
  try {
    // Get user info if available
    let userId: string | undefined;
    try {
      const userStr = localStorage.getItem('casino_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        userId = user.id;
      }
    } catch (e) {
      // Ignore
    }

    // Prepare error report
    const errorReport: SimpleErrorReport = {
      error_code: errorCode,
      error_message: errorMessage,
      stack_trace: stackTrace,
      component_stack: componentStack,
      user_description: additionalContext?.userDescription,
      user_id: userId,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      browser_info: navigator.userAgent,
      game_state: additionalContext,
    };

    // Store in Supabase for AI to read
    const { data, error } = await supabase
      .from('error_reports')
      .insert([errorReport])
      .select()
      .single();

    if (error) {
      console.error('Failed to send error to AI:', error);
      
      // Fallback: Store in localStorage
      try {
        const stored = localStorage.getItem('pending_ai_errors');
        const pending = stored ? JSON.parse(stored) : [];
        pending.push(errorReport);
        localStorage.setItem('pending_ai_errors', JSON.stringify(pending.slice(-20))); // Keep last 20
      } catch (e) {
        console.error('Failed to store error locally:', e);
      }
      
      return false;
    }

    console.log('✅ Error sent to AI assistant:', data.id);
    return true;
  } catch (error) {
    console.error('Failed to send error to AI:', error);
    return false;
  }
}

/**
 * User-friendly error reporter
 * Shows the ErrorReportModal for users to describe what happened
 */
export function showErrorReportPrompt(
  errorCode: string,
  errorMessage: string,
  stackTrace?: string,
  componentStack?: string
) {
  // Create error details object
  const errorDetails: ErrorDetails = {
    code: errorCode,
    message: errorMessage,
    stack: stackTrace,
    componentStack: componentStack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  // Dispatch event to show ErrorReportModal
  const event = new CustomEvent('show-error-report-modal', {
    detail: errorDetails,
  });
  window.dispatchEvent(event);
}

/**
 * Manual error/message reporter for users to contact support
 */
export function showManualReportPrompt() {
  const userMessage = prompt(
    `📝 Send a Message to Support\\n\\n` +
    `Describe your issue, question, or feedback:\\n` +
    `(Press Cancel to close, or type your message and click OK to send)`
  );

  // If user canceled, don't send
  if (userMessage === null || !userMessage.trim()) {
    return;
  }

  const errorCode = 'USER-MESSAGE';
  const errorMessage = 'User Support Message';
  
  // Send to AI with loading toast
  const loadingToast = toast.loading('Sending your message...', {
    description: 'Please wait...',
  });

  sendErrorToAI(errorCode, errorMessage, undefined, undefined, {
    userDescription: userMessage.trim(),
    messageType: 'support',
  }).then((success) => {
    toast.dismiss(loadingToast);
    
    if (success) {
      toast.success('✅ Message Sent!', {
        description: 'Thank you! Our team will review your message soon.',
        duration: 5000,
      });
    } else {
      toast.error('Failed to send message', {
        description: 'Please try again later or check your internet connection.',
        duration: 5000,
      });
    }
  });
}

/**
 * Initialize error tracking
 */
export function initializeErrorTracking() {
  // Catch uncaught errors
  window.addEventListener('error', (event) => {
    console.error('🚨 Uncaught error:', event.error);
    
    const errorCode = 'FE-UNCAUGHT';
    const errorMessage = event.message || event.error?.message || 'Uncaught error';
    const stackTrace = event.error?.stack;
    
    // Send to AI
    sendErrorToAI(errorCode, errorMessage, stackTrace, undefined, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
    
    // Show user notification - automatically show report modal after 1 second
    toast.error('⚠️ Something went wrong', {
      description: errorMessage,
      duration: 8000,
      action: {
        label: 'Send Report',
        onClick: () => showErrorReportPrompt(errorCode, errorMessage, stackTrace),
      },
    });
    
    // Auto-show report modal after brief delay (give user time to read toast)
    setTimeout(() => {
      showErrorReportPrompt(errorCode, errorMessage, stackTrace);
    }, 2000);
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled promise rejection:', event.reason);
    
    const errorCode = 'FE-PROMISE';
    const errorMessage = event.reason?.message || String(event.reason) || 'Promise rejection';
    const stackTrace = event.reason?.stack;
    
    // Send to AI
    sendErrorToAI(errorCode, errorMessage, stackTrace, undefined, {
      reason: String(event.reason),
    });
    
    // Show user notification - automatically show report modal after 1 second
    toast.error('⚠️ Something went wrong', {
      description: errorMessage,
      duration: 8000,
      action: {
        label: 'Send Report',
        onClick: () => showErrorReportPrompt(errorCode, errorMessage, stackTrace),
      },
    });
    
    // Auto-show report modal after brief delay (give user time to read toast)
    setTimeout(() => {
      showErrorReportPrompt(errorCode, errorMessage, stackTrace);
    }, 2000);
  });

  console.log('✅ Error tracking initialized - Errors will be sent to AI assistant');
  
  // Add console helper function to check reports
  (window as any).checkErrorReports = async (limit: number = 20) => {
    try {
      const reports = await fetchErrorReports(limit);
      displayErrorReports(reports);
      return reports;
    } catch (err) {
      console.error('❌ Failed to fetch reports:', err);
      console.log('\n💡 Alternative ways to view reports:');
      console.log('  • Add ?admin-reports=true to URL');
      console.log('  • Press Ctrl+Shift+Alt+R');
    }
  };
  
  // Add admin panel shortcut helper
  (window as any).openAdminReports = () => {
    console.log('🔒 Opening admin reports panel...');
    console.log('💡 Password: RollersParadise2024Admin!');
    window.location.href = window.location.origin + window.location.pathname + '?admin-reports=true';
  };
  
  console.log('💡 ADMIN COMMANDS:');
  console.log('  • checkErrorReports() - Quick console view');
  console.log('  • openAdminReports() - Open secure admin panel');
  
  // Try to send any pending errors from localStorage
  try {
    const stored = localStorage.getItem('pending_ai_errors');
    if (stored) {
      const pending: SimpleErrorReport[] = JSON.parse(stored);
      console.log(`📤 Sending ${pending.length} pending errors to AI...`);
      
      pending.forEach(async (report) => {
        const { error } = await supabase.from('error_reports').insert([report]);
        if (!error) {
          console.log('✅ Pending error sent:', report.error_code);
        }
      });
      
      localStorage.removeItem('pending_ai_errors');
    }
  } catch (e) {
    console.error('Failed to send pending errors:', e);
  }
}