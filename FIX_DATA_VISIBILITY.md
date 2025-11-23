# 🔧 Complete Data Visibility Fix Guide

## Problem Summary
After submitting forms (Instructors, Exams, Rooms, Duties), the data doesn't appear in the list. This is usually caused by **Row Level Security (RLS) permission issues**.

## Root Cause
The database RLS policies check if the user has the `admin` role in their JWT claims, but this role isn't automatically set in user metadata. Without it, all INSERT/UPDATE/DELETE operations are blocked.

## Solution Overview

### Step 1: Update RLS Policies in Supabase
The policies have been improved to properly handle admin role checks.

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Create a new query
5. Copy and paste the entire contents of:
   ```
   supabase/fix-permissions-final.sql
   ```
6. Click **Run** and wait for completion

You should see:
```
RLS policies successfully fixed! ✅
```

### Step 2: Set User Roles in Supabase Auth

1. Go to **Authentication → Users**
2. Find your **admin user** (email: admin@university.edu)
3. Click the **three dots menu** → **Edit User**
4. Scroll down to **User Metadata**
5. Clear the existing metadata and paste:
   ```json
   {
     "role": "admin"
   }
   ```
6. Click **Save**

**Repeat for instructor users** (if needed), using:
```json
{
  "role": "instructor"
}
```

### Step 3: Verify in Your App

1. **Clear browser cache** (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. **Logout** of the app
3. **Login again** with your credentials
4. You should see the **Auth Debug** panel in the bottom-right

**Check the debug panel:**
- ✅ Role should show "admin" (in green)
- ✅ User Metadata should display `{"role": "admin"}`

If still NULL, click **"Run Full Debug"** and check browser console (F12) for detailed error messages.

### Step 4: Test the Forms

Now try adding data:

1. **Click "Instructors"** → **"+ Add New Instructor"**
   - Fill in: Name, Email, Department
   - Click **"Add Instructor"**
   - ✅ Should see success message and data appears below

2. **Click "Exams"** → **"+ Add New Exam"**
   - Fill in: Exam Name, Date, Start Time, End Time
   - Click **"Create Exam"**
   - ✅ Should appear in the list

3. **Click "Rooms"** → **"+ Add New Room"**
   - Fill in: Room Name, Building, Capacity
   - Click **"Add Room"**
   - ✅ Should appear in the grid

4. **Click "Duties"** → **"+ Assign Duty"**
   - Select Exam, Instructor, Room, Reporting Time
   - Click **"Create Assignment"**
   - ✅ Should appear in the table

## Troubleshooting

### Error: "permission denied for schema public"
**Solution:** 
- Make sure you ran the SQL script (`fix-permissions-final.sql`)
- Verify no policies are missing (check in Supabase: Auth → Policies)

### Error: "Failed to create [item]. Check permissions."
**Solution:**
- Check browser console (F12) for detailed error
- Click **"Run Full Debug"** in Auth Debug panel
- Verify user metadata has `"role": "admin"`
- Make sure you're logged in

### Role shows as "NULL" in debug panel
**Solution:**
1. Go to Supabase → Authentication → Users
2. Click your user → Edit
3. Add/update User Metadata: `{"role": "admin"}`
4. **Logout and login again** (important!)

### Data still not appearing after all steps
**Solution:**
1. Open browser **Console** (F12)
2. Look for red error messages starting with "Error creating..."
3. Copy the full error message
4. This reveals the exact RLS policy blocking the operation
5. Share this with the development team

## What Was Changed

### Code Updates:
✅ `src/lib/hooks/useInstructors.js` - Added detailed error logging
✅ `src/lib/hooks/useExamsRooms.js` - Added detailed error logging  
✅ `src/lib/hooks/useDuties.js` - Added detailed error logging
✅ `src/lib/utils/authDebug.js` - New debug utility (NEW)
✅ `src/components/AuthDebug.jsx` - Enhanced with full debug features

### Database Updates:
✅ `supabase/fix-permissions-final.sql` - New, improved RLS policies (NEW)

## Key Features of the Fix

1. **Separated READ and WRITE policies** - More granular control
2. **Added admin role checks** - Properly validates admin users
3. **Error alerts on form submission** - Shows what went wrong
4. **Console logging** - Every database operation is logged for debugging
5. **Auth Debug panel** - Shows current authentication state and JWT claims

## Next Steps After Fix

Once everything is working:

1. ✅ Add first instructor
2. ✅ Create an exam  
3. ✅ Add a room (optional, seed data may exist)
4. ✅ Assign a duty to an instructor
5. ✅ On exam day, click "Mark Arrival" to record attendance

## Need Help?

If you're still having issues:

1. **Check the Console:**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for error messages prefixed with "Error creating...", "Supabase insert error:", etc.

2. **Run Debug:**
   - Click "Run Full Debug" in the Auth Debug panel
   - Check console output carefully

3. **Verify Steps Completed:**
   - [ ] Ran SQL fix script
   - [ ] Set user metadata to `{"role": "admin"}`
   - [ ] Logged out and back in
   - [ ] Cleared browser cache
   - [ ] See green "admin" role in debug panel

4. **Last Resort:**
   - Delete the user from Supabase
   - Create a new user manually
   - Set metadata during creation
   - Test again

## Technical Details

### How RLS Works
- Every database operation checks if the user's JWT contains `role: "admin"`
- JWT claims come from User Metadata set in Supabase Auth
- Metadata updates require re-authentication (logout/login)

### Why We Need the Fix
- Original policies were incomplete (missing WITH CHECK clauses)
- New policies properly handle INSERT/UPDATE/DELETE operations
- Added read policies for instructors

### Why Error Messages Now Show
- All hooks now catch and display errors
- Alerts popup on form submission with the exact error
- Console logs every database operation with full details

---

**Last Updated:** 21 November 2025  
**Status:** All fixes implemented and documented ✅
