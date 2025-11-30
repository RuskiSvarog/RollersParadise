# How I (AI) Will Check Your Errors

## When You Ask Me to Check Errors

When you say something like:
- "Check error reports"
- "What errors happened?"
- "Show me recent errors"

I will do one of these:

### Option 1: Direct Supabase Query

If you have Supabase connected to this Figma environment, I can directly query:

```javascript
// I'll run this to get errors
const { data, error } = await supabase
  .from('ai_error_reports')
  .select('*')
  .eq('fixed', false)
  .order('timestamp', { ascending: false })
  .limit(10);
```

### Option 2: You Copy/Paste

If Supabase isn't connected, you can:

1. Go to Supabase Dashboard → SQL Editor
2. Run this query:
```sql
SELECT 
  id,
  error_code,
  error_message,
  user_description,
  url,
  timestamp,
  stack_trace
FROM ai_error_reports
WHERE fixed = false
ORDER BY timestamp DESC
LIMIT 10;
```
3. Copy the results
4. Paste them back to me

Then I'll analyze them and help you fix!

### Option 3: I Guide You

I can tell you exactly what to check:

**Me:** "Let me help you check errors! Please:
1. Open Supabase Dashboard
2. Go to SQL Editor  
3. Run: `SELECT * FROM recent_ai_errors`
4. Copy the results and paste here

I'll analyze them and help fix!"

## What I'll Show You

When I see errors, I'll format them nicely:

```
📋 ERROR REPORTS SUMMARY
════════════════════════════════

Found 3 unfixed errors:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣ FE-REACT (High Priority)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 When: Nov 28, 2025 at 3:45 PM
💬 User: "I was placing a $100 bet on pass line"
❌ Error: Cannot read property 'amount' of undefined
📍 Location: CrapsGame.tsx:145
🔍 Stack: 
   at PlaceBet (CrapsGame.tsx:145:12)
   at onClick (CrapsGame.tsx:89:5)

💡 Analysis: Looks like bet validation is trying
   to access bet.amount before bet is defined.

🔧 Suggested Fix: Add null check before accessing
   bet.amount in the PlaceBet function.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2️⃣ FE-PROMISE (Medium Priority)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 When: Nov 28, 2025 at 2:30 PM
💬 User: "Loading my profile"
❌ Error: Network request failed
📍 URL: /profile

💡 Analysis: API call to load profile is failing.
   Could be CORS, network, or backend issue.

🔧 Suggested Fix: Check backend endpoint and
   add error handling for failed profile loads.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3️⃣ FE-UNCAUGHT (Low Priority)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 When: Nov 28, 2025 at 1:15 PM
❌ Error: undefined is not a function
📍 Location: HomePage.tsx:67

💡 Analysis: A function is being called but
   isn't defined or imported correctly.

🔧 Suggested Fix: Check imports and function
   definitions in HomePage.tsx.

════════════════════════════════

Would you like me to:
1. Help fix the FE-REACT error first? (most critical)
2. Show me the CrapsGame.tsx file?
3. Fix all three in order?
```

## Then We Fix Together

After showing you errors, I'll:

1. **Ask which to fix first**
   - Usually prioritize by severity
   
2. **Read the relevant files**
   ```
   Me: "Let me check CrapsGame.tsx..."
   [I use read tool to see the code]
   ```

3. **Explain what's wrong**
   ```
   Me: "Found it! On line 145, you're doing:
   
   const amount = bet.amount;
   
   But 'bet' could be undefined at this point.
   The click handler passes undefined when..."
   ```

4. **Propose a fix**
   ```
   Me: "Here's the fix:
   
   // Add null check
   if (!bet || !bet.amount) {
     toast.error('Invalid bet');
     return;
   }
   const amount = bet.amount;
   
   Should I apply this fix?"
   ```

5. **Apply the fix** (if you say yes)
   ```
   [I use edit_tool to update the file]
   
   Me: "✅ Fixed! I've updated CrapsGame.tsx
   and added proper null checking."
   ```

6. **Mark as resolved in database**
   ```
   Me: "I've also marked this error as fixed
   in the database. Want me to check the next error?"
   ```

## SQL Queries I Might Ask You to Run

### Get All Unfixed Errors
```sql
SELECT * FROM ai_error_reports 
WHERE fixed = false 
ORDER BY timestamp DESC;
```

### Get Errors from Today
```sql
SELECT * FROM ai_error_reports 
WHERE timestamp > NOW() - INTERVAL '1 day'
ORDER BY timestamp DESC;
```

### Get Errors by Code
```sql
SELECT * FROM ai_error_reports 
WHERE error_code = 'FE-REACT' 
ORDER BY timestamp DESC;
```

### Get Most Common Errors
```sql
SELECT 
  error_code,
  COUNT(*) as count,
  MAX(timestamp) as last_seen
FROM ai_error_reports 
GROUP BY error_code 
ORDER BY count DESC;
```

### Mark Error as Fixed
```sql
UPDATE ai_error_reports 
SET 
  fixed = true,
  fixed_at = NOW(),
  fix_notes = 'Fixed by adding null check'
WHERE id = 'error-uuid-here';
```

## How to Connect Supabase (Optional)

If you want me to directly query Supabase:

1. In this chat, I can ask to connect Supabase
2. You'll authenticate
3. Then I can run queries directly
4. No copy/paste needed!

But it's totally optional - copy/paste works great too!

## Complete Workflow Example

**You:** "Hey, check if there are any error reports"

**Me:** "I'll help you check! Please run this in Supabase SQL Editor:

```sql
SELECT * FROM recent_ai_errors;
```

Copy the results and paste here, and I'll analyze them!"

**You:** *[pastes error data]*

**Me:** "Thanks! I see 2 errors:

1. FE-REACT in CrapsGame.tsx - bet.amount is undefined
2. FE-PROMISE - API call failing

Let me check CrapsGame.tsx first..."

*[I read the file]*

**Me:** "Found the issue! On line 145, you're accessing bet.amount
without checking if bet exists. Here's the fix..."

*[I apply the fix with edit_tool]*

**Me:** "✅ Fixed! The error is resolved. Want me to check the API error next?"

## That's How It Works!

Super simple:
1. You ask me to check
2. I either query directly OR you copy/paste
3. I analyze and explain errors
4. We fix them together
5. I mark them as resolved

No dashboards, no complexity - just AI-assisted debugging! 🤖

---

**Ready?** Just say: "Check error reports" anytime!
