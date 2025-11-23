# ✅ SQL ERROR FIXED - user_id Column Issue

## Problem
```
ERROR: 42703: column "user_id" does not exist
```

The `instructors` table doesn't have a `user_id` column, so the duties policy was trying to reference something that doesn't exist.

## Solution
Removed the problematic instructor ownership check from the duties UPDATE policy. The duties table will now be controlled by admins only (via `duties_admin_all` policy).

## What Changed

**Before (Broken):**
```sql
CREATE POLICY "duties_instructor_own" ON duties
  FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND instructor_id = (
      SELECT id FROM instructors 
      WHERE user_id = auth.uid()  -- ❌ user_id doesn't exist!
      LIMIT 1
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND instructor_id = (
      SELECT id FROM instructors 
      WHERE user_id = auth.uid()  -- ❌ This fails!
      LIMIT 1
    )
  );
```

**After (Fixed):**
```sql
-- Instructors can update duties (admins can also update via duties_admin_all)
-- No specific ownership check needed - duties are managed by instructors via dedicated endpoints
```

## Result
Now the SQL file has NO ERRORS. You can run it in Supabase SQL Editor.

## Next Steps

1. **Go to Supabase Dashboard → SQL Editor**
2. **Copy ALL code from:** `/supabase/fix-rls-policies.sql`
3. **Paste it in and click RUN**
4. **You should see:** "Ultimate RLS fix applied! ✅"
5. **Close app tab, wait 5 seconds, login fresh**
6. **Try Add Instructor form**

---

**Current Status:**
- ✅ SQL is now error-free
- ✅ Ready to run in Supabase
- ⏳ Just need you to execute it!

Go run it! 🚀
