# 🔥 RLS POLICY ERROR - QUICK FIX (5 MINUTES)

## Problem
```
Error: new row violates row-level security policy for table "instructors"
```

This means the RLS policy check is FAILING. The issue is that `auth.jwt() ->> 'role'` might not be working properly in the WITH CHECK clause.

---

## Solution: Use a Helper Function

Instead of checking JWT directly, we'll create a helper function that reads from the user's metadata in `auth.users` table.

### Step 1: Run New SQL (3 minutes)

Go to **Supabase Dashboard → SQL Editor**

Create a NEW query and paste this ENTIRE file:
```
/supabase/fix-rls-policies.sql
```

Click "RUN"

You should see:
```
Query succeeded. Showing 1 row.
Ultimate RLS fix applied! ✅
```

### Step 2: Refresh App (30 seconds)

1. Close app tab completely (Cmd+W on Mac)
2. Wait 5 seconds
3. Open new tab and login

### Step 3: Test Add Instructor (1 minute 30 seconds)

Try adding an instructor again. Should work now! ✅

---

## What Changed

**Before (Broken):**
```sql
CREATE POLICY admin_all ON instructors
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
```

**After (Fixed):**
```sql
-- Create helper function
CREATE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT (raw_user_meta_data ->> 'role')::text = 'admin'
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Use it in policy
CREATE POLICY instructors_admin_all ON instructors
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
```

**Why it works:**
- Reads from `auth.users` table directly (more reliable)
- Converts value to TEXT explicitly
- Function is more stable than JWT claim checking

---

## Timeline

| Step | Time |
|------|------|
| Copy SQL | 30 sec |
| Run SQL | 30 sec |
| Check results | 30 sec |
| Close/reopen app | 30 sec |
| Login | 1 min |
| Test form | 1 min |
| **TOTAL** | **~4 minutes** |

---

## If it Still Doesn't Work

Open browser console (F12) and run:

```javascript
// Check if user is actually marked as admin in metadata
const { data: { user } } = await supabase.auth.getUser();
console.log('User metadata:', user.user_metadata);
console.log('Should show: {"role": "admin"}');

// Test the is_admin function directly
const { data, error } = await supabase.rpc('is_admin');
console.log('is_admin() result:', data, error);
```

If `data` shows `false` or error, the metadata wasn't set properly.

Then run in Supabase SQL Editor:
```sql
-- Check what's in the metadata
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'admin@university.edu';
```

Should show: `{"role": "admin"}`

If not, update it:
```sql
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'::jsonb
)
WHERE email = 'admin@university.edu';
```

Then logout/login again.

---

## Success Indicator ✅

After running the SQL and refreshing:

```
✅ Auth Debug shows: role = admin (green)
✅ Add Instructor form submits without error
✅ Instructor appears in list
```

Go do it! 🚀
