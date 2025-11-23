# 🔴 JWT Shows Admin but RLS Still Blocks - Root Cause Analysis

## The Problem
✅ Auth Debug shows `role: admin`
❌ But INSERT still fails with RLS violation
❌ This means the JWT `role` claim is NOT actually being sent to the database

## Root Cause
The issue is **JWT claim vs metadata mismatch**:
- Your **Zustand store** shows admin correctly 
- But the actual **JWT token sent to Supabase** doesn't have the role claim
- Supabase RLS only checks the actual JWT, not the store

## The Real Solution

You need to do ONE of these:

### Option A: Complete Session Refresh (Recommended - 2 minutes)

This forces Supabase to issue a NEW JWT with the role claim:

1. **Complete logout:**
   ```javascript
   // In browser console while logged in:
   await supabase.auth.signOut({ scope: 'local' });
   ```

2. **Clear ALL browser storage:**
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```

3. **Close browser completely** - not just tab, close entire window

4. **Open browser fresh** - new window, new tab

5. **Login again** - this gets NEW JWT with role claim

6. **Test form** - should work

### Option B: Check if role is even in JWT (Debugging)

In browser console, run:

```javascript
// Get current JWT
const { data: { session } } = await supabase.auth.getSession();
const token = session.access_token;

// Decode it
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));

console.log('Full JWT payload:', payload);
console.log('Role in JWT:', payload.role);
console.log('App metadata:', payload.app_metadata);
```

Look for `role` in the output. If it's NOT there, the problem is confirmed.

### Option C: Use Simpler RLS Policy (Temporary)

If you want to test without the role claim, run this SQL to allow authenticated users:

```sql
-- Temporarily allow all authenticated users (testing only)
ALTER TABLE instructors DISABLE ROW LEVEL SECURITY;
ALTER TABLE exams DISABLE ROW LEVEL SECURITY;
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE duties DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache DISABLE ROW LEVEL SECURITY;

-- Re-enable with simple policies
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE duties ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to do everything
CREATE POLICY "all_authenticated" ON instructors FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "all_authenticated" ON exams FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "all_authenticated" ON rooms FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "all_authenticated" ON duties FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "all_authenticated" ON analytics_cache FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
```

This lets you test if it's an RLS issue vs JWT issue.

---

## What You Should Do Right Now

### Step 1: Debug the JWT (2 minutes)
1. Open your app
2. Press F12 (console)
3. Run the Option B JavaScript code above
4. Tell me if `payload.role` shows `admin` or `undefined`

### Step 2: Complete Session Refresh (3 minutes)
If role is missing from JWT:
1. Run the logout code in console
2. Close browser completely
3. Open new browser window
4. Login fresh
5. Run JWT debug again to confirm role is now in JWT
6. Try Add Instructor

### Step 3: If Still Broken
Run Option C SQL (temporary permissive policy) to confirm RLS is the issue

---

## Expected Behavior After Fix

```
Before:
- Auth Debug shows admin
- Form submit → 403 RLS error
- JWT missing role claim

After:
- Auth Debug shows admin
- JWT has role: "admin"
- Form submit → Success! ✅
- Data appears in list
```

---

## Timeline
- Debug: 2 minutes
- Complete logout/browser close: 3 minutes  
- Test form: 1 minute
- **Total: 6 minutes**

Try Option A (complete session refresh) first - that's usually the fix! 🚀
