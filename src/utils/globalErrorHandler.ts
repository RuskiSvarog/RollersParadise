import { ERROR_CODES, ErrorDetails } from './errorCodes';
import { toast } from 'sonner';

/**
 * Global Error Handler
 * Captures uncaught errors and unhandled promise rejections
 */

let errorQueue: ErrorDetails[] = [];
let isProcessing = false;

function getUserId(): string | undefined {
  try {
    const userStr = localStorage.getItem('casino_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id;
    }
  } catch (e) {
    console.error('Failed to get user ID:', e);
  }
  return undefined;
}

function getSessionId(): string {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}

/**
 * Send error report to backend
 */
async function sendErrorReport(errorDetails: ErrorDetails) {
  try {
    const response = await fetch('https://rollersparadise.com/api/error-reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorDetails),
    });

    if (response.ok) {
      console.log('✅ Error report sent:', errorDetails.code);
    } else {
      console.error('❌ Failed to send error report:', response.statusText);
    }
  } catch (error) {
    console.error('❌ Error sending error report:', error);
    // Store in localStorage as backup
    try {
      const stored = localStorage.getItem('pending_error_reports');
      const reports = stored ? JSON.parse(stored) : [];
      reports.push(errorDetails);
      localStorage.setItem('pending_error_reports', JSON.stringify(reports.slice(-10))); // Keep last 10
    } catch (e) {
      console.error('Failed to store error report:', e);
    }
  }
}

/**
 * Process error queue
 */
async function processErrorQueue() {
  if (isProcessing || errorQueue.length === 0) return;

  isProcessing = true;
  const error = errorQueue.shift();

  if (error) {
    await sendErrorReport(error);
  }

  isProcessing = false;

  if (errorQueue.length > 0) {
    setTimeout(processErrorQueue, 1000); // Process next after 1 second
  }
}

/**
 * Add error to queue
 */
function queueError(errorDetails: ErrorDetails) {
  errorQueue.push(errorDetails);
  processErrorQueue();
}

/**
 * Handle uncaught errors
 */
function handleError(event: ErrorEvent) {
  console.error('🚨 Uncaught Error:', event.error);

  const errorDetails: ErrorDetails = {
    code: ERROR_CODES.FE_UNCAUGHT_ERROR,
    message: event.message || 'Uncaught error',
    stack: event.error?.stack,
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    userId: getUserId(),
    sessionId: getSessionId(),
    additionalInfo: {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      errorType: 'Uncaught Error',
    },
  };

  queueError(errorDetails);

  // Show user-friendly toast
  toast.error(`Error ${errorDetails.code}: ${errorDetails.message}`, {
    duration: 5000,
    action: {
      label: 'Report',
      onClick: () => {
        // Store error for reporting
        sessionStorage.setItem('last_error', JSON.stringify(errorDetails));
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('show-error-report'));
      },
    },
  });
}

/**
 * Handle unhandled promise rejections
 */
function handleUnhandledRejection(event: PromiseRejectionEvent) {
  console.error('🚨 Unhandled Promise Rejection:', event.reason);

  const errorDetails: ErrorDetails = {
    code: ERROR_CODES.FE_UNCAUGHT_ERROR,
    message: event.reason?.message || event.reason || 'Unhandled promise rejection',
    stack: event.reason?.stack,
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    userId: getUserId(),
    sessionId: getSessionId(),
    additionalInfo: {
      reason: String(event.reason),
      errorType: 'Unhandled Promise Rejection',
    },
  };

  queueError(errorDetails);

  // Show user-friendly toast
  toast.error(`Error ${errorDetails.code}: ${errorDetails.message}`, {
    duration: 5000,
    action: {
      label: 'Report',
      onClick: () => {
        sessionStorage.setItem('last_error', JSON.stringify(errorDetails));
        window.dispatchEvent(new CustomEvent('show-error-report'));
      },
    },
  });
}

/**
 * Initialize global error handlers
 */
export function initializeGlobalErrorHandler() {
  // Handle uncaught errors
  window.addEventListener('error', handleError);

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', handleUnhandledRejection);

  console.log('✅ Global error handler initialized');

  // Try to send any pending error reports from localStorage
  try {
    const stored = localStorage.getItem('pending_error_reports');
    if (stored) {
      const reports = JSON.parse(stored);
      reports.forEach((report: ErrorDetails) => queueError(report));
      localStorage.removeItem('pending_error_reports');
    }
  } catch (e) {
    console.error('Failed to process pending error reports:', e);
  }
}

/**
 * Cleanup global error handlers
 */
export function cleanupGlobalErrorHandler() {
  window.removeEventListener('error', handleError);
  window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  console.log('✅ Global error handler cleaned up');
}

/**
 * Manually report an error
 */
export function reportError(error: Error, additionalInfo?: Record<string, any>) {
  const errorDetails: ErrorDetails = {
    code: ERROR_CODES.FE_UNCAUGHT_ERROR,
    message: error.message,
    stack: error.stack,
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    userId: getUserId(),
    sessionId: getSessionId(),
    additionalInfo: {
      errorName: error.name,
      ...additionalInfo,
    },
  };

  queueError(errorDetails);
}

/**
 * Report network error
 */
export function reportNetworkError(url: string, status: number, statusText: string, responseBody?: any) {
  const errorDetails: ErrorDetails = {
    code: ERROR_CODES.FE_NETWORK_ERROR,
    message: `Network error: ${status} ${statusText}`,
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    userId: getUserId(),
    sessionId: getSessionId(),
    additionalInfo: {
      requestUrl: url,
      status,
      statusText,
      responseBody,
      errorType: 'Network Error',
    },
  };

  queueError(errorDetails);

  // Show user-friendly toast
  toast.error(`Network Error ${errorDetails.code}: Failed to connect to server`, {
    duration: 5000,
  });
}

/**
 * Report API error
 */
export function reportAPIError(endpoint: string, method: string, error: any) {
  const errorDetails: ErrorDetails = {
    code: ERROR_CODES.BE_API_ERROR,
    message: error?.message || 'API error',
    stack: error?.stack,
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    userId: getUserId(),
    sessionId: getSessionId(),
    additionalInfo: {
      endpoint,
      method,
      error: String(error),
      errorType: 'API Error',
    },
  };

  queueError(errorDetails);
}