# 🚀 Supabase Setup - Getting Started Guide

## ✅ Status

Your project is now configured with:
- **URL**: `https://ntoywdjhihbzuatybafv.supabase.co`
- **SDK**: `@supabase/supabase-js` ✅ Installed
- **Credentials**: `.env.local` ✅ Created
- **RLS Configuration**: Ready to apply

---

## 📋 Quick Checklist

- [x] Supabase account created
- [x] Project credentials obtained
- [x] `.env.local` file created with credentials
- [x] `@supabase/supabase-js` SDK installed
- [ ] SQL schema executed (SUPABASE_SCHEMA.sql)
- [ ] RLS policies applied (SUPABASE_RLS_SETUP.sql)
- [ ] Dashboard tested locally
- [ ] Data verified in Supabase

---

## 🔧 Next Steps

### Step 1: Run Database Schema (5 minutes)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy & paste entire contents of `SUPABASE_SCHEMA.sql`
6. Click **Run** button
7. Wait for completion ✅

**Expected output**: "PostgreSQL SQL statement executed successfully"

### Step 2: Apply RLS Policies (2 minutes)

1. In **SQL Editor**, create a new query
2. Copy & paste entire contents of `SUPABASE_RLS_SETUP.sql`
3. Click **Run** button
4. Wait for completion ✅

**Expected output**: "PostgreSQL SQL statement executed successfully"

### Step 3: Verify Tables Created

1. Go to **Table Editor** (left sidebar)
2. You should see 7 tables:
   - students
   - contacts
   - groups
   - student_groups
   - attendance
   - payments
   - events

### Step 4: Test Local Dashboard

```bash
cd "c:\Users\ideapad\OneDrive\Desktop\lingo land\lingoville dashboard"
npm run dev
```

Open browser to `http://localhost:5173` (or shown port)

---

## 🐛 Troubleshooting

### Issue: "Table public.students is public, but RLS has not been enabled"

**Solution**: This is expected! Run `SUPABASE_RLS_SETUP.sql` to fix it.

The error appears because:
- Tables are public (accessible via PostgREST API)
- But RLS (Row Level Security) wasn't enabled
- RLS needs to be enabled to expose tables safely

### Issue: "No data loading in dashboard"

**Solutions** (try in order):

1. **Verify credentials are correct**
   ```bash
   cat .env.local
   ```
   Should show your URL and API key

2. **Check browser console for errors**
   - Press `F12` in browser
   - Go to **Console** tab
   - Look for red error messages

3. **Verify RLS is enabled**
   - In Supabase SQL Editor, run:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables 
   WHERE schemaname = 'public' 
   ORDER BY tablename;
   ```
   - All your tables should show `rowsecurity = true`

4. **Check data exists in Supabase**
   - Go to **Table Editor**
   - Click each table
   - Should show some data (or be empty if you haven't added any)

### Issue: "npm run dev" fails with "command not found"

**Solution**: 
```bash
# Install dependencies first
npm install

# Then run
npm run dev
```

### Issue: "Cannot find module '@supabase/supabase-js'"

**Solution**:
```bash
# Reinstall the SDK
npm install @supabase/supabase-js
```

---

## 📊 Expected Performance

After setup:
- **Page load**: < 1 second
- **List students**: < 200ms
- **Create student**: < 100ms
- **Update/Delete**: < 100ms

If slower, check:
1. Network connection
2. Supabase metrics (Dashboard → Monitoring)
3. RLS complexity (simpler policies = faster)

---

## 🔐 Security Notes

### Current Setup (Development)
- RLS enabled ✅
- Policies allow all authenticated users
- Good for development/testing
- NOT recommended for production with real data

### Production Setup (When Ready)
1. Implement user authentication
2. Create user-based policies (restrict to own data)
3. Add Row-Level Security checks with `auth.uid()`
4. Monitor access patterns
5. Set up backups

---

## 📁 Files Reference

| File | Purpose | Status |
|------|---------|--------|
| `.env.local` | Your credentials | ✅ Created |
| `SUPABASE_SCHEMA.sql` | Database tables | ⏳ Ready to run |
| `SUPABASE_RLS_SETUP.sql` | Security policies | ⏳ Ready to run |
| `services/supabase.js` | Supabase client | ✅ Ready |
| `services/config.js` | Configuration | ✅ Updated |
| `services/*.js` | All other services | ✅ Ready |

---

## 💻 Testing Locally

### Start the dev server:
```bash
npm run dev
```

### Test creating a student:
1. Open dashboard at `http://localhost:5173`
2. Go to "Students" page
3. Click "Add Student"
4. Fill in form and submit
5. Should appear immediately

### Test data persistence:
1. Create some test data
2. Refresh the page
3. Data should still be there (persisted in Supabase)

---

## 🎓 Understanding RLS

**RLS (Row Level Security)** controls who can access which rows.

### Without RLS:
```
User A → Database → All rows visible ❌ UNSAFE
User B → Database → All rows visible ❌ UNSAFE
```

### With RLS:
```
User A → RLS Policy → Only own rows visible ✅ SAFE
User B → RLS Policy → Only own rows visible ✅ SAFE
```

### Our Setup:
- RLS is ENABLED on all tables ✅
- Policies allow authenticated users to access all data
- Good for single-organization (school) use case
- Everyone in system sees all data (appropriate for school dashboard)

---

## 🔗 Useful Links

- **Supabase Dashboard**: https://app.supabase.com
- **Your Project SQL Editor**: Go to dashboard → SQL Editor
- **Supabase Docs**: https://supabase.com/docs
- **RLS Documentation**: https://supabase.com/docs/guides/auth/row-level-security
- **JavaScript Client Docs**: https://supabase.com/docs/reference/javascript

---

## ✨ Success Criteria

You'll know it's working when:
- [ ] Dashboard loads without errors
- [ ] Can see "Students" page
- [ ] Can add a new student
- [ ] Student appears in list immediately
- [ ] Data persists after page refresh
- [ ] All pages (Students, Payments, Attendance, etc.) load
- [ ] No console errors in browser

---

## 📞 Need Help?

1. Check the **Troubleshooting** section above
2. Review **SUPABASE_SETUP.md** for detailed guide
3. Check browser console (`F12` → Console tab)
4. Check Supabase dashboard for errors
5. Review RLS status in SQL Editor

---

**Version**: 2.1.0 (Setup with RLS)  
**Last Updated**: November 12, 2025  
**Status**: 🚀 Ready to Deploy
