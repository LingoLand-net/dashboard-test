# ✅ Complete Launch Checklist

## Pre-Launch Verification

### Frontend Files (ALL COMPLETE ✓)
- [x] `index.html` — Full page structure with 6 modules
- [x] `styles.css` — Complete styling
- [x] `main.js` — Router and page loading
- [x] `services/api.js` — API client
- [x] `services/config.js` — Config file (needs Web App URL)
- [x] `services/{students,payments,contacts,events,attendance,groups}.js` — API wrappers
- [x] `pages/*/fetch.js` — Load & render tables (6 files)
- [x] `pages/*/app.js` — Form handling (6 files)
- [x] `models/{student,payment,attendance}.js` — Data models
- [x] `utils/{logger,store,validator}.js` — Utilities
- [x] `components/{header,modal,sidebar}.js` — Components

### Backend Files (ALL COMPLETE ✓)
- [x] `api/gas/Code.gs` — Router
- [x] `api/gas/utils.gs` — Helpers (needs Spreadsheet IDs)
- [x] `api/gas/auth.gs` — Auth
- [x] `api/gas/{students,payments,contacts,events,attendance,student_groups}.gs` — Handlers

### Documentation (ALL COMPLETE ✓)
- [x] `docs/QUICK_START.md` — Quick checklist
- [x] `docs/NEXT_STEPS.md` — Your 4 immediate steps
- [x] `docs/ARCHITECTURE.md` — System overview
- [x] `docs/DATA_FLOW.md` — API flow diagrams
- [x] `docs/APPS_SCRIPT_SETUP.md` — Detailed setup
- [x] `docs/DB-structure.md` — Database schema
- [x] `docs/COMPLETE_SETUP.md` — Full reference

---

## Your Setup Tasks (DO THIS NOW)

### Phase 1: Gather Information (3 mins)

- [ ] Open Google Drive
- [ ] Find your 6 Google Sheets:
  - [ ] students
  - [ ] student_groups
  - [ ] attendance
  - [ ] payments
  - [ ] events
  - [ ] contacts
- [ ] Copy Spreadsheet IDs from each URL
  ```
  https://docs.google.com/spreadsheets/d/COPY_THIS_ID/edit
  ```
- [ ] Write them down or keep browser tabs open

### Phase 2: Google Apps Script Setup (7 mins)

- [ ] Open one of your Google Sheets
- [ ] Click **Tools** → **Script Editor**
- [ ] In the Apps Script editor:
  - [ ] Create file: `Code.gs` (copy from `api/gas/Code.gs`)
  - [ ] Create file: `utils.gs` (copy from `api/gas/utils.gs`)
  - [ ] Create file: `auth.gs` (copy from `api/gas/auth.gs`)
  - [ ] Create file: `students.gs` (copy from `api/gas/students.gs`)
  - [ ] Create file: `student_groups.gs` (copy from `api/gas/student_groups.gs`)
  - [ ] Create file: `attendance.gs` (copy from `api/gas/attendance.gs`)
  - [ ] Create file: `payments.gs` (copy from `api/gas/payments.gs`)
  - [ ] Create file: `events.gs` (copy from `api/gas/events.gs`)
  - [ ] Create file: `contacts.gs` (copy from `api/gas/contacts.gs`)

### Phase 3: Update Spreadsheet IDs (2 mins)

- [ ] In Apps Script editor, open `utils.gs`
- [ ] Find `var SPREADSHEET_MAP = { ... }`
- [ ] Replace all placeholder IDs with your actual IDs:
  ```javascript
  var SPREADSHEET_MAP = {
    students: 'YOUR_STUDENTS_ID',
    student_groups: 'YOUR_STUDENT_GROUPS_ID',
    attendance: 'YOUR_ATTENDANCE_ID',
    payments: 'YOUR_PAYMENTS_ID',
    events: 'YOUR_EVENTS_ID',
    contacts: 'YOUR_CONTACTS_ID'
  };
  ```
- [ ] Save the file (Ctrl+S or Cmd+S)

### Phase 4: Deploy Web App (3 mins)

- [ ] In Apps Script editor, click **Deploy** (top right)
- [ ] Click **New deployment**
- [ ] Click gear icon (⚙️) → Select **Web app**
- [ ] Settings:
  - [ ] Execute as: Your Google account
  - [ ] Who has access: "Anyone" or "Anyone with a Google account"
- [ ] Click **Deploy**
- [ ] Copy the **Web App URL** from the success dialog
  ```
  https://script.google.com/macros/s/...DEPLOYMENT_ID.../exec
  ```

### Phase 5: Update Frontend Config (2 mins)

- [ ] Open `services/config.js` in your code editor
- [ ] Update `WEB_APP_URL`:
  ```javascript
  export const WEB_APP_URL = 'YOUR_WEB_APP_URL_FROM_PHASE_4';
  ```
- [ ] Save the file

### Phase 6: Test the Connection (3 mins)

- [ ] Start a local web server:
  - **Option A (VS Code):** Install "Live Server" extension, right-click `index.html` → "Open with Live Server"
  - **Option B (Python):** `python -m http.server 8000` in project folder
  - **Option C (Node):** `npx http-server`
- [ ] Open `http://localhost:XXXX` in browser
- [ ] Click on **Students** page
- [ ] Click **+ Add New** button
- [ ] Fill form:
  - [ ] First name: `Test`
  - [ ] Last name: `User`
- [ ] Click **Save**
- [ ] Check your **students Google Sheet**:
  - [ ] New row should appear: `[stu_..., Test, User, ...]`

### Phase 7: Advanced Testing (Optional but Recommended)

- [ ] **Test Edit:**
  - [ ] Click **Edit** on the test row
  - [ ] Change last name to `Verified`
  - [ ] Click **Save**
  - [ ] Refresh Google Sheet → Row should update ✓

- [ ] **Test Delete:**
  - [ ] Click **Delete** on the test row
  - [ ] Confirm deletion
  - [ ] Refresh Google Sheet → Row should be gone ✓

- [ ] **Test Other Modules:**
  - [ ] Go to **Payments** → Add a payment record
  - [ ] Go to **Contacts** → Add a contact
  - [ ] Go to **Events** → Add an event
  - [ ] Go to **Attendance** → Add an attendance record
  - [ ] Go to **Groups** → Add a group
  - [ ] Check each corresponding Google Sheet ✓

---

## Verification Checklist

### Browser DevTools Check (F12)
- [ ] **Console tab:** No red errors
- [ ] **Network tab:** API requests show 200 status (successful)
- [ ] **Network → Response:** See JSON response from Apps Script

### Google Apps Script Check
- [ ] Click **Executions** (clock icon in left sidebar)
- [ ] Latest execution shows **Completed** (green checkmark)
- [ ] No error messages in the log

### Google Sheets Check
- [ ] Each sheet has correct column headers in Row 1
- [ ] New rows are being added when you create records
- [ ] Rows are being updated when you edit records
- [ ] Rows are being deleted when you delete records

---

## Success Indicators 🎉

You're ready to use the system if:

✅ **Frontend**
- [ ] Page loads without errors
- [ ] All 6 navigation links work (Students, Payments, Contacts, Events, Attendance, Groups)
- [ ] Tables load and display data
- [ ] Forms open when clicking "+ Add New"

✅ **Backend**
- [ ] API calls complete (Network tab shows 200 status)
- [ ] Apps Script Executions show completed requests
- [ ] No "sheet not found" or "spreadsheet not found" errors

✅ **Data Persistence**
- [ ] New records appear in Google Sheets
- [ ] Updated records reflect changes in Google Sheets
- [ ] Deleted records are removed from Google Sheets

---

## If Something Goes Wrong

### Step 1: Check the Error Message
- [ ] Browser console (F12 → Console tab)
- [ ] Apps Script Executions log (clock icon in Apps Script editor)
- [ ] Google Sheets sheet names and column headers

### Step 2: Debug Checklist
- [ ] Web App URL in `services/config.js` matches deployment URL
- [ ] Spreadsheet IDs in `utils.gs` are correct (copy from URL exactly)
- [ ] Sheet names in Google Sheets match: `students`, `student_groups`, `attendance`, `payments`, `events`, `contacts`
- [ ] Column headers in Row 1 match exactly: `student_id`, `first_name`, etc.
- [ ] Apps Script deployed as "Web app" (not just saved)
- [ ] Apps Script access set to "Anyone" or "Anyone with a Google account"

### Step 3: Common Issues
| Error | Fix |
|-------|-----|
| **"Cannot reach server"** | Check Web App URL in `config.js` |
| **"Sheet not found"** | Check sheet names (case-sensitive) |
| **"No columns found"** | Check column headers are in Row 1 |
| **"Unauthorized"** | Re-deploy Apps Script with "Anyone" access |
| **Nothing updates** | Check Apps Script Executions for errors |

---

## You're All Set! 🚀

**Total time to launch: ~15 minutes**

Once you complete the phases above, your Lingoville Dashboard will be:
- ✅ Fully functional
- ✅ Connected to Google Sheets
- ✅ Ready for daily use
- ✅ Scalable for adding more features

**Next steps after launch:**
1. Add real student data to Google Sheets
2. Invite teachers/staff to use the dashboard
3. Add more validation or business logic as needed
4. Consider adding features like search, filters, reports

---

## Quick Reference Links

- **Setup Guide:** `docs/NEXT_STEPS.md`
- **Architecture:** `docs/ARCHITECTURE.md`
- **API Reference:** `docs/DATA_FLOW.md`
- **Troubleshooting:** `docs/COMPLETE_SETUP.md`
- **Database Schema:** `docs/DB-structure.md`

Good luck! You've got this! 💪

