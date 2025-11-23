# 🔧 SQL Error Fix

## Error Encountered
```
ERROR: 42883: operator does not exist: uuid = text
HINT: No operator matches the given name and argument types. 
You might need to add explicit type casts.
```

## Root Cause
The RLS policy was comparing a UUID column (`instructor_id`) with a TEXT value from JWT claims (`auth.jwt() ->> 'instructor_id'`).

In PostgreSQL, you cannot directly compare UUID with TEXT - they must be the same type.

## Solution Applied ✅

### What Was Fixed
**Before (Error):**
```sql
instructor_id = auth.jwt() ->> 'instructor_id'
-- instructor_id is UUID
-- auth.jwt() ->> 'instructor_id' is TEXT
-- ❌ Incompatible types!
```

**After (Fixed):**
```sql
instructor_id = (auth.jwt() ->> 'instructor_id')::uuid
-- Cast TEXT to UUID using ::uuid
-- ✅ Now both are UUID type
```

### File Updated
- `supabase/fix-permissions-final.sql` (Line 128, 132)

### Affected Policy
- `instructors_update_own_duties` on duties table

---

## What to Do Now

### ✅ Step 1: Re-run the SQL Script
The script has been fixed. Now run it again:

```
1. Go to Supabase → SQL Editor
2. Click "New Query"
3. Copy-paste entire: supabase/fix-permissions-final.sql
4. Click RUN
5. Should see: "RLS policies successfully fixed! ✅"
```

### ✅ Step 2: No Other Changes Needed
Continue with the rest of the fix:
1. Set user metadata: `{"role": "admin"}`
2. Logout & login
3. Test the forms

---

## Why This Error Occurred

PostgreSQL is strict about type matching:

```
✅ VALID:
  uuid_column = uuid_value
  text_column = text_value
  
❌ INVALID:
  uuid_column = text_value (without casting)
  
✅ VALID WITH CAST:
  uuid_column = text_value::uuid (explicit cast)
```

The `::uuid` syntax tells PostgreSQL to convert TEXT to UUID before comparing.

---

## Verification

After running the fixed script, you should see:

```
RLS policies successfully fixed! ✅
```

And at the bottom, a table showing all policies with no errors.

---

## If Error Persists

If you still get an error after running the fixed script:

1. **Check you're copying the ENTIRE file**
   - Make sure you copied from line 1 to the end
   - Don't include any partial sections

2. **Clear the SQL Editor**
   - Click "New Query" to get a fresh editor
   - Don't try to modify existing query

3. **Verify the Cast Syntax**
   - Look for: `::uuid` in the policy
   - Should appear twice in the policy

4. **Copy from Updated File**
   - Make sure you're copying from the updated file
   - The file has been fixed with `::uuid` cast

---

## Technical Explanation (Optional)

### PostgreSQL Type System

PostgreSQL has strict typing. When you use `auth.jwt() ->> 'field'`, it returns TEXT regardless of what you store.

```sql
-- This ALWAYS returns TEXT
auth.jwt() ->> 'instructor_id'

-- To use it in UUID comparison, must cast:
(auth.jwt() ->> 'instructor_id')::uuid
```

### UUID Casting Rules

```sql
-- Valid UUID cast examples:
'550e8400-e29b-41d4-a716-446655440000'::uuid
-- Converts from TEXT to UUID

-- Invalid (wrong format):
'not-a-uuid'::uuid
-- ❌ Error: invalid input syntax for type uuid
```

### Why This Matters for Duties Policy

The duties table has:
```sql
instructor_id UUID REFERENCES instructors(id)
```

The RLS policy checks:
```sql
instructor_id = (auth.jwt() ->> 'instructor_id')::uuid
```

This allows instructors to update only their own duties:
- Gets the instructor_id from JWT (must cast TEXT → UUID)
- Compares with the duty's instructor_id (UUID)
- Only allows if they match

---

## Summary

✅ **Error:** UUID = TEXT type mismatch
✅ **Fix:** Added `::uuid` cast to TEXT value
✅ **File:** Updated `supabase/fix-permissions-final.sql`
✅ **Status:** Ready to re-run

**Next:** Run the updated SQL script in Supabase!

---

## Need Help?

- **Script still fails?** → Make sure you copied the ENTIRE file
- **Don't see success message?** → Check if there are other errors in output
- **Need to verify fix?** → Look for `::uuid` in the policy text

---

**Last Updated:** 21 November 2025
**Status:** Fixed and Ready ✅
