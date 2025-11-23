# 🔐 Permission Flow Diagram

## How Data Operations Work Now

```
┌─────────────────────────────────────────────────────────┐
│                    USER FILLS FORM                       │
│              (e.g., Add Instructor)                      │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              handleSubmit() triggered                    │
│        (InstructorsManagement.jsx)                       │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│            createInstructor() hook called               │
│        (useInstructors.js)                              │
│                                                          │
│  ✅ Logs: "Creating instructor: {data}"                │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│         Supabase Auth: Get current session              │
│         Extract JWT token from session                 │
│                                                          │
│    JWT Payload contains:                               │
│    - role: "admin"  ← From User Metadata                │
│    - email: "admin@university.edu"                      │
│    - instructor_id: (if applicable)                     │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│    Supabase.from('instructors').insert([data])         │
│                                                          │
│    ✅ Logs: "Supabase insert query sent"               │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│          DATABASE: RLS POLICY CHECK                     │
│                                                          │
│  Policy: "admin_instructors_insert"                    │
│  Checks: auth.jwt() ->> 'role' = 'admin'              │
│                                                          │
│  Is user role = 'admin'?                               │
└──────────────────────┬──────────────────────────────────┘
                       │
            ┌──────────┴──────────┐
            │                     │
            ▼                     ▼
      ✅ YES (PASS)         ❌ NO (FAIL)
            │                     │
            │                     ▼
            │        ┌──────────────────────────┐
            │        │ Error: "permission       │
            │        │ denied for schema public"│
            │        └──────────────────────────┘
            │                     │
            ▼                     ▼
    ┌───────────────┐    ┌──────────────────┐
    │ INSERT DATA   │    │ Return Error     │
    │ INTO TABLE    │    │                  │
    └───────┬───────┘    │ ✅ Logs:         │
            │            │ "Supabase        │
            │            │  insert error:"  │
            │            └──────────────────┘
            │                     │
            ▼                     ▼
    ┌─────────────────────────────────────────┐
    │ Trigger: update_analytics_cache()       │
    │ Updates instructor stats automatically  │
    └─────────────────────────────────────────┘
            │                     │
            ▼                     ▼
    ┌─────────────────┐   ┌──────────────────┐
    │ Success!        │   │ Catch error()    │
    │                 │   │                  │
    │ ✅ Logs:        │   │ ✅ Show alert:   │
    │ "Instructor     │   │ "Error: [reason]"│
    │  created        │   │                  │
    │  successfully"  │   │ ✅ Logs:         │
    └────────┬────────┘   │ "Error creating  │
             │            │  instructor: ..." │
             │            └──────────────────┘
             │                     │
             ▼                     ▼
    ┌────────────────────────────────────────┐
    │ await fetchInstructors()                │
    │ Re-query database for updated list      │
    └────────────┬─────────────────────────────┘
                 │
                 ▼
    ┌────────────────────────────────────────┐
    │ return { success: true }                │
    │ OR                                      │
    │ return { success: false, error: "..." } │
    └────────────┬─────────────────────────────┘
                 │
                 ▼
    ┌────────────────────────────────────────┐
    │ Page component receives response        │
    │                                          │
    │ If success:                            │
    │  - Close form                          │
    │  - Show new data in list               │
    │                                          │
    │ If failed:                             │
    │  - Alert already shown to user         │
    │  - Console has error details           │
    └────────────────────────────────────────┘
```

## Role Check Breakdown

### ✅ BEFORE USER METADATA FIX
```
User logs in → JWT created → No role in JWT
              ↓
Query runs → RLS checks for role='admin'
           ↓
           ❌ NO role found → DENIED
```

### ✅ AFTER USER METADATA FIX
```
User logs in → User Metadata has {"role": "admin"}
            ↓
JWT created with role: "admin"
            ↓
Query runs → RLS checks for role='admin'
           ↓
           ✅ role='admin' found → ALLOWED
```

## Error Flow

```
Form submitted
    ↓
If RLS policy FAILS:
    ├─ Supabase returns error
    ├─ Catch block logs: "Supabase [operation] error: {details}"
    ├─ Alert shows to user: "Error: {message}"
    ├─ Console shows full error with hints
    └─ Return { success: false, error: "..." }

If RLS policy PASSES but other error:
    ├─ Database executes successfully
    ├─ Trigger runs to update stats
    └─ Return { success: true }
```

## JWT Payload Example

### ❌ BROKEN (No role)
```json
{
  "sub": "user-id-123",
  "email": "admin@university.edu",
  "email_verified": true,
  "iss": "https://xxxx.supabase.co/auth/v1",
  "aud": "authenticated",
  "iat": 1700598400,
  "exp": 1700684800
}
```

### ✅ FIXED (Has role)
```json
{
  "sub": "user-id-123",
  "email": "admin@university.edu",
  "email_verified": true,
  "iss": "https://xxxx.supabase.co/auth/v1",
  "aud": "authenticated",
  "role": "admin",
  "instructor_id": null,
  "iat": 1700598400,
  "exp": 1700684800
}
```

## RLS Policy Logic

### Old (Broken) Policy
```sql
CREATE POLICY admin_instructors_all ON instructors
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
  -- Missing WITH CHECK clause!
  -- Can't INSERT because WITH CHECK is required
```

### New (Fixed) Policy
```sql
-- For INSERT operations
CREATE POLICY admin_instructors_insert ON instructors
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
  -- Now has WITH CHECK!

-- For UPDATE operations
CREATE POLICY admin_instructors_update ON instructors
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- For DELETE operations
CREATE POLICY admin_instructors_delete ON instructors
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');
```

## Debugging Flow

```
User sees error or data doesn't appear
                    ↓
User clicks "Run Full Debug" in Auth Debug panel
                    ↓
debugAuth() function runs:
    ├─ ✅ Checks session exists
    ├─ ✅ Shows user email
    ├─ ✅ Decodes JWT payload
    ├─ ✅ Shows claimed role
    ├─ ✅ Tests read permissions
    ├─ ✅ Tests write permissions (insert test instructor)
    └─ ✅ Shows summary with role validation
                    ↓
All output goes to browser Console (F12)
                    ↓
User can share console output for support
```

## Data Flow with Triggers

```
INSERT Instructor
    ↓
RLS: Check if user.role = 'admin' ✅
    ↓
INSERT into instructors table
    ↓
Trigger: trigger_update_analytics fires
    ↓
SELECT COUNT(*) FROM duties WHERE instructor_id = ?
    ↓
UPDATE instructors:
  - total_duties = count
  - on_time_count = count where status='on-time'
  - late_count = count where status='late'
    ↓
Stats now up-to-date for this instructor
```

---

This diagram shows exactly what happens when a user submits a form and why the permission check is critical.
