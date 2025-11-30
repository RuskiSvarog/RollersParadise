# 🔒 ADMIN ERROR REPORTS ACCESS

## PRIVATE - Owner Only

This document explains how to access the admin error reports panel.

---

## 🔐 Admin Password

**Current Password:** `RollersParadise2024Admin!`

⚠️ **IMPORTANT:** To change the password, edit line 19 in `/components/AdminErrorReports.tsx`

---

## 🎯 How to Access

### Method 1: URL Parameter
Add this to your URL:
```
?admin-reports=true
```
Example: `https://yoursite.com?admin-reports=true`

### Method 2: Keyboard Shortcut
Press: **Ctrl + Shift + Alt + R**

---

## 📥 Features

Once logged in as admin, you can:

✅ **View All Error Reports**
- See all user-submitted error reports
- Filter by resolved/unresolved status
- View user descriptions and contact info
- Read full stack traces

✅ **Download Reports**
- Click "Download" button
- Gets a `.txt` file with all reports
- Formatted and ready to share with AI assistant
- Includes summary statistics

✅ **Refresh Data**
- Click "Refresh" to get latest reports
- Automatically fetches from database

---

## 🤖 How to Use with AI

1. Open admin panel (using methods above)
2. Enter password: `RollersParadise2024Admin!`
3. Click "Download" button
4. Open the downloaded `.txt` file
5. Copy and paste the contents into chat with AI
6. AI will analyze and fix the bugs!

---

## 🔒 Security Features

✅ Password protected - only you have access
✅ Completely hidden from regular users
✅ No visible buttons or hints in the UI
✅ Must know secret keyboard shortcut or URL parameter
✅ Admin mode clearly indicated when active

---

## 📝 What Gets Reported

Users can report errors which include:
- Error code and message
- What they were doing (user description)
- Contact email (optional)
- Full stack traces
- Browser and device info
- Page URL and timestamp

---

## ⚙️ System Details

- Reports stored in Supabase `error_reports` table
- Fetched via backend endpoint
- Limit: 100 most recent reports
- Download format: Plain text file
- File naming: `error-reports-YYYY-MM-DD.txt`

---

**Last Updated:** November 29, 2025
