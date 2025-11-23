# ⚡ Quick Fix Checklist

## The Problem
Forms submit but data doesn't appear in lists.

## The Solution (5 Minutes)

### ✅ Step 1: Run SQL Script
```
1. Go to Supabase.com → Your Project → SQL Editor
2. Create New Query
3. Paste file: supabase/fix-permissions-final.sql
4. Click RUN
5. See message: "RLS policies successfully fixed! ✅"
```

### ✅ Step 2: Set User Role
```
1. Go to Supabase → Authentication → Users
2. Click your admin user (admin@university.edu)
3. Click Edit (three dots)
4. Find "User Metadata" section
5. Clear it, paste exactly:
   {
     "role": "admin"
   }
6. Click Save
```

### ✅ Step 3: Refresh App
```
1. Logout (click Logout button)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Login again with same credentials
4. Look at bottom-right corner
5. Auth Debug panel should show:
   - Role: admin (in GREEN)
   - User Metadata: {"role": "admin"}
```

### ✅ Step 4: Test
```
1. Go to Instructors → + Add New Instructor
2. Fill form, click "Add Instructor"
3. Data should appear below ✅

If it doesn't:
- Check browser Console (F12)
- Look for red error messages
- Click "Run Full Debug" in Auth Debug panel
- Share the error message
```

## What If It Still Doesn't Work?

1. **Open Console:** F12 → Console tab
2. **Look for errors:** Red text starting with "Error creating..."
3. **Click Debug:** "Run Full Debug" button in bottom-right
4. **Share errors:** Copy console output and contact support

## Files Changed
- ✅ `src/lib/hooks/*.js` - Better error messages
- ✅ `src/lib/utils/authDebug.js` - New debug tool
- ✅ `src/components/AuthDebug.jsx` - Better UI
- ✅ `supabase/fix-permissions-final.sql` - Fixed RLS policies
- ✅ `FIX_DATA_VISIBILITY.md` - Full guide

## Expected Result
After fixing:
- ✅ Add Instructor → See it in list immediately
- ✅ Create Exam → See it in list immediately
- ✅ Add Room → See it in grid immediately
- ✅ Assign Duty → See it in table immediately

---

**Questions?** Check `FIX_DATA_VISIBILITY.md` for detailed troubleshooting
