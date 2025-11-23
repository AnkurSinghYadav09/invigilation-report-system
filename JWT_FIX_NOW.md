# 🚨 JWT IS CORRECT BUT RLS STILL BLOCKING - QUICK FIX

## Status Check ✅
Your JWT shows `role: admin` - that's CORRECT!

But RLS is still blocking inserts with 403 error.

**Root cause:** The RLS policy evaluation order or the way we're checking the JWT claim.

---

## QUICK TEST: Check if this is RLS blocking

Open browser console (F12) and run:

```javascript
// Get current session
const { data: { session } } = await supabase.auth.getSession();

// Decode JWT
const parts = session.access_token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('JWT Claims:', payload);
console.log('Role in JWT:', payload.role);
```

You should see:
```
JWT Claims: {
  ...
  role: "admin",
  ...
}
Role in JWT: "admin"
```

If this shows `role: "admin"`, then the problem is in how the RLS policy is being evaluated.

---

## SOLUTION: Update RLS Policies

### Option 1: Quick Fix (Simplest) ⚡

Go to **Supabase Dashboard → SQL Editor** and run:

```sql
-- FILE: fix-rls-admin-only.sql
```

Copy ALL the SQL from: `/supabase/fix-rls-admin-only.sql`

Paste it in Supabase SQL Editor and click "RUN"

This will:
1. Drop all old policies
2. Create simplified new policies
3. Enable RLS again

### Option 2: Manual Debug (If Option 1 doesn't work)

If adding instructor still fails after running Option 1 SQL:

1. Open browser console (F12)
2. Try this test query:

```javascript
// Test if we can insert
const { data, error } = await supabase
  .from('instructors')
  .insert([
    {
      name: 'Test Instructor',
      email: 'test@example.com',
      department: 'CS',
      phone: '1234567890'
    }
  ])
  .select();

console.log('Insert result:', { data, error });

// If error shows 403 or RLS violation, log the full error:
if (error) {
  console.error('Full error:', error);
  console.error('Error code:', error.code);
  console.error('Error message:', error.message);
}
```

This will tell us exactly what the RLS policy is rejecting.

---

## WHAT TO DO RIGHT NOW

### Step 1: Run the SQL Fix
1. Go to Supabase Dashboard
2. Go to SQL Editor
3. Create new query
4. Paste all SQL from `/supabase/fix-rls-admin-only.sql`
5. Click "RUN"
6. Should show: "RLS policies applied successfully! ✅"

### Step 2: Refresh App
1. Close app completely (Cmd+W on Mac)
2. Wait 5 seconds
3. Open new tab, login fresh
4. Try adding instructor again

### Step 3: If Still Broken
1. Open console (F12)
2. Run the JavaScript test above
3. Share the error output

---

## Why This Happens

The RLS policies check `auth.jwt() ->> 'role'` which should work, but sometimes:

1. **Policy evaluation order** - Different policies evaluated differently
2. **JWT claim format** - Role might be nested differently than expected
3. **Cache issue** - Old policy still in effect despite update

Our new SQL script handles this by:
- Dropping ALL policies first (no conflicts)
- Using simpler policy names
- Using `FOR ALL` instead of separate SELECT/INSERT/UPDATE
- Explicitly flushing the old policies

---

## Expected Result After Fix

```
Before:
❌ Add Instructor → 403 Error (RLS blocked)
❌ Console shows: "Failed to load resource: 403"

After:
✅ Add Instructor → Success! Data appears in list
✅ Console shows: "Creating instructor: Object" and no error
```

---

## Timeline

- **SQL fix:** 1 minute
- **App refresh:** 30 seconds
- **Test form:** 30 seconds
- **Total:** 2 minutes

Let me know the result! 🚀
