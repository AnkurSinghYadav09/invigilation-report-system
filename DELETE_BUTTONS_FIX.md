# 🗑️ Delete Buttons Fix Guide

## Issue
Delete buttons (for Duties, Instructors, Exams, Rooms, Users) are not working due to missing RLS policies and RPC functions.

## Root Causes
1. **Missing DELETE RLS Policies** - Database policies don't allow delete operations for any role
2. **Missing RPC Function** - `delete_user_account()` function doesn't exist for user deletion

## Solution

### Step 1: Run the Fix SQL Script

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy the entire content of `supabase/fix-delete-buttons-complete.sql`
3. Paste it into the SQL Editor
4. Click **"Run"** (Execute button)

Expected output:
```
✓ 5 DELETE policies created
✓ delete_user_account function created
✓ Verification queries return results
```

### Step 2: Verify the Fix

After running the script, you should see:

**DELETE Policies Created** (should show 5 policies):
```
✓ admin_delete_duties
✓ admin_delete_instructors
✓ admin_delete_exams
✓ admin_delete_rooms
✓ admin_delete_user_profiles
```

**RPC Function Created**:
```
✓ delete_user_account (function type: function)
```

### Step 3: Test Delete Buttons

1. Login as **admin@university.edu / admin123**
2. Navigate to any admin page:
   - **Duties** → Click "Delete" on a duty
   - **Instructors** → Click "Delete" on an instructor
   - **Exams** → Click "Delete" on an exam
   - **Rooms** → Click "Delete" on a room
   - **Users** → Click "Delete" on a user

3. Confirm deletion when prompted
4. Record should be deleted successfully

---

## Technical Details

### What Gets Fixed

#### 1. DELETE RLS Policies (Lines 1-24)
```sql
-- Allows admins to delete from any table
DROP POLICY IF EXISTS "admin_delete_duties" ON duties;
CREATE POLICY "admin_delete_duties" ON duties
  FOR DELETE
  USING ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin');

-- Same pattern for: instructors, exams, rooms, user_profiles
```

**Why needed**: 
- RLS blocks all operations by default
- These policies explicitly allow admins to delete

#### 2. RPC Function: `delete_user_account()` (Lines 27-56)
```sql
CREATE OR REPLACE FUNCTION delete_user_account(user_id uuid)
RETURNS json AS $$
BEGIN
  -- Check: Only admin can delete
  IF (auth.jwt() -> 'user_metadata' ->> 'role') != 'admin' THEN
    RAISE EXCEPTION 'Only admin can delete users';
  END IF;

  -- Delete from user_profiles first
  DELETE FROM user_profiles WHERE id = user_id;

  -- Delete from auth.users (cascades)
  DELETE FROM auth.users WHERE id = user_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Why needed**:
- Users exist in two places: `auth.users` (auth system) and `user_profiles` (app data)
- RPC function ensures both are deleted atomically
- Function checks admin role before allowing deletion

---

## FAQ

**Q: Will this affect my data?**
A: No. The script only adds policies and functions. Existing data is not modified.

**Q: Do I need to restart the app?**
A: No. Just refresh the browser after running the script.

**Q: What if I run the script multiple times?**
A: Safe. Script uses `DROP IF EXISTS`, so running it again won't cause errors.

**Q: Can instructors delete duties?**
A: No. Only admins can delete. Instructors can only view/update their own duties.

**Q: What gets deleted when I delete a user?**
A: Both `auth.users` entry and `user_profiles` entry are deleted.

**Q: What happens to duties assigned to a deleted instructor?**
A: Duties remain but instructor_id becomes NULL (orphaned). You should delete duties first if needed.

---

## If Delete Still Doesn't Work

### Step 1: Check Console Errors
1. Open DevTools (F12)
2. Try to delete a record
3. Check **Console** tab for error message
4. Screenshot and share the error

### Step 2: Verify Admin Role
Check that you're logged in as admin:

In browser console (F12 → Console tab), run:
```javascript
import { supabase } from '/src/lib/supabase.js';
const session = await supabase.auth.getSession();
console.log('Role:', session.data.session.user.user_metadata.role);
console.log('Is Admin:', session.data.session.user.user_metadata.role === 'admin');
```

Should output: `Is Admin: true`

If not admin, you need admin credentials.

### Step 3: Check RLS Policies
1. Supabase Dashboard → **Authentication** → **Policies**
2. Select a table (e.g., `duties`)
3. Look for policies named like `admin_delete_duties`
4. If not there, the SQL script didn't run successfully

### Step 4: Check RPC Function
1. Supabase Dashboard → **SQL Editor**
2. Run this query:
```sql
SELECT * FROM information_schema.routines 
WHERE routine_name = 'delete_user_account';
```

Should return 1 row. If returns 0 rows, function doesn't exist.

---

## Affected Files

The following files have delete buttons that will be fixed:

| Page | Delete What | Location |
|------|-----------|----------|
| **Duties** | Duty assignments | `/admin/duties` - Click "Delete" in table |
| **Instructors** | Instructor profiles | `/admin/instructors` - Click "Delete" in table |
| **Exams** | Exam records | `/admin/exams` - Click "Delete" in table |
| **Rooms** | Room records | `/admin/rooms` - Click "Delete" in table |
| **Users** | User accounts | `/admin/users` - Click "Delete" in table |

---

## Before & After

### Before Fix
```
Admin clicks Delete button
  ↓
JavaScript calls supabase.from('duties').delete()
  ↓
RLS blocks operation (no DELETE policy)
  ↓
Error: "new row violates row-level security policy"
  ↓
Delete fails, nothing happens
```

### After Fix
```
Admin clicks Delete button
  ↓
JavaScript calls supabase.from('duties').delete()
  ↓
RLS checks: Is user admin? YES ✓
  ↓
RLS allows DELETE operation
  ↓
Record deleted successfully
  ↓
Success! Page refreshes with updated list
```

---

## One-Time Setup

This fix should be run **once per Supabase project**.

- ✅ Run after initial `SETUP_ONCE.sql`
- ✅ Safe to run multiple times (uses DROP IF EXISTS)
- ✅ Persists permanently in database
- ❌ Not needed on every deploy
- ❌ Not needed for each user

---

## Summary

**To fix delete buttons:**

1. Copy `supabase/fix-delete-buttons-complete.sql`
2. Paste into Supabase SQL Editor
3. Click Run
4. Refresh your app
5. Delete buttons now work ✅

**Time needed**: ~1 minute

**Status after fix**: All delete buttons fully functional for admin users

---

**Last Updated**: November 23, 2025
