# Intelligent Invigilation Management System

A production-ready web application for managing exam invigilation duties with automatic intelligence for fairness, punctuality tracking, and workload distribution.

## 🎯 Features

### For Instructors
- **Dashboard**: View upcoming and past duties grouped by date
- **Mark Arrival**: One-click arrival marking with automatic punctuality detection
- **Profile & Stats**: Personal performance metrics and punctuality trends
- **Multiple Duties**: Handle multiple exam duties on the same day seamlessly

### For Administrators
- **Analytics Dashboard**: Real-time overview with charts and statistics
- **Duty Management**: Create, edit, and delete duty assignments
- **Workload Intelligence**: Automatic detection of overloaded/underutilized instructors
- **Auto-Suggestions**: Smart recommendations for balanced duty assignments
- **Punctuality Tracking**: Monitor late arrivals and flag repeat offenders
- **Instructor Management**: Full CRUD operations for instructor profiles

### Intelligent Features
- ✅ **Automatic Punctuality Detection**: 30-minute buffer before reporting time
- ✅ **Fair Distribution Analysis**: Flags instructors >20% above/below average
- ✅ **Smart Recommendations**: Suggests instructors with least current duties
- ✅ **Real-time Updates**: Supabase subscriptions for live data sync
- ✅ **Row Level Security**: Database-level access control

## 🛠️ Tech Stack

- **Frontend**: React 18 with Vite
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Styling**: TailwindCSS with custom design system
- **State Management**: Zustand
- **Charts**: Recharts
- **Routing**: React Router v6
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Modern web browser

## 🚀 Getting Started

### 1. Clone and Install

\`\`\`bash
cd "invigilation app"
npm install
\`\`\`

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema:
   - Copy contents of `supabase/schema.sql`
   - Execute in SQL Editor
3. (Optional) Run seed data:
   - Copy contents of `supabase/seed.sql`
   - Execute in SQL Editor

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` and add your Supabase credentials:

\`\`\`env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
\`\`\`

**Where to find these:**
- Go to your Supabase project
- Navigate to **Settings** → **API**
- Copy **Project URL** and **anon public** key

### 4. Run One-Time Database Setup

This script enables all features automatically:

1. Go to your Supabase project → **SQL Editor**
2. Copy contents of `supabase/SETUP_ONCE.sql`
3. Paste and execute in SQL Editor
4. Done! All features now work automatically

This sets up:
- ✅ Real-time subscriptions
- ✅ Auto-confirm emails on signup
- ✅ Admin role protection
- ✅ RLS policies
- ✅ Auto-update instructor stats

### 5. Create Admin Account (Optional)

If you want to test with existing accounts:

1. Go to Supabase → **Authentication** → **Users**
2. Click "Add user"
3. Email: `admin@university.edu`, Password: your choice
4. Done! Admin is auto-configured

### 6. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🔐 Demo Credentials

If you ran the seed data, you can create these test accounts:

**Admin:**
- Email: `admin@university.edu`
- Password: (set during user creation)

**Instructor:**
- Email: `rajesh.kumar@university.edu`
- Password: (set during user creation)
- Instructor ID: `11111111-1111-1111-1111-111111111111`

## 📁 Project Structure

\`\`\`
src/
├── components/
│   ├── admin/
│   │   └── DutyDistributionChart.jsx
│   ├── instructor/
│   │   └── DutyCard.jsx
│   └── shared/
│       ├── Navbar.jsx
│       ├── StatusBadge.jsx
│       └── StatsCard.jsx
├── lib/
│   ├── hooks/
│   │   ├── useDuties.js
│   │   ├── useInstructors.js
│   │   └── useExamsRooms.js
│   ├── utils/
│   │   ├── punctuality.js
│   │   └── workload.js
│   └── supabase.js
├── pages/
│   ├── admin/
│   │   └── Dashboard.jsx
│   ├── instructor/
│   │   ├── Dashboard.jsx
│   │   └── Profile.jsx
│   └── Login.jsx
├── store/
│   └── authStore.js
├── App.jsx
└── main.jsx
\`\`\`

## 🎨 Key Algorithms

### Punctuality Detection

Instructors must arrive **30 minutes before** the reporting time:

\`\`\`javascript
// Deadline = Reporting Time - 30 minutes
// Status = (Arrival Time <= Deadline) ? 'on-time' : 'late'
\`\`\`

### Workload Balancing

\`\`\`javascript
// Calculate average duties across all instructors
average = totalDuties / instructorCount

// Flag imbalances
if (instructorDuties > average * 1.2) → Overloaded
if (instructorDuties < average * 0.8) → Underutilized
else → Balanced
\`\`\`

### Auto-Suggestion

When creating a new duty, the system recommends the instructor with:
1. Least total duties
2. Optional: Filter by department
3. Shows variance from average

## 🔒 Security

- **Row Level Security (RLS)**: All tables protected
- **Admin Policies**: Full access to all data
- **Instructor Policies**: Can only view/update own duties
- **JWT-based Auth**: Supabase handles token management
- **Environment Variables**: Credentials never committed to code

## 🚢 Deployment

### Vercel (Recommended) ⭐

#### Step 1: Connect GitHub
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub (or create account)
3. Click "New Project"
4. Search for and select `invigilation-report-system` repository
5. Click "Import"

#### Step 2: Configure Environment Variables
In the Vercel project settings:
1. Go to **Settings** → **Environment Variables**
2. Add these variables:
   - Key: `VITE_SUPABASE_URL` → Value: Your Supabase Project URL
   - Key: `VITE_SUPABASE_ANON_KEY` → Value: Your Supabase Anon Key

**Where to find these in Supabase:**
- Go to your Supabase project dashboard
- Click **Settings** → **API**
- Copy **Project URL** and **anon public** key

#### Step 3: Deploy
1. Vercel will auto-detect the build settings (Vite)
2. Click "Deploy" button
3. Wait for the build to complete (~2-3 minutes)
4. Your app is live! 🎉

**Your live site URL:** `https://invigilation-report-system.vercel.app`

### Netlify (Alternative)

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Add environment variables in Netlify dashboard
4. Configure redirects for SPA routing (add `_redirects` file):
   ```
   /* /index.html 200
   ```

### Environment Variables for Production

\`\`\`env
VITE_SUPABASE_URL=your_production_url
VITE_SUPABASE_ANON_KEY=your_production_key
\`\`\`

## 📊 Database Schema

### Tables

- **instructors**: Instructor profiles
- **exams**: Exam definitions
- **rooms**: Examination venues
- **duties**: Core table linking exams, rooms, and instructors
- **analytics_cache**: Cached statistics for performance

### Views

- **duties_detailed**: Duties with joined exam/room/instructor data
- **instructor_stats**: Aggregated statistics per instructor

### Triggers

- **update_analytics_cache**: Auto-updates stats on duty changes

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env` file exists in root directory
- Check variable names start with `VITE_`
- Restart dev server after changing `.env`

### "Row Level Security policy violation"
- Verify user metadata has correct `role` field
- For instructors, ensure `instructor_id` matches database
- Check RLS policies in Supabase SQL Editor

### Charts not displaying
- Ensure `recharts` is installed: `npm install recharts`
- Check browser console for errors
- Verify data is being fetched correctly

### Real-time updates not working
- Check Supabase Realtime is enabled for your project
- Verify subscription setup in hooks
- Check browser network tab for WebSocket connection

## 📝 License

MIT License - feel free to use for your institution!

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📧 Support

For issues or questions, please open a GitHub issue.

---

Built with ❤️ for efficient exam management
\`\`\`
