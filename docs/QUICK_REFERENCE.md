# ⚡ Lingoville Dashboard - Quick Setup Reference

## 🎯 TL;DR - 10-Minute Setup

### 1. Create Supabase Project
- Go to https://app.supabase.com
- Click "New Project" → Fill details → Wait 2-5 min

### 2. Copy & Run SQL Schema
```bash
# In Supabase: SQL Editor → New Query → Paste SUPABASE_SCHEMA.sql → Run
```

### 3. Get Your Keys
```
Supabase → Project Settings → API
Copy: Project URL + anon key
```

### 4. Create `.env.local`
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Install & Run
```bash
npm install @supabase/supabase-js
npm run dev
# Open http://localhost:5173
# Done! 🎉
```

---

## 📋 Checklist

- [ ] Supabase account created
- [ ] SQL schema executed
- [ ] `.env.local` created with credentials
- [ ] `npm install @supabase/supabase-js` run
- [ ] `npm run dev` working
- [ ] Dashboard loads with data
- [ ] Create/Read/Update/Delete working

---

## 🔗 Important Links

| Link | Purpose |
|------|---------|
| https://app.supabase.com | Supabase Dashboard |
| https://supabase.com/docs | Documentation |
| SUPABASE_SCHEMA.sql | SQL to run in Supabase |
| SUPABASE_SETUP.md | Detailed setup guide |
| MIGRATION_COMPLETE.md | Full documentation |

---

## 🚨 Common Issues

| Problem | Solution |
|---------|----------|
| "Table not found" | Run SUPABASE_SCHEMA.sql in SQL Editor |
| "Invalid API key" | Check `.env.local` has correct anon key |
| "Cannot find module" | Run `npm install @supabase/supabase-js` |
| "No data loading" | Check browser console for errors |

---

## 💻 Service Functions (No Changes to Components!)

```javascript
// All services work the same way:
import * as students from './services/students.js'

await students.list()           // Get all
await students.create(obj)      // Create
await students.update(obj)      // Update
await students.remove(id)       // Delete
```

---

## 🌍 Deployment

### GitHub Pages
```bash
git push origin main
# Settings → Pages → Deploy from main
```

### Supabase Database
- Already live and managed ✅
- No additional setup needed
- Free tier: 50,000 API calls/month

---

## 🆘 Quick Troubleshooting

```bash
# Test Supabase connection
npm run dev

# Check console (F12)
# Look for any error messages

# Verify data exists
# Supabase → Tables → students (should see rows)

# Check credentials
# cat .env.local | grep VITE_SUPABASE
```

---

## 📊 Database Tables

| Table | Purpose |
|-------|---------|
| students | Student profiles |
| contacts | Parents/emergency |
| groups | Classes/courses |
| student_groups | Enrollments |
| attendance | Daily marking |
| payments | Tuition tracking |
| events | School events |

---

## 🎓 Key Differences

| Before | After |
|--------|-------|
| Google Apps Script | Supabase PostgreSQL |
| 7 Google Sheets | 1 Database |
| HTTP + Proxy | Direct SDK |
| 3-5s queries | <200ms queries |
| Manual backups | Auto backups |

---

## ✨ Features

- ✅ CRUD operations
- ✅ Sibling discounts
- ✅ Attendance tracking
- ✅ Payment management
- ✅ Event scheduling
- 🔜 Real-time updates (subscribe to changes)
- 🔜 User authentication
- 🔜 File uploads

---

## 🎯 Next Steps

1. Follow "TL;DR" above
2. Test all pages load correctly
3. Try creating a new student
4. Check GitHub for deployment
5. Read SUPABASE_SETUP.md for detailed info

---

**Questions?** See SUPABASE_SETUP.md for full documentation.

**Ready?** Start with step 1 above! ⚡
