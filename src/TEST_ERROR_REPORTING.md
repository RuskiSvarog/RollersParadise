# 🧪 Error Reporting System - Quick Test Guide

**How to verify the error reporting system is working**

---

## ⚡ Quick Test (30 seconds)

### **Test the Send Report Button:**

1. Open browser console (F12)

2. Type this to trigger an error:
```javascript
window.dispatchEvent(new CustomEvent('show-error-report-modal', {
  detail: {
    code: 'TEST-ERROR',
    message: 'This is a test error',
    stack: 'Test stack trace',
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  }
}));
```

3. ✅ **Expected:** Error report modal appears

4. ✅ **Check:** "Send Report" button is visible

5. Click "Send Report"

6. ✅ **Expected:** Success screen appears

7. ✅ **Expected:** "Report Sent!" message

8. ✅ **Expected:** Modal closes after 2 seconds

**✅ PASS** - Error reporting is working!

---

## 🔍 Detailed Tests

### **Test 1: Modal Appears**

```javascript
// In console:
window.dispatchEvent(new CustomEvent('show-error-report-modal', {
  detail: {
    code: 'TEST-001',
    message: 'Test error message',
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  }
}));
```

✅ Modal appears  
✅ Shows error code: TEST-001  
✅ Shows error message  
✅ Has "Copy Error Details" button  
✅ Has "Send Report" button  

---

### **Test 2: Send Report Button**

1. Open modal (use test above)
2. Look for blue "Send Report" button
3. ✅ Button should be visible
4. ✅ Button should have Send icon
5. ✅ Should say "Send Report"

---

### **Test 3: Add Description**

1. Open modal
2. Find "What were you doing?" field
3. Type: "This is a test description"
4. ✅ Text appears in field
5. Click "Send Report"
6. ✅ Report sends successfully

---

### **Test 4: Add Email**

1. Open modal
2. Find "Your Email" field
3. Type: "test@example.com"
4. ✅ Email appears in field
5. Click "Send Report"
6. ✅ Report sends successfully

---

### **Test 5: Copy to Clipboard**

1. Open modal
2. Click "Copy Error Details" button
3. ✅ Toast notification: "Error details copied!"
4. Paste in notepad
5. ✅ Error details are there

---

### **Test 6: Success Screen**

1. Open modal
2. Click "Send Report"
3. ✅ Loading state: "Sending..."
4. ✅ Success screen appears
5. ✅ Green gradient background
6. ✅ Checkmark icon
7. ✅ "Report Sent!" message
8. ✅ Reference code shown
9. ✅ Auto-closes after 2 seconds

---

### **Test 7: React Component Error**

Create a component that throws an error:

```typescript
function TestError() {
  throw new Error('Test React Error');
  return <div>Never reached</div>;
}

// Add to your page temporarily
<TestError />
```

✅ Error boundary catches it  
✅ Error screen appears  
✅ "Add Details" button visible  
✅ Click "Add Details"  
✅ Modal appears  
✅ Can send report  

---

### **Test 8: Uncaught Error**

In console:
```javascript
throw new Error('Test uncaught error');
```

✅ Error is caught  
✅ Toast notification appears  
✅ "Report" button in toast  
✅ Click "Report"  
✅ Modal appears  
✅ Can send report  

---

### **Test 9: Promise Rejection**

In console:
```javascript
Promise.reject(new Error('Test promise rejection'));
```

✅ Rejection is caught  
✅ Toast notification appears  
✅ "Report" button works  
✅ Modal appears  
✅ Can send report  

---

### **Test 10: Manual Report**

In console:
```javascript
const { showErrorReportPrompt } = await import('./utils/simpleErrorReporter');
showErrorReportPrompt('MANUAL-TEST', 'Manual error test', 'Stack trace here');
```

✅ Modal appears instantly  
✅ Shows error details  
✅ Can send report  

---

## ✅ Acceptance Criteria

### **Must Have:**

✅ Modal appears when error occurs  
✅ "Send Report" button is visible  
✅ "Send Report" button works  
✅ Description field works  
✅ Email field works  
✅ "Copy Error Details" works  
✅ Success screen appears  
✅ Report sent to backend  
✅ Modal closes automatically  
✅ No console errors  

### **Should Have:**

✅ Loading state during send  
✅ Error handling if send fails  
✅ Privacy notice displayed  
✅ Technical details collapsible  
✅ Keyboard shortcuts work (Esc to close)  
✅ Touch-friendly on mobile  

---

## 🐛 Common Issues

### **Issue: Modal doesn't appear**

**Check:**
1. Is event listener attached? (Check App.tsx)
2. Any console errors?
3. Is ErrorReportModal imported?
4. Is state being set?

**Solution:**
```javascript
// Check if event listener is working:
console.log('Dispatching test event...');
window.dispatchEvent(new CustomEvent('show-error-report-modal', {
  detail: { code: 'TEST', message: 'Test', timestamp: new Date().toISOString(), url: window.location.href, userAgent: navigator.userAgent }
}));
```

---

### **Issue: Send button doesn't work**

**Check:**
1. Is API endpoint running?
2. Check network tab for errors
3. Check console for errors
4. Is button disabled?

**Solution:**
```javascript
// Test API directly:
fetch('/api/error-reports', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: 'TEST',
    message: 'Test',
    timestamp: new Date().toISOString()
  })
}).then(r => r.json()).then(console.log);
```

---

### **Issue: Success screen doesn't show**

**Check:**
1. Did API return success?
2. Check network response
3. Any console errors?

**Solution:**
Look for "✅ Error report sent:" in console logs

---

## 📊 Verification Checklist

```
[ ] Modal appears on demand
[ ] Send Report button visible
[ ] Send Report button clickable
[ ] Description field works
[ ] Email field works
[ ] Copy button works
[ ] Loading state shows
[ ] Success screen shows
[ ] Reference code displays
[ ] Modal auto-closes
[ ] No console errors
[ ] Works on all pages
[ ] Works in all situations
[ ] Toast notifications work
[ ] React errors caught
[ ] Uncaught errors caught
[ ] Promise rejections caught
```

---

## 🎯 Final Verification

**Run this complete test:**

```javascript
console.log('🧪 Testing Error Reporting System...');

// Test 1: Modal appears
console.log('Test 1: Showing modal...');
window.dispatchEvent(new CustomEvent('show-error-report-modal', {
  detail: {
    code: 'FINAL-TEST',
    message: 'Final verification test',
    stack: 'Test stack trace',
    componentStack: 'Test component stack',
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  }
}));

// Now manually:
// 1. Check modal appeared ✅
// 2. Add description: "Final test description" ✅
// 3. Add email: "test@example.com" ✅
// 4. Click "Copy Error Details" ✅
// 5. Click "Send Report" ✅
// 6. Wait for success screen ✅
// 7. Wait for auto-close ✅

console.log('✅ If all steps passed, error reporting is WORKING!');
```

---

## ✅ Status

If all tests pass:

```
╔════════════════════════════════════╗
║  ERROR REPORTING SYSTEM            ║
╠════════════════════════════════════╣
║  Modal Appears:       ✅ PASS      ║
║  Send Button:         ✅ PASS      ║
║  Description Field:   ✅ PASS      ║
║  Email Field:         ✅ PASS      ║
║  Copy Button:         ✅ PASS      ║
║  Success Screen:      ✅ PASS      ║
║  Auto-Close:          ✅ PASS      ║
║  API Integration:     ✅ PASS      ║
║  Global Functionality: ✅ PASS     ║
║  ─────────────────────────────────  ║
║  STATUS:              ✅ WORKING   ║
╚════════════════════════════════════╝
```

**Ready for production!** 🚀

---

**Last Updated:** November 28, 2025
