# How to Check Error Reports - Complete Guide

## Overview

You can now view all error reports that have been submitted from the website to see if they went through successfully to the database.

## System Architecture

### Frontend → Backend → Database Flow

```
User encounters error
        ↓
Error Report Modal or SimpleErrorBoundary
        ↓
POST to /api/error-reports
        ↓
Supabase error_reports table
        ↓
Viewable in Admin Error Reports Viewer
```

## How to Access Error Reports

### Method 1: URL Parameter (Easiest)
1. Open your Rollers Paradise website
2. Add `?admin=errors` to the end of the URL
3. Example: `https://yoursite.com/?admin=errors`
4. The Error Reports Viewer will automatically open

### Method 2: Keyboard Shortcut
1. While on the Rollers Paradise website
2. Press **Ctrl + Shift + R** on your keyboard
3. The Error Reports Viewer will open immediately

## Error Reports Viewer Features

### Main Interface ✅

#### Header Section
- **Title**: "Error Reports Database"
- **Subtitle**: "View all submitted error reports"
- **Close Button**: X in top right corner

#### Controls Section
- **Search Bar**: Search by error code
  - Type error code and press Enter or click Refresh
- **Show Resolved Checkbox**: Toggle to show/hide resolved reports
- **Refresh Button**: Reload reports from database
  - Shows spinner animation when loading

#### Statistics Display
- **Total Reports**: Total count of all reports
- **Unresolved**: Count of open issues (red)
- **Resolved**: Count of fixed issues (green)

### Reports List

Each error report shows:
- ✅ or ❌ icon (resolved vs open)
- **Error Code** in monospace font (e.g., FE-REACT, BE-API-500)
- **Status Badge**: "Open" (red) or "Resolved" (green)
- **Error Message**: Brief description
- **User Description**: What the user was doing (if provided)
- **Timestamp**: When error occurred
- **User Email**: Contact info (if provided)
- **User ID**: Partial ID for tracking
- **Click to View**: Arrow indicating it's clickable

### Detail View

Clicking any report opens a detailed modal showing:

#### Basic Information
- **Error Code**: Full code
- **Error Message**: Complete error text
- **User Description**: Full user feedback
- **User Email**: Contact email

#### Technical Details
- **Timestamp**: When error occurred
- **Created At**: When report was submitted
- **URL**: Page where error happened
- **User Agent**: Browser/device information
- **Stack Trace**: JavaScript error stack
- **Component Stack**: React component hierarchy
- **Additional Info**: Extra debugging data (JSON)

## Checking Your Specific Report

### Step 1: Open the Viewer
Use either method above to open the Error Reports Viewer

### Step 2: Find Your Report
Look for recent reports at the top of the list (sorted by newest first)

### Step 3: Identify Your Report
Look for:
- Your error code (shown in the success message)
- The timestamp (should match when you submitted)
- Your email (if you provided it)
- Your description (what you wrote)

### Step 4: View Details
Click on your report to see full details including:
- Complete error message
- Your description
- All technical details
- Confirmation it was saved

## Understanding Report Status

### 🔴 Open Reports (Red)
- **Status**: "Open"
- **Border**: Red border
- **Icon**: AlertCircle (⚠️)
- **Meaning**: Issue not yet resolved
- **This is normal**: New reports start as "Open"

### 🟢 Resolved Reports (Green)
- **Status**: "Resolved"
- **Border**: Green border
- **Icon**: CheckCircle (✅)
- **Meaning**: Issue has been fixed
- **Note**: Developers mark reports as resolved when fixed

## What to Look For

### Report Successfully Saved ✅
- Your error code appears in the list
- Timestamp matches when you submitted
- Your description is visible
- Status shows "Open" (normal for new reports)
- All details are present

### Report NOT Saved ❌
- No reports with your timestamp
- Your error code is missing
- List is empty or very old
- Check browser console for errors

## Database Structure

Reports are stored in the `error_reports` table with:

### Required Fields
- `error_code` - Error code (e.g., FE-REACT)
- `error_message` - Error description
- `timestamp` - When error occurred

### Optional Fields  
- `user_description` - What user was doing
- `user_email` - User's email
- `stack_trace` - JavaScript error stack
- `component_stack` - React component trace
- `user_agent` - Browser information
- `url` - Page URL
- `user_id` - User identifier
- `session_id` - Session identifier
- `additional_info` - Extra debugging data

### System Fields
- `id` - Unique identifier (UUID)
- `created_at` - When report was saved
- `resolved` - Boolean (open/closed)
- `resolved_at` - When marked resolved
- `resolved_by` - Who resolved it
- `notes` - Admin notes

## API Endpoints

### GET /api/error-reports
Retrieve error reports from database

**Query Parameters:**
- `limit` - Number of reports (default: 50, max: 100)
- `offset` - Skip this many reports (for pagination)
- `errorCode` - Filter by specific error code
- `resolved` - Filter by resolved status (true/false)
- `userId` - Filter by user ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "error_code": "FE-REACT",
      "error_message": "Something went wrong",
      "user_description": "I was clicking on...",
      "timestamp": "2025-11-28T10:30:00Z",
      "created_at": "2025-11-28T10:30:05Z",
      "resolved": false
    }
  ],
  "total": 42,
  "limit": 50,
  "offset": 0
}
```

### POST /api/error-reports
Submit new error report

**Request Body:**
```json
{
  "code": "FE-REACT",
  "message": "Component crashed",
  "timestamp": "2025-11-28T10:30:00Z",
  "userDescription": "I was trying to place a bet...",
  "userEmail": "user@example.com",
  "stack": "Error: ...",
  "url": "https://site.com/game",
  "userAgent": "Mozilla/5.0..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Error report received",
  "reportId": "uuid-here"
}
```

## Troubleshooting

### Can't Open Viewer
- **Problem**: URL parameter or keyboard shortcut not working
- **Solution**: 
  - Make sure you're on the actual game page
  - Try refreshing the page first
  - Check browser console for errors

### No Reports Showing
- **Problem**: List is empty
- **Solution**:
  - Click Refresh button
  - Check "Show Resolved" checkbox
  - Try clearing search filter
  - Verify database connection

### Report Not Found
- **Problem**: Your report doesn't appear
- **Solution**:
  - Check timestamp - might be on next page
  - Search by error code
  - Verify report was sent (check browser console)
  - Check network tab for failed requests

### Loading Forever
- **Problem**: Spinner keeps spinning
- **Solution**:
  - Check internet connection
  - Refresh the page
  - Check browser console for errors
  - Verify Supabase is configured

## Common Error Codes

### Frontend Errors
- **FE-REACT** - React component crash
- **FE-NETWORK** - Network/API error
- **FE-AUTH** - Authentication error
- **FE-PAYMENT** - Payment processing error
- **FE-DICE** - Dice animation error

### Backend Errors
- **BE-API-500** - Server internal error
- **BE-API-404** - Resource not found
- **BE-API-401** - Authentication failed
- **BE-DB** - Database error

### System Errors
- **SYS-INIT** - Initialization error
- **SYS-CONFIG** - Configuration error
- **SYS-PERMISSION** - Permission denied

## Security & Privacy

### Data Protection ✅
- Reports only accessible via admin interface
- No personal data required
- Email is optional
- Data stored securely in Supabase

### Access Control
- Currently accessible to anyone with URL
- For production, add authentication
- Limit access to admin users only
- Consider IP restrictions

### User Privacy
- No automatic PII collection
- User descriptions are voluntary
- Stack traces may contain file paths
- Consider data retention policies

## Next Steps

### For Users
1. Submit error report when issue occurs
2. Note your error code from success message
3. Use admin viewer to verify it was saved
4. Optionally check back for resolution status

### For Developers
1. Regularly check error reports
2. Investigate high-priority errors
3. Mark as resolved when fixed
4. Add notes for tracking

### For Admins
1. Monitor error patterns
2. Identify recurring issues
3. Prioritize based on frequency
4. Communicate fixes to users

## Best Practices

### When Submitting Reports
✅ **DO:**
- Provide detailed description
- Include what you were doing
- Add email for follow-up
- Be specific about steps

❌ **DON'T:**
- Submit duplicate reports
- Use offensive language
- Include sensitive data
- Spam the system

### When Reviewing Reports
✅ **DO:**
- Check regularly
- Respond to user emails
- Mark resolved when fixed
- Add helpful notes

❌ **DON'T:**
- Ignore user descriptions
- Delete reports prematurely
- Forget to update status
- Miss pattern recognition

## Quick Reference Card

### Access Methods
```
URL:      Add ?admin=errors
Keyboard: Ctrl + Shift + R
```

### Key Features
```
Search:   Filter by error code
Filter:   Show/hide resolved
Refresh:  Reload from database
Details:  Click any report
```

### Report Status
```
🔴 Open     - Not yet fixed
🟢 Resolved - Issue fixed
```

### Important Fields
```
Code:        Error identifier
Message:     Error description
User Input:  What they were doing
Timestamp:   When it happened
```

## Summary

The Error Reports Viewer provides a complete view of all error reports submitted from your Rollers Paradise casino game. You can:

✅ Verify reports were successfully saved
✅ Search and filter by various criteria  
✅ View detailed technical information
✅ Track resolution status
✅ Monitor error patterns
✅ Improve game reliability

**Your report definitely went through if you:**
- Saw the success confirmation screen
- Received a reference code
- See the report in the admin viewer
- All details match what you submitted

**Access Now:**
- Add `?admin=errors` to your URL, or
- Press **Ctrl + Shift + R**

That's it! Your error reporting system is fully functional and ready to help improve the game! 🎰✅
