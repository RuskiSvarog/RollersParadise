/**
 * Error Code System for Rollers Paradise
 * 
 * Format: [CATEGORY]-[NUMBER]
 * - FE = Frontend
 * - BE = Backend
 * - MW = Middleware
 * - DB = Database
 */

export const ERROR_CODES = {
  // Frontend Errors (FE-001 to FE-999)
  FE_REACT_COMPONENT: 'FE-001',
  FE_NETWORK_ERROR: 'FE-002',
  FE_UNCAUGHT_ERROR: 'FE-003',
  FE_SUPABASE_CLIENT: 'FE-004',
  FE_AUTH_ERROR: 'FE-005',
  FE_GAME_LOGIC: 'FE-006',
  FE_RENDER_ERROR: 'FE-007',
  FE_STATE_ERROR: 'FE-008',
  FE_VALIDATION_ERROR: 'FE-009',
  FE_STORAGE_ERROR: 'FE-010',

  // Backend Errors (BE-001 to BE-999)
  BE_API_ERROR: 'BE-001',
  BE_DATABASE_ERROR: 'BE-002',
  BE_AUTH_ERROR: 'BE-003',
  BE_VALIDATION_ERROR: 'BE-004',
  BE_SERVER_ERROR: 'BE-005',
  BE_TIMEOUT_ERROR: 'BE-006',
  BE_NOT_FOUND: 'BE-007',
  BE_FORBIDDEN: 'BE-008',
  BE_BAD_REQUEST: 'BE-009',
  BE_CONFLICT: 'BE-010',

  // Middleware Errors (MW-001 to MW-999)
  MW_AUTH_FAILED: 'MW-001',
  MW_TOKEN_EXPIRED: 'MW-002',
  MW_TOKEN_INVALID: 'MW-003',
  MW_RATE_LIMIT: 'MW-004',
  MW_CORS_ERROR: 'MW-005',
  MW_VALIDATION: 'MW-006',

  // Database Errors (DB-001 to DB-999)
  DB_CONNECTION_FAILED: 'DB-001',
  DB_QUERY_ERROR: 'DB-002',
  DB_CONSTRAINT_VIOLATION: 'DB-003',
  DB_TIMEOUT: 'DB-004',
  DB_TRANSACTION_FAILED: 'DB-005',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  stack?: string;
  componentStack?: string;
  userAgent?: string;
  url?: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  additionalInfo?: Record<string, any>;
}

export interface ErrorReport extends ErrorDetails {
  id?: string;
  userDescription?: string;
  userEmail?: string;
  resolved?: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
}

/**
 * Get user-friendly error message based on error code
 */
export function getErrorMessage(code: ErrorCode): string {
  const messages: Record<ErrorCode, string> = {
    // Frontend
    'FE-001': 'A component error occurred. The page may not display correctly.',
    'FE-002': 'Network connection error. Please check your internet connection.',
    'FE-003': 'An unexpected error occurred in the application.',
    'FE-004': 'Database connection error. Please try again.',
    'FE-005': 'Authentication error. Please try logging in again.',
    'FE-006': 'Game logic error. The game state may be inconsistent.',
    'FE-007': 'Rendering error. Some elements may not display correctly.',
    'FE-008': 'Application state error. Try refreshing the page.',
    'FE-009': 'Validation error. Please check your input.',
    'FE-010': 'Local storage error. Check your browser settings.',

    // Backend
    'BE-001': 'Server API error. Please try again later.',
    'BE-002': 'Database error on server. The team has been notified.',
    'BE-003': 'Server authentication error. Please log in again.',
    'BE-004': 'Server validation error. Please check your request.',
    'BE-005': 'Internal server error. Please try again later.',
    'BE-006': 'Server timeout. The operation took too long.',
    'BE-007': 'Resource not found on server.',
    'BE-008': 'Access forbidden. You don\'t have permission.',
    'BE-009': 'Bad request. Please check your input.',
    'BE-010': 'Conflict detected. The resource may have been modified.',

    // Middleware
    'MW-001': 'Authentication failed. Please log in again.',
    'MW-002': 'Your session has expired. Please log in again.',
    'MW-003': 'Invalid authentication token. Please log in again.',
    'MW-004': 'Rate limit exceeded. Please slow down.',
    'MW-005': 'Cross-origin request blocked. Contact support.',
    'MW-006': 'Request validation failed. Check your input.',

    // Database
    'DB-001': 'Cannot connect to database. Please try again.',
    'DB-002': 'Database query error. The team has been notified.',
    'DB-003': 'Data constraint violation. Invalid operation.',
    'DB-004': 'Database timeout. Operation took too long.',
    'DB-005': 'Transaction failed. Please try again.',
  };

  return messages[code] || 'An unknown error occurred.';
}

/**
 * Get error severity level
 */
export function getErrorSeverity(code: ErrorCode): 'low' | 'medium' | 'high' | 'critical' {
  // Critical errors that prevent app usage
  if (code.startsWith('DB-') || code === 'BE-005' || code === 'FE-005') {
    return 'critical';
  }

  // High severity - significant functionality broken
  if (code === 'FE-001' || code === 'FE-006' || code === 'BE-002' || code === 'MW-001') {
    return 'high';
  }

  // Medium severity - some features affected
  if (code.startsWith('FE-') || code.startsWith('MW-')) {
    return 'medium';
  }

  // Low severity - minor issues
  return 'low';
}
