# Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
\`\`\`bash
npm install
\`\`\`

### Step 2: Set Up Supabase

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose a name and password

2. **Run Database Schema**
   - In Supabase dashboard, go to **SQL Editor**
   - Copy the entire contents of `supabase/schema.sql`
   - Paste and click "Run"
   - Wait for success message

3. **Add Seed Data (Optional)**
   - In SQL Editor, copy contents of `supabase/seed.sql`
   - Paste and click "Run"
   - This creates 10 instructors, 5 exams, 8 rooms, and 25 duties

### Step 3: Configure Environment

1. **Get Supabase Credentials**
   - In Supabase, go to **Settings** → **API**
   - Copy **Project URL**
   - Copy **anon public** key

2. **Create .env File**
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. **Edit .env**
   \`\`\`env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   \`\`\`

### Step 4: Create Users

#### Create Admin User
1. In Supabase, go to **Authentication** → **Users**
2. Click "Add User" → "Create new user"
3. Email: `admin@university.edu`
4. Password: (your choice, e.g., `admin123`)
5. Click "Create user"

6. **Set Admin Role** (in SQL Editor):
   \`\`\`sql
   UPDATE auth.users
   SET raw_user_meta_data = jsonb_build_object('role', 'admin')
   WHERE email = 'admin@university.edu';
   \`\`\`

#### Create Instructor User
1. Create user via Authentication UI
2. Email: `rajesh.kumar@university.edu`
3. Password: (your choice)

4. **Link to Instructor Record** (in SQL Editor):
   \`\`\`sql
   UPDATE auth.users
   SET raw_user_meta_data = jsonb_build_object(
     'role', 'instructor',
     'instructor_id', '11111111-1111-1111-1111-111111111111'
   )
   WHERE email = 'rajesh.kumar@university.edu';
   \`\`\`

### Step 5: Run the App

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:5173](http://localhost:5173)

### Step 6: Login

**Admin Login:**
- Email: `admin@university.edu`
- Password: (what you set)

**Instructor Login:**
- Email: `rajesh.kumar@university.edu`
- Password: (what you set)

---

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] Schema executed successfully
- [ ] Seed data loaded (optional)
- [ ] .env file configured
- [ ] Admin user created and role set
- [ ] Instructor user created and linked
- [ ] App runs on localhost:5173
- [ ] Can login as admin
- [ ] Can login as instructor

---

## 🐛 Common Issues

### "Missing Supabase environment variables"
- Check `.env` file exists
- Verify variable names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server: `Ctrl+C` then `npm run dev`

### "Invalid login credentials"
- Verify user exists in Supabase Authentication
- Check email/password are correct
- Ensure user metadata has `role` field

### "Row Level Security policy violation"
- For admin: Check `role = 'admin'` in user metadata
- For instructor: Check `instructor_id` matches database ID
- Run this to verify:
  \`\`\`sql
  SELECT email, raw_user_meta_data FROM auth.users;
  \`\`\`

### Build fails
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Try `npm run build`

---

## 📝 Next Steps

1. **Create More Users**: Add more instructors following Step 4
2. **Add Exams**: Use admin dashboard to create exams
3. **Assign Duties**: Create duty assignments with auto-suggestions
4. **Test Arrival**: Login as instructor and mark arrival
5. **View Analytics**: Check admin dashboard for charts

---

## 🎯 Key Features to Test

### As Instructor:
1. View upcoming duties on dashboard
2. Mark arrival for today's duty
3. Check status changes to "on-time" or "late"
4. View profile stats and punctuality chart

### As Admin:
1. View duty distribution chart
2. Check workload balance alerts
3. Create new duty with auto-suggestion
4. Monitor late arrival alerts
5. View punctuality pie chart

---

Need help? Check the full README.md for detailed documentation!
