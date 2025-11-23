# 📸 Step-by-Step Visual Guide

## Phase 1: Run SQL Script in Supabase

### Step 1A: Open Supabase Dashboard
```
1. Go to https://app.supabase.com
2. Click your project
3. Left sidebar → SQL Editor
```

### Step 1B: Create New Query
```
Click "New Query" button (or paste in empty editor)
```

### Step 1C: Copy SQL Script
```
Open this file in your editor:
  supabase/fix-permissions-final.sql

Copy ALL the content (Ctrl+A, Ctrl+C)
```

### Step 1D: Paste and Run
```
1. Paste into Supabase SQL Editor (Ctrl+V)
2. Click "RUN" button (blue button, top-right)
3. Wait for completion...

Expected output:
┌─────────────────────────────────────────┐
│ "RLS policies successfully fixed! ✅"    │
└─────────────────────────────────────────┘
```

---

## Phase 2: Set User Role in Supabase Auth

### Step 2A: Go to Authentication
```
Supabase Dashboard → Left sidebar → Authentication
```

### Step 2B: Open Users List
```
Click "Users" section
Find your admin user (admin@university.edu)
```

### Step 2C: Edit User Metadata
```
1. Click the three dots (•••) next to your user
2. Click "Edit user"
3. Scroll down to "User Metadata"
4. See the input field
```

### Step 2D: Update Metadata
```
In the "User Metadata" field:

OLD (or empty):
(leave it alone if it's already there)

NEW (paste exactly):
{
  "role": "admin"
}

✅ Important: Use curly braces { }
✅ Important: Include the quotation marks
```

### Step 2E: Save Changes
```
Click "Save" button (bottom-right of modal)
Wait for confirmation
```

---

## Phase 3: Test the Fix in Your App

### Step 3A: Logout
```
1. Go to your app (http://localhost:5173)
2. Click "Logout" button (top-right navbar)
3. Confirm you see Login page
```

### Step 3B: Clear Browser Cache
```
Windows/Linux: Ctrl + Shift + Delete
Mac: Cmd + Shift + Delete

Select "All time"
Check: Cookies and cached files
Click "Clear data"
```

### Step 3C: Login Again
```
Email: admin@university.edu
Password: password

Click "Sign In"
```

### Step 3D: Check Auth Panel
```
After login, look at bottom-right corner:

You should see a red box labeled:
┌──────────────────────────┐
│ 🔧 Auth Debug Info       │
│                          │
│ Email: admin@uni...      │
│ Role (from store): admin │  ← Should be GREEN
│ Instructor ID: NULL      │
│                          │
│ [Run Full Debug]         │
└──────────────────────────┘

If Role is GREEN with "admin" → ✅ Success!
If Role is YELLOW or NULL → Continue to troubleshooting
```

---

## Phase 4: Test Adding Data

### Step 4A: Go to Instructors
```
1. Click "Instructors" in navbar
2. See the "Instructor Management" page
3. Click "+ Add New Instructor" button
```

### Step 4B: Fill the Form
```
Form appears with fields:
┌─────────────────────────────────────┐
│ Add New Instructor                  │
├─────────────────────────────────────┤
│ Full Name *                         │
│ [________________________]           │
│  e.g., Dr. John Smith              │
│                                    │
│ Email *                            │
│ [________________________]          │
│  e.g., john@university.edu         │
│                                    │
│ Department *                       │
│ [Computer Science ▼]               │
│  (dropdown menu)                   │
│                                    │
│ Phone Number                       │
│ [________________________]          │
│                                    │
│ [Add Instructor]  [Cancel]        │
└─────────────────────────────────────┘

Example values:
  Name: Dr. Alice Johnson
  Email: alice@university.edu
  Department: Computer Science
  Phone: +1 234 567 8900
```

### Step 4C: Submit Form
```
Click "Add Instructor" button
```

### Step 4D: Check Result

#### ✅ SUCCESS
```
Form disappears
Below the form area, you see:

┌──────────────────────────────────────────┐
│ All Instructors                          │
├──────────────────────────────────────────┤
│ Name          │ Email        │ Actions  │
├───────────────┼──────────────┼──────────┤
│ Dr. Alice ... │ alice@uni... │ Edit Del │
└──────────────────────────────────────────┘

✅ Data appears immediately!
✅ Form cleared and ready for next entry
```

#### ❌ FAILED
```
Error alert appears:

┌─────────────────────────────────────┐
│ Error: [some error message]         │
│                                     │
│  [OK]                              │
└─────────────────────────────────────┘

Actions:
1. Note the error message
2. Open browser Console (F12)
3. Look for red error text
4. Check troubleshooting guide
```

---

## Phase 5: Test Other Forms (if needed)

### Create an Exam
```
Click "Exams" → "+ Add New Exam"
Fill in:
  - Exam Name: "Mid-Term CS101"
  - Date: Pick today or tomorrow
  - Start Time: 10:00
  - End Time: 12:00
Click "Create Exam"
✅ Should appear in list
```

### Add a Room
```
Click "Rooms" → "+ Add New Room"
Fill in:
  - Room Name: "Room 101"
  - Building: "Science Building"
  - Capacity: 50
Click "Add Room"
✅ Should appear in grid
```

### Assign a Duty
```
Click "Duties" → "+ Assign Duty"
Select:
  - Exam: (pick one created above)
  - Instructor: (pick one created above)
  - Room: (pick one created above)
  - Reporting Time: 09:30
Click "Create Assignment"
✅ Should appear in table
```

---

## Troubleshooting Flow

### If Role Still Shows as "NULL" or YELLOW

```
1. Go back to Supabase → Authentication → Users
2. Click your user again
3. Check User Metadata
   - Should show: {"role": "admin"}
   - If empty: Copy and paste it again
4. Save
5. In app: Logout completely
6. Clear cache again: Ctrl+Shift+Delete
7. Login again
8. Check Auth Debug panel again
9. Refresh page (F5)
```

### If Form Still Fails

```
1. Open browser Console (F12)
2. Look for red text errors
3. Note the exact error message
4. Click "Run Full Debug" in Auth Debug panel
5. Check console output again
6. Common errors:
   - "permission denied" → Role not set correctly
   - "23505 duplicate key" → Email already exists
   - "null" → Required field missing in form
```

### If Data Doesn't Appear

```
1. Check if error alert appeared (check for it)
2. Refresh page (F5)
3. Check if data appears after refresh
   - If yes → Page cache issue, might work next time
   - If no → Check console for errors
4. Try with different data
5. Check browser console for any errors
```

---

## Expected vs Actual

### ✅ EXPECTED (Working Correctly)
```
Admin user login:
  └─ Role: admin ✅
  └─ Add Instructor → Success ✅
  └─ Add Exam → Success ✅
  └─ Add Room → Success ✅
  └─ Assign Duty → Success ✅

Data appears in lists immediately ✅
No error alerts ✅
Console shows success messages ✅
```

### ❌ ACTUAL (Before Fix)
```
Admin user login:
  └─ Role: admin (but JWT has no role)
  └─ Add Instructor → Failed silently ❌
  └─ No error alert ❌
  └─ No data appears ❌
  └─ Console shows "permission denied" ❌
```

---

## Verification Checklist

```
□ SQL script executed successfully
□ No errors during SQL execution
□ User metadata set to {"role": "admin"}
□ Logout → Login completed
□ Browser cache cleared
□ Auth Debug panel shows:
  □ Role = "admin" (in green)
  □ User Metadata displays correctly
□ Add Instructor test:
  □ Form filled correctly
  □ No error alert appears
  □ Data visible in list immediately
  □ Console shows success logs
□ Add Exam test:
  □ Form filled correctly
  □ Data visible in list immediately
□ Add Room test:
  □ Form filled correctly
  □ Data visible in grid immediately
□ All working as expected ✅
```

---

## Quick Reference: What Should Happen

| Action | Before Fix | After Fix |
|--------|-----------|-----------|
| Submit form | No visible feedback | Success or error shown |
| Data appears | ❌ Never | ✅ Immediately |
| Error exists | ❌ Silent (console only) | ✅ Alert + console |
| Role shows | ❌ NULL or blank | ✅ admin (green) |
| Debugging | Difficult | Easy (Run Full Debug) |

---

**If you get stuck: Open browser Console (F12) and share the red error messages!**
