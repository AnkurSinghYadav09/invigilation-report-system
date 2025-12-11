# Instructor Account Linking - Setup Guide

## Problem Fixed
Instructors can now see their assigned duties! This fix ensures that when an instructor signs up or logs in, their account is automatically linked to their instructor record in the database.

## Setup Steps

### Step 1: Run the Auto-Link Function (Required)
This creates the database function and trigger that automatically links accounts.

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Open the file: `supabase/link-instructor-accounts.sql`
4. Copy all the SQL code
5. Paste it into the SQL Editor
6. Click **Run** or press `Ctrl/Cmd + Enter`

**Expected Output:**
```
CREATE FUNCTION
CREATE TRIGGER
CREATE FUNCTION
COMMENT
COMMENT
```

### Step 2: Fix Existing Instructors (If Applicable)
If you already have instructors who have signed up but can't see their duties, run this migration.

1. In Supabase SQL Editor
2. Open the file: `supabase/fix-existing-instructors.sql`
3. Copy all the SQL code
4. Paste it into the SQL Editor
5. Click **Run**

**Expected Output:**
```
=== Starting instructor account linking ===
Total instructors in database: X

✅ Linked: Dr. John Smith (john@example.com) -> instructor_id: xxx-xxx-xxx
⚠️  No user account found for: Dr. Jane Doe (jane@example.com)
...

=== Migration Complete ===
Total instructors: X
Newly linked accounts: Y
```

The script will also show a verification table showing which instructors are linked.

### Step 3: Verify the Fix

#### Test 1: Create New Instructor
1. Login as admin
2. Go to **Admin → Instructors**
3. Click **+ Add New Instructor**
4. Fill in details (use a test email like `test.instructor@example.com`)
5. Click **Add Instructor**
6. You should see a success message explaining the linking process

#### Test 2: Instructor Signup & Login
1. Logout from admin
2. Sign up as a new user with the same email you used in Test 1
3. After signup, login with that account
4. You should see the instructor dashboard WITHOUT the "Instructor Profile Not Linked" warning

#### Test 3: Assign Duty and Verify
1. Login as admin
2. Go to **Admin → Duties**
3. Click **+ Assign Duty**
4. Select an exam, the test instructor, a room, and reporting time
5. Click **Assign Duty**
6. Logout and login as the test instructor
7. **You should now see the assigned duty in "Upcoming Duties"!** ✅

## How It Works

### For New Instructors
1. Admin creates instructor record in the system
2. Instructor signs up with the same email
3. **Database trigger automatically links the account** (sets `instructor_id` in user metadata)
4. Instructor can immediately see their duties

### For Existing Instructors
1. Run the `fix-existing-instructors.sql` migration
2. The script finds all instructors with matching user accounts
3. Updates user metadata to include `instructor_id`
4. Instructors need to **logout and login again** to refresh their session

### Row Level Security (RLS)
The database has security policies that check:
```sql
-- Instructors can only see their own duties
WHERE instructor_id::text = auth.jwt() ->> 'instructor_id'
```

This ensures:
- ✅ Instructors can only see duties assigned to them
- ✅ Instructors cannot see other instructors' duties
- ✅ Admins can see all duties

## Troubleshooting

### Issue: Instructor still can't see duties after signup
**Solution:**
1. Ask the instructor to logout and login again
2. If still not working, run the `fix-existing-instructors.sql` script
3. Check that the instructor's email in the system matches their signup email exactly

### Issue: "No instructor found for email" in migration
**Solution:**
This is normal! It means the instructor hasn't signed up yet. They need to:
1. Sign up using the email that was entered when creating their instructor record
2. The account will be automatically linked on signup

### Issue: Database function already exists error
**Solution:**
The SQL scripts use `CREATE OR REPLACE FUNCTION`, so they can be run multiple times safely. If you see an error about the trigger, you can ignore it - it means it's already set up.

## Manual Linking (Advanced)

If you need to manually link a specific instructor:

```sql
-- Replace with actual emails
SELECT manually_link_instructor(
  'user.email@example.com',      -- User's account email
  'instructor.email@example.com'  -- Instructor record email
);
```

This is useful if:
- An instructor signed up with a different email than their instructor record
- You need to link accounts that don't have matching emails

## Verification Query

To check the linking status of all instructors:

```sql
SELECT 
  i.name,
  i.email,
  CASE 
    WHEN u.id IS NOT NULL THEN '✅ Linked'
    ELSE '❌ Not Linked'
  END as status
FROM public.instructors i
LEFT JOIN auth.users u ON u.email = i.email
ORDER BY i.name;
```

## Next Steps for Instructors

After the fix is applied, instructors should:
1. **Logout and login again** (to refresh their session)
2. Check the dashboard - they should see "Welcome back!" without warnings
3. View their assigned duties in "Upcoming Duties" section
4. Mark arrival when the time comes

## Support

If you encounter any issues:
1. Check the browser console for errors (F12 → Console tab)
2. Check Supabase logs (Dashboard → Logs)
3. Verify the instructor's email matches exactly in both systems
4. Run the verification query to check linking status
