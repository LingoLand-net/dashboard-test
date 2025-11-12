# Lingoville Dashboard - Supabase Migration Guide

## Overview
This dashboard has been completely migrated from Google Apps Script + Google Sheets to **Supabase** (PostgreSQL database).

### What Changed
- ❌ Removed: Google Apps Script backend (`api/gas/` folder)
- ❌ Removed: Google Sheets data source
- ❌ Removed: CORS proxy dependency
- ✅ Added: Supabase PostgreSQL database
- ✅ Added: Direct client-side database access via Supabase SDK
- ✅ Added: Real-time subscriptions capability

---

## Setup Steps

### 1. Create a Supabase Project
1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in project details:
   - Name: "Lingoville Dashboard"
   - Database Password: suggest.strongerPASSWORD88
   - Region: Europe
4. Wait for project to initialize (2-5 minutes)

### 2. Run the SQL Schema
1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy the entire contents of `SUPABASE_SCHEMA.sql`
4. Paste into the SQL editor
5. Click "Run" (▶️ button)
6. Verify all tables are created (check "Tables" in left sidebar)

### 3. Get Your Credentials
1. Go to **Project Settings** (⚙️ icon, bottom left)
2. Click **API**
3. Copy these values:
   - **Project URL** → `https://ntoywdjhihbzuatybafv.supabase.co`
   - **anon public** key → `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50b3l3ZGpoaWhienVhdHliYWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MzM1NzEsImV4cCI6MjA3ODUwOTU3MX0.J7rG5nOJigfhpqQZZXNbKkhfcrNkNewwqA3cTAlPNpQ`

### 4. Update Environment Variables
Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Or update `services/config.js` directly:

```javascript
export const SUPABASE_URL = 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### 5. Install Supabase Dependency
```bash
npm install @supabase/supabase-js
```

### 6. Test the Connection
Open your dashboard in a browser. If you see the data (students, payments, etc.), the connection is working!

---

## Project Structure

### Before (Google Apps Script)
```
api/gas/
├── Code.gs (router)
├── students.gs (CRUD)
├── payments.gs
├── attendance.gs
├── contacts.gs
├── events.gs
├── groups.gs
└── utils.gs (helpers)
```

### After (Supabase)
```
services/
├── supabase.js (client initialization)
├── students.js (direct Supabase queries)
├── payments.js
├── attendance.js
├── contacts.js
├── events.js
├── groups.js
└── config.js (credentials)
```

---

## API Endpoints Mapping

### Old: Google Apps Script HTTP calls
```javascript
// Example
const res = await api.request('?resource=students&action=list')
```

### New: Direct Supabase queries
```javascript
// Example
const { data } = await supabase.from('students').select('*')
```

All service functions work the same way - no changes needed in components!

---

## Database Schema

### Tables
1. **students** - Student profiles
   - `student_id` (text, PK)
   - `first_name`, `last_name`
   - `email`, `phone`
   - `date_of_birth`, `enrollment_date`
   - `status` (active|inactive|graduated|withdrawn)
   - `family_id` - for grouping siblings
   - `parent_contact_id` - foreign key to contacts
   - Indexes on: `family_id`, `status`, `parent_contact_id`

2. **contacts** - Parents, emergency contacts, etc.
   - `contact_id` (text, PK)
   - `name`, `email`, `phone`
   - `type` (Parent|Emergency|Relative|Guardian)
   - `relationship`
   - Indexes on: `type`

3. **groups** - Classes/courses
   - `group_id` (text, PK)
   - `group_name` (unique)
   - `level`, `status` (active|inactive|completed)
   - `instructor`, `capacity`, `schedule`
   - Indexes on: `status`, `level`

4. **student_groups** - Enrollments (many-to-many)
   - `id` (text, PK)
   - `student_id` (FK → students)
   - `group_id` (FK → groups)
   - `enrollment_date`, `status`
   - Unique constraint: `(student_id, group_id)`

5. **attendance** - Daily attendance records
   - `attendance_id` (text, PK)
   - `student_id` (FK)
   - `group_id` (FK)
   - `attendance_date`, `status` (present|absent|late|excused)
   - Unique constraint: `(student_id, group_id, attendance_date)`

6. **payments** - Tuition payments
   - `payment_id` (text, PK)
   - `student_id` (FK)
   - `group_id` (FK)
   - `amount`, `base_amount`, `discount_applied`
   - `due_date`, `payment_date`
   - `status` (pending|paid|overdue|partial|refunded)
   - Indexes on: `status`, `due_date`

7. **events** - School events
   - `event_id` (text, PK)
   - `event_name`, `event_date`, `event_time`
   - `location`, `description`
   - `group_id`, `organizer`, `capacity`
   - `status` (planned|ongoing|completed|cancelled)

---

## Helper Functions

PostgreSQL functions for common operations:

### `get_group_student_count(group_id)`
Returns count of active students in a group

### `get_family_discount(family_id)`
Returns discount percentage based on number of siblings (5% per sibling, max 15%)

### `mark_overdue_payments()`
Updates all pending payments with due_date < today to 'overdue' status

---

## Real-Time Subscriptions (Optional)

To enable real-time updates when data changes:

```javascript
// Example: Listen for student updates
const subscription = supabase
  .from('students')
  .on('*', payload => {
    console.log('Student changed:', payload)
    // Refresh UI
  })
  .subscribe()

// Cleanup
subscription.unsubscribe()
```

---

## Row-Level Security (RLS)

For production, enable RLS to restrict data access. Example policy:

```sql
-- Allow users to see their own student data
CREATE POLICY "Users can view their own students" ON students
  FOR SELECT USING (
    auth.uid() = user_id -- requires auth.user_id column
  );
```

---

## Environment File (.env.local)

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# (optional) Other configs
VITE_APP_TITLE=Lingoville Dashboard
```

---

## Troubleshooting

### "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
```

### "Invalid API key"
- Check `VITE_SUPABASE_ANON_KEY` in `.env.local` or `config.js`
- Make sure it's the **anon public** key, not the service role key

### "Table not found" errors
- Run `SUPABASE_SCHEMA.sql` in SQL Editor
- Verify table names in Supabase dashboard

### Data not appearing on dashboard
- Check browser console for errors
- Verify Supabase credentials are correct
- Check if sample data was inserted (`SUPABASE_SCHEMA.sql` includes INSERT statements)

---

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Run SQL schema
3. ✅ Add credentials to `.env.local`
4. ✅ Test dashboard
5. 🔄 Add Row-Level Security (optional)
6. 🔄 Set up real-time subscriptions (optional)
7. 🚀 Deploy to production

---

## Deployment to Production

### GitHub Pages (Static Frontend)
1. Push code to GitHub
2. Go to repository Settings → Pages
3. Deploy from `main` branch
4. Frontend is now live on `yourusername.github.io/dashboard-test`

### Supabase (Database)
- Already managed by Supabase (no additional setup needed)
- Data is backed up automatically
- Accessible globally with 99.9% uptime

### Environment Variables for Production
Use GitHub Secrets or your hosting platform's environment config:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Security Notes

- Never commit `.env.local` to GitHub (add to `.gitignore`)
- Anon public key is safe to expose (browser code reads it)
- For sensitive operations, use Supabase Auth + RLS
- Rotate service role key periodically
- Monitor query performance in Supabase dashboard

---

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Supabase CLI**: `npm i -g supabase` (optional, for advanced features)
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

**Migration Completed**: November 12, 2025
Database: PostgreSQL (Supabase)
Frontend: Vanilla ES6 JavaScript
API: Direct Supabase SDK (no REST layer needed)
