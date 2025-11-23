# 🎯 QUICK REFERENCE CARD

## The Fix in 30 Seconds

**Problem:** Forms submit but data doesn't appear

**Solution:** 3 simple steps

```
1. Run SQL script in Supabase
2. Set user role in Supabase Auth
3. Logout & login in your app
```

**Result:** Forms work! ✅

---

## ⚠️ SQL Error Fix (If You Get It)

**Error:** `operator does not exist: uuid = text`

**Solution:** The script has been updated with UUID type casting. Just run it again!

→ See `SQL_ERROR_FIX.md` for details

---

## Step-by-Step (5 Minutes)

### STEP 1: SQL Script (1 minute)
```
1. Supabase.com → Your Project → SQL Editor
2. Create New Query
3. Copy-paste entire file: supabase/fix-permissions-final.sql
4. Click RUN
5. Wait for: "RLS policies successfully fixed! ✅"
```

### STEP 2: User Metadata (1 minute)
```
1. Supabase → Authentication → Users
2. Click your admin user
3. Click Edit (three dots)
4. Find "User Metadata" section
5. Clear it and paste exactly:
   {
     "role": "admin"
   }
6. Click Save
```

### STEP 3: Refresh App (3 minutes)
```
1. App → Click Logout
2. Clear cache: Ctrl+Shift+Delete (Windows/Linux)
           or Cmd+Shift+Delete (Mac)
3. Login again
4. Look bottom-right: Auth Debug panel
5. Should show: Role = "admin" (GREEN box)
6. Try adding an Instructor
7. ✅ Should succeed immediately
```

---

## What You'll See

### ✅ SUCCESS
```
Form filled → Click "Add Instructor"
    ↓
Form closes
    ↓
Data appears in list below
    ↓
No error alert
```

### ❌ FAILED
```
Form filled → Click "Add Instructor"
    ↓
Red error alert pops up
    ↓
Shows error message
    ↓
Check browser Console (F12)
    ↓
Look for red error text
```

---

## Troubleshooting

### Problem: Role shows NULL or YELLOW
**Solution:** 
- Go back to Supabase Users
- Update metadata again
- Click Save
- Logout completely
- Login again
- Refresh page (F5)

### Problem: Still getting error
**Solution:**
1. Press F12 (Developer Tools)
2. Go to Console tab
3. Look for red error text
4. Note the exact message
5. Check QUICK_FIX.md or ask for help

### Problem: Data still doesn't appear
**Solution:**
1. Press F5 to refresh page
2. Check if data appears
3. If yes → page cache issue, try again
4. If no → check console for errors

---

## Key Files

### To Understand (Read These)
```
QUICK_FIX.md ← Start here
VISUAL_GUIDE.md ← If you like pictures
FIX_DATA_VISIBILITY.md ← For details
```

### To Apply (Use These)
```
supabase/fix-permissions-final.sql ← Paste in Supabase
(Copy entire file, paste in SQL Editor)
```

### To Debug (Use These)
```
Browser Console (F12) ← Look for error messages
Auth Debug Panel ← Bottom-right corner of app
"Run Full Debug" button ← Click to diagnose
```

---

## Files Changed

### Code (Already Updated ✅)
```
src/lib/hooks/useInstructors.js
src/lib/hooks/useExamsRooms.js
src/lib/hooks/useDuties.js
src/components/AuthDebug.jsx
src/lib/utils/authDebug.js (NEW)
```

### Database (You Must Run)
```
supabase/fix-permissions-final.sql (NEW)
← Must run in Supabase SQL Editor
```

### Documentation (For Reference)
```
QUICK_FIX.md
VISUAL_GUIDE.md
FIX_DATA_VISIBILITY.md
PERMISSION_FLOW.md
CHANGES_SUMMARY.md
SOLUTION_INDEX.md
IMPLEMENTATION_SUMMARY.md
```

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "permission denied for schema public" | RLS policy issue | Run SQL script again |
| "Failed to create instructor. Check permissions." | Role not set | Update user metadata |
| Role shows NULL | JWT not refreshed | Logout/Login again |
| Data doesn't appear | Page not refreshed | Refresh page (F5) |
| Form submits but nothing happens | Silent failure | Check browser Console (F12) |

---

## Checklist Before Testing

- [ ] Ran SQL script successfully
- [ ] User metadata set to {"role": "admin"}
- [ ] Logged out completely
- [ ] Cleared browser cache
- [ ] Logged back in
- [ ] Auth Debug panel visible (bottom-right)
- [ ] Role shows "admin" in green box

If all checked → Ready to test! ✅

---

## Testing Forms

### Test 1: Add Instructor
```
Click Instructors
Click "+ Add New Instructor"
Fill: Name, Email, Department
Click "Add Instructor"
Expected: No error, data appears below
```

### Test 2: Create Exam
```
Click Exams
Click "+ Add New Exam"
Fill: Name, Date, Time
Click "Create Exam"
Expected: No error, data appears below
```

### Test 3: Add Room
```
Click Rooms
Click "+ Add New Room"
Fill: Name, Building, Capacity
Click "Add Room"
Expected: No error, data appears in grid
```

### Test 4: Assign Duty
```
Click Duties
Click "+ Assign Duty"
Select: Exam, Instructor, Room, Time
Click "Create Assignment"
Expected: No error, data appears in table
```

---

## Success Indicators

You'll know it's working when:
- [ ] No error alerts on form submit
- [ ] Data appears immediately after submit
- [ ] Console has success messages (not errors)
- [ ] Auth Debug shows Role = "admin" (green)
- [ ] All 4 test forms succeed

---

## Emergency Debug

If things go wrong:

```
1. Open browser Console: F12
2. Look at bottom-right: Click "Run Full Debug"
3. Read console output carefully
4. Look for error messages
5. Check error against troubleshooting guide
6. If stuck: Share console output with team
```

---

## After Fix Works

Once everything is working:

1. ✅ Database has RLS policies fixed
2. ✅ Users can see their role properly
3. ✅ Forms now submit successfully
4. ✅ Data appears in lists immediately
5. ✅ Users see error alerts if issues occur

You're done! 🎉

---

## Need Help?

### Quick questions?
→ Check QUICK_FIX.md

### Visual learner?
→ Check VISUAL_GUIDE.md

### Want details?
→ Check FIX_DATA_VISIBILITY.md

### Technical questions?
→ Check PERMISSION_FLOW.md

### What changed?
→ Check CHANGES_SUMMARY.md

### Getting started?
→ Check IMPLEMENTATION_SUMMARY.md

### Master index?
→ Check SOLUTION_INDEX.md

---

## Time Estimate

```
SQL Script:        1 minute
User Metadata:     1 minute
Test & Verify:     3 minutes
                   ─────────
TOTAL:             5 minutes ✅
```

---

**🚀 Ready? Start with STEP 1 above!**

**Stuck? Press F12, click "Run Full Debug", read console output.**

**Last Updated: 21 November 2025**
