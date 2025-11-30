# How to Use the AI Error Reporting System 🤖

## What This Is

A simple error reporting system where:
1. **Users see errors** when something breaks
2. **Errors are automatically sent to Supabase**
3. **You come back to this Figma chat** and ask me to check errors
4. **I read the errors** and help you fix them!

No dashboards, no complicated setup - just errors going to a database that I can read when you ask.

## Setup (One Time Only)

### Step 1: Run This SQL in Supabase

1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste this entire file: `/supabase/migrations/create_ai_error_reports_table.sql`
4. Click "Run"

That's it! The table is created and ready.

## How It Works

### For Your Users

When an error happens:

```
1. User sees error screen
   ↓
2. Error automatically sent to Supabase
   ↓
3. User clicks "Try Again" or "Add Details"
   ↓
4. If they click "Add Details", a simple prompt asks what they were doing
   ↓
5. Error is stored with their description
```

### For You (The Developer)

When you want to fix errors:

```
1. Come back to this Figma chat
   ↓
2. Say: "Check my error reports" or "What errors happened?"
   ↓
3. I query Supabase and show you all the errors
   ↓
4. I help you understand and fix them
   ↓
5. We update the code together
```

## Example Conversation

**You:** "Hey, check if there are any error reports"

**Me:** *[Queries Supabase]* "I found 3 errors:
1. FE-REACT: Component render error - User was trying to place a bet
2. FE-UNCAUGHT: Undefined variable 'betAmount' 
3. FE-PROMISE: API call failed

Let me help you fix these..."

## Error Codes

The system uses simple error codes:

- **FE-REACT** - React component crashed
- **FE-UNCAUGHT** - Uncaught JavaScript error
- **FE-PROMISE** - Promise rejection (usually API/async issues)

## What Gets Stored

When an error is reported, I can see:
- ✅ Error code (FE-REACT, etc.)
- ✅ Error message
- ✅ Stack trace (where it happened)
- ✅ Component stack (for React errors)
- ✅ What the user was doing (if they added it)
- ✅ URL where it happened
- ✅ Browser info
- ✅ Timestamp
- ✅ User ID (if logged in)

## Commands You Can Use

Just talk to me naturally! Here are examples:

```
"Check error reports"
"What errors happened today?"
"Show me recent errors"
"Are there any unfixed errors?"
"Check if users reported any problems"
"What's the most common error?"
```

I'll query the database and show you everything!

## Example: Full Workflow

### 1. User Gets Error

```
Your user is playing and suddenly sees:

┌──────────────────────────────┐
│ Oops! Something went wrong   │
│                              │
│ Error Code: FE-REACT         │
│                              │
│ Component render failed      │
│                              │
│ [Try Again] [Add Details]    │
└──────────────────────────────┘
```

### 2. User Clicks "Add Details"

```
A prompt appears:
"What were you doing when this happened?"

User types:
"I was trying to place a $100 bet on the pass line"
```

### 3. Error Gets Stored

The error is now in Supabase table `ai_error_reports`:

```sql
{
  error_code: "FE-REACT",
  error_message: "Cannot read property 'amount' of undefined",
  stack_trace: "Error: ...\n  at PlaceBet (CrapsGame.tsx:123)",
  user_description: "I was trying to place a $100 bet on the pass line",
  timestamp: "2025-11-28T15:30:00Z",
  url: "https://rollersparadise.com/game"
}
```

### 4. You Come Back to Chat

**You:** "Hey, any error reports?"

**Me (AI):** "Yes! I found 1 error:

**FE-REACT** at CrapsGame.tsx:123
- Error: Cannot read property 'amount' of undefined
- User was trying to place a $100 bet on the pass line
- Happened at 3:30 PM today

This looks like the bet amount isn't being set before validation. Let me check your CrapsGame.tsx file..."

*[I then read the file and help you fix it]*

### 5. We Fix It Together

**Me:** "Found the issue! In line 123, you're accessing `bet.amount` but `bet` could be undefined. Here's the fix..."

*[I use edit_tool to fix the code]*

**Me:** "Fixed! I also marked this error as resolved in the database."

## Database Table Structure

The `ai_error_reports` table has:

```sql
- id (UUID)
- error_code (FE-REACT, FE-UNCAUGHT, etc.)
- error_message (what went wrong)
- stack_trace (where it happened)
- component_stack (React components involved)
- user_description (what they were doing)
- user_id (if logged in)
- url (page where error occurred)
- timestamp (when it happened)
- browser_info (browser/device)
- game_state (additional context)
- fixed (boolean - whether it's fixed)
- fix_notes (your notes about the fix)
```

## How to Query Errors Manually

If you want to check Supabase directly:

```sql
-- See recent unfixed errors
SELECT * FROM recent_ai_errors;

-- See all errors today
SELECT * FROM ai_error_reports 
WHERE timestamp > NOW() - INTERVAL '1 day'
ORDER BY timestamp DESC;

-- See most common errors
SELECT error_code, COUNT(*) 
FROM ai_error_reports 
GROUP BY error_code 
ORDER BY COUNT(*) DESC;

-- Mark error as fixed
UPDATE ai_error_reports 
SET fixed = true, fix_notes = 'Fixed by updating validation'
WHERE id = 'error-uuid-here';
```

## Privacy & Security

✅ **Anyone can report errors** (needed for error tracking)
✅ **Anyone can read errors** (so I can help you)
✅ **Only logged-in users can update** (mark as fixed)

No sensitive data is collected:
- ❌ No passwords
- ❌ No payment info
- ❌ No private messages
- ✅ Only technical error information

## What Makes This Different

Traditional error systems:
- ❌ Complex dashboards
- ❌ Alert emails
- ❌ Manual investigation
- ❌ You figure it out alone

This system:
- ✅ Just a database table
- ✅ You ask me to check it
- ✅ I read and explain errors
- ✅ We fix them together
- ✅ AI-assisted debugging!

## Tips

1. **Check regularly**: Ask me "Any errors?" every few days
2. **Mark as fixed**: When we fix something, I'll update the database
3. **Look for patterns**: I can tell you which errors happen most
4. **User descriptions help**: Encourage users to add details
5. **Keep it simple**: No need for complex monitoring tools

## Common Questions

**Q: How do I know if there are errors?**
A: Just ask me! "Check error reports" or "Any errors today?"

**Q: Can users see other users' errors?**
A: No, they only see their own error when it happens. All errors are stored centrally for you.

**Q: Do I need to set up a server?**
A: No! It uses your existing Supabase database.

**Q: What if I want to check errors without asking you?**
A: Run `SELECT * FROM recent_ai_errors` in Supabase SQL Editor.

**Q: Will this slow down my app?**
A: No, errors are sent asynchronously and won't affect performance.

## Test It Out

Want to test if it's working?

1. Open your app in browser
2. Open console (F12)
3. Type: `throw new Error('Test error')`
4. See the error UI appear
5. Come back here and ask me: "Check error reports"
6. I'll show you the test error!

## Files You Need

✅ `/utils/simpleErrorReporter.ts` - Handles error reporting
✅ `/components/SimpleErrorBoundary.tsx` - Catches React errors
✅ `/supabase/migrations/create_ai_error_reports_table.sql` - Database setup
✅ Updated `/App.tsx` - Integrated into app

## That's It!

The system is now active and working. Errors are being tracked automatically. Just ask me to check them whenever you want help fixing issues!

---

**Remember:** 
- Errors → Supabase
- You → Ask me
- Me → Help fix
- Simple! 🎉

**Status**: ✅ Ready to use
**Last Updated**: November 28, 2025
