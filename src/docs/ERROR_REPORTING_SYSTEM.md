# Error Reporting System Documentation

## Overview

Rollers Paradise includes a comprehensive error reporting system that captures, tracks, and helps resolve errors from all parts of the application: frontend, backend, and middleware.

## Features

### ✅ Complete Error Capture
- **React Component Errors**: Caught by Error Boundary
- **Uncaught JavaScript Errors**: Caught by global error handler
- **Unhandled Promise Rejections**: Caught by global error handler
- **Network Errors**: Tracked via API interceptor
- **Backend Errors**: Logged from API endpoints
- **Middleware Errors**: Tracked from authentication and validation

### ✅ User-Friendly Error Reporting
- Error codes for easy reference (e.g., FE-001, BE-002)
- User-friendly error messages
- One-click error reporting
- Optional user description of what they were doing
- Optional email for follow-up
- Privacy-focused (only technical data collected)

### ✅ Developer Dashboard
- View all error reports
- Filter by status (resolved/unresolved)
- Search by error code
- Pagination for large datasets
- Detailed error information including stack traces
- Press **Ctrl+Shift+E** to open dashboard

## Error Codes

### Frontend Errors (FE-001 to FE-999)
- **FE-001**: React component error
- **FE-002**: Network connection error
- **FE-003**: Uncaught JavaScript error
- **FE-004**: Supabase client error
- **FE-005**: Authentication error
- **FE-006**: Game logic error
- **FE-007**: Rendering error
- **FE-008**: Application state error
- **FE-009**: Validation error
- **FE-010**: Local storage error

### Backend Errors (BE-001 to BE-999)
- **BE-001**: API error
- **BE-002**: Database error
- **BE-003**: Server authentication error
- **BE-004**: Server validation error
- **BE-005**: Internal server error
- **BE-006**: Server timeout
- **BE-007**: Resource not found
- **BE-008**: Access forbidden
- **BE-009**: Bad request
- **BE-010**: Conflict detected

### Middleware Errors (MW-001 to MW-999)
- **MW-001**: Authentication failed
- **MW-002**: Token expired
- **MW-003**: Token invalid
- **MW-004**: Rate limit exceeded
- **MW-005**: CORS error
- **MW-006**: Request validation failed

### Database Errors (DB-001 to DB-999)
- **DB-001**: Connection failed
- **DB-002**: Query error
- **DB-003**: Constraint violation
- **DB-004**: Database timeout
- **DB-005**: Transaction failed

## Error Severity Levels

- **Critical**: Prevents app usage (DB errors, severe backend errors)
- **High**: Significant functionality broken (component errors, game logic errors)
- **Medium**: Some features affected (frontend errors, middleware errors)
- **Low**: Minor issues (validation errors, UI glitches)

## Architecture

### Frontend Components

1. **ErrorBoundary** (`/components/ErrorBoundary.tsx`)
   - Catches React component errors
   - Shows error UI with code
   - Allows user to report error

2. **ErrorReportModal** (`/components/ErrorReportModal.tsx`)
   - User interface for reporting errors
   - Collects user description
   - Sends report to backend
   - Shows confirmation

3. **ErrorReportsDashboard** (`/components/ErrorReportsDashboard.tsx`)
   - Developer dashboard for viewing errors
   - Filter and search functionality
   - Detailed error inspection
   - Press **Ctrl+Shift+E** to open

### Backend

4. **API Endpoint** (`/api/error-reports.ts`)
   - POST: Receive and store error reports
   - GET: Retrieve error reports (with filtering)
   - Stores in Supabase database

### Utilities

5. **Error Codes** (`/utils/errorCodes.ts`)
   - Centralized error code definitions
   - Error message mapping
   - Severity classification

6. **Global Error Handler** (`/utils/globalErrorHandler.ts`)
   - Captures uncaught errors
   - Captures unhandled promise rejections
   - Queues and sends error reports
   - Shows user notifications

## Database Schema

```sql
CREATE TABLE error_reports (
  id UUID PRIMARY KEY,
  error_code TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  component_stack TEXT,
  user_agent TEXT,
  url TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  user_id TEXT,
  session_id TEXT,
  user_description TEXT,
  user_email TEXT,
  additional_info JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes
- `error_code` - Fast lookups by error code
- `timestamp` - Time-based queries
- `user_id` - User-specific errors
- `session_id` - Session-based errors
- `resolved` - Filter by resolution status
- `created_at` - Recent errors first

## Usage

### For Users

When an error occurs:

1. **Automatic**: The error is automatically logged
2. **User sees**: Error screen with error code
3. **User can**:
   - Click "Try Again" to recover
   - Click "Send Error Report" to help developers
   - Add description of what they were doing
   - Optionally provide email for follow-up
4. **Privacy**: Only technical data is collected, no personal data

### For Developers

#### Opening the Error Dashboard

Press **Ctrl+Shift+E** anywhere in the app to open/close the Error Dashboard.

#### Viewing Error Reports

```javascript
// Dashboard shows:
- Total reports
- Unresolved count
- Resolved count
- List of all errors with details
- Filter by status
- Search by error code
- Pagination
```

#### Manual Error Reporting

```javascript
import { reportError, reportNetworkError, reportAPIError } from './utils/globalErrorHandler';

// Report a caught error
try {
  // risky code
} catch (error) {
  reportError(error, { 
    context: 'placing bet',
    betAmount: 100 
  });
}

// Report network error
reportNetworkError(url, status, statusText, responseBody);

// Report API error
reportAPIError(endpoint, method, error);
```

#### Adding New Error Codes

1. Add to `/utils/errorCodes.ts`:
```typescript
export const ERROR_CODES = {
  // ... existing codes
  FE_NEW_ERROR: 'FE-011',
} as const;
```

2. Add user-friendly message:
```typescript
const messages: Record<ErrorCode, string> = {
  // ... existing messages
  'FE-011': 'Your new error description',
};
```

## API Endpoints

### POST /api/error-reports

Submit a new error report.

**Request Body**:
```json
{
  "code": "FE-001",
  "message": "Component render error",
  "stack": "Error: ...\n  at Component ...",
  "componentStack": "  in Component (at App.tsx:123)",
  "userAgent": "Mozilla/5.0 ...",
  "url": "https://rollersparadise.com/game",
  "timestamp": "2025-11-28T10:00:00Z",
  "userId": "user_123",
  "sessionId": "session_abc",
  "userDescription": "I was placing a bet when this happened",
  "userEmail": "user@example.com",
  "additionalInfo": {
    "betAmount": 100,
    "gameState": "point_established"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Error report received",
  "reportId": "uuid-here"
}
```

### GET /api/error-reports

Retrieve error reports with optional filtering.

**Query Parameters**:
- `limit`: Number of reports (default: 50)
- `offset`: Pagination offset (default: 0)
- `errorCode`: Filter by error code
- `resolved`: Filter by resolution status (true/false)
- `userId`: Filter by user ID

**Response**:
```json
{
  "success": true,
  "data": [...],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

## Maintenance

### Cleanup Old Resolved Errors

The system includes a maintenance function to clean up old resolved errors:

```sql
-- Delete resolved errors older than 90 days (default)
SELECT cleanup_old_resolved_errors();

-- Delete resolved errors older than 30 days
SELECT cleanup_old_resolved_errors(30);
```

### Viewing Statistics

```sql
-- View aggregated error statistics
SELECT * FROM error_reports_stats;
```

Returns:
- Error code
- Total count
- Unresolved count
- Resolved count
- Last occurrence
- First occurrence
- Affected users
- Affected sessions

## Security & Privacy

### Data Collection
- ✅ Technical error information (stack traces, error codes)
- ✅ User agent and URL (for debugging)
- ✅ Session ID (for tracking related errors)
- ✅ User ID (if authenticated)
- ✅ User-provided description (optional)
- ✅ User-provided email (optional)
- ❌ No personal data without user consent
- ❌ No passwords or sensitive information

### Access Control
- Anyone can submit error reports
- Only authenticated admins can view reports
- Only authenticated admins can update reports
- Row Level Security (RLS) enabled

### Rate Limiting
- Error queue system prevents spam
- One error processed per second
- Last 10 errors stored in localStorage as backup

## Testing

### Test Error Reporting

```javascript
// In browser console:

// Test uncaught error
throw new Error('Test error');

// Test unhandled promise rejection
Promise.reject('Test rejection');

// Test React component error
// (trigger by clicking a component that throws)

// Open Error Dashboard
// Press Ctrl+Shift+E
```

## Troubleshooting

### Error reports not appearing

1. Check browser console for errors
2. Verify Supabase connection
3. Check RLS policies
4. Verify API endpoint is accessible

### Error dashboard not opening

1. Press **Ctrl+Shift+E**
2. Check browser console for initialization message
3. Verify global error handler is initialized

### Reports not sending

1. Check network tab for failed requests
2. Verify API endpoint URL
3. Check CORS settings
4. Look for errors in browser console
5. Check localStorage for `pending_error_reports`

## Future Enhancements

- [ ] Email notifications for critical errors
- [ ] Error rate limiting per user
- [ ] Automatic grouping of similar errors
- [ ] Error trends and analytics
- [ ] Integration with external monitoring tools
- [ ] Source map support for production stack traces
- [ ] Automated error resolution suggestions
- [ ] Real-time error dashboard updates

## Support

For issues with the error reporting system:
1. Check this documentation
2. Check browser console for error messages
3. Open Error Dashboard (Ctrl+Shift+E)
4. Contact development team

---

**Last Updated**: November 28, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
