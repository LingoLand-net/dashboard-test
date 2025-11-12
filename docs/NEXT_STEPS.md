# Your Next 4 Steps to Launch

## ⏱️ Time to completion: ~15 minutes

---

## Step 1: Copy Spreadsheet IDs (3 mins)

Go to each of your 6 Google Sheets and copy the Spreadsheet ID from the URL:

```
https://docs.google.com/spreadsheets/d/THIS_IS_YOUR_ID/edit
                                      ↑ Copy this part
```

**Copy these 6 IDs:**
```
1. students: _________________________________
2. student_groups: _________________________________
3. attendance: _________________________________
4. payments: _________________________________
5. events: _________________________________
6. contacts: _________________________________
```

---

## Step 2: Set Up Google Apps Script (7 mins)

1. Open any of your Google Sheets (e.g., the students sheet)
2. Click **Tools** → **Script Editor**
3. A new tab opens with the Apps Script editor

### Add all 9 files to Apps Script:

In the left sidebar, click **+** next to "Files" and create a new Script file for each:

```
Files to create (copy from your local api/gas/ folder):
☐ Code.gs
☐ utils.gs
☐ auth.gs
☐ students.gs
☐ student_groups.gs
☐ attendance.gs
☐ payments.gs
☐ events.gs
☐ contacts.gs
```

For each file:
1. Click **+** → "Create new file" → "Script"
2. Name it (e.g., `utils.gs`)
3. Copy-paste the code from your local file
4. Click "Save"

### Update the Spreadsheet IDs in `utils.gs`:

In the Apps Script editor, open `utils.gs` and find this section:

```javascript
var SPREADSHEET_MAP = {
  students: 'REPLACE_WITH_STUDENTS_SPREADSHEET_ID',
  student_groups: 'REPLACE_WITH_STUDENT_GROUPS_SPREADSHEET_ID',
  attendance: 'REPLACE_WITH_ATTENDANCE_SPREADSHEET_ID',
  payments: 'REPLACE_WITH_PAYMENTS_SPREADSHEET_ID',
  events: 'REPLACE_WITH_EVENTS_SPREADSHEET_ID',
  contacts: 'REPLACE_WITH_CONTACTS_SPREADSHEET_ID'
};
```

Replace each `REPLACE_WITH_...` with the actual ID from Step 1.

Example:
```javascript
var SPREADSHEET_MAP = {
  students: '1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P',
  student_groups: '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p',
  attendance: '1X2Y3Z4A5B6C7D8E9F0G1H2I3J4K5L6M',
  ...
};
```

---

## Step 3: Deploy as Web App (3 mins)

In the Apps Script editor:

1. Click **Deploy** (top right button)
2. Click **"New deployment"**
3. Click the **gear icon** ⚙️ → Select **"Web app"**
4. Settings:
   - **Execute as:** Your Google account
   - **Who has access:** "Anyone" or "Anyone with a Google account"
5. Click **Deploy**
6. A dialog appears with a **Web App URL**
7. **Copy this URL** (it looks like: `https://script.google.com/macros/s/DEPLOYMENT_ID/exec`)

```
Your Web App URL: _________________________________
```

---

## Step 4: Update Frontend Config (2 mins)

In your code editor, open `services/config.js`:

```javascript
export const WEB_APP_URL = 'https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYED_URL/exec/';
```

Replace `REPLACE_WITH_YOUR_DEPLOYED_URL` with the URL from Step 3.

Example:
```javascript
export const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbz1a2B3c4D5e6F7g8H9i0JkLmN/exec/';
```

---

## 🎯 Test It!

1. **Start a local web server** for your frontend:
   - **VS Code:** Install "Live Server" extension, right-click `index.html` → "Open with Live Server"
   - **Python:** `python -m http.server 8000` in the project directory
   - Then open `http://localhost:8000` in your browser

2. **Open the app** and go to **Students** page

3. **Click "+ Add New"** button

4. **Fill the form:**
   - First name: `Test`
   - Last name: `User`

5. **Click Save**

6. **Check your Google Sheets:**
   - Open the `students` spreadsheet
   - You should see a new row: `[stu_abc123, Test, User, ...]` ✅

### If it works:
- ✅ Try clicking **Edit** (change the name, save, refresh sheet)
- ✅ Try clicking **Delete** (confirm, check sheet)
- ✅ Test the other modules (Payments, Contacts, Events, Attendance, Groups)

### If it doesn't work:
1. **Check browser console** (F12 → Console tab) for JavaScript errors
2. **Check Network tab** (F12 → Network) to see the API request
3. **Check Apps Script Executions** (Apps Script Editor → Executions icon 🕐)
4. See detailed error messages in the execution log

---

## 🎉 You're Done!

Your Lingoville Dashboard is now fully functional:
- ✅ Frontend running on your computer
- ✅ Connected to Google Sheets
- ✅ Full CRUD (Create, Read, Update, Delete) for all 6 modules
- ✅ Real-time data sync

---

## Documentation References

- **Quick Start:** `docs/QUICK_START.md` (checklist version of above)
- **Architecture:** `docs/ARCHITECTURE.md` (system overview & diagrams)
- **Data Flow:** `docs/DATA_FLOW.md` (detailed API flow with examples)
- **DB Structure:** `docs/DB-structure.md` (database schema)
- **Apps Script Setup:** `docs/APPS_SCRIPT_SETUP.md` (detailed step-by-step)

---

## Next Features You Can Add

Once the basic CRUD is working:

1. **Search & Filter:** Add filters by student name, group, date range, etc.
2. **Reports:** Generate reports (attendance summary, payment status, etc.)
3. **Student Details:** Click on a student to see all their linked data (payments, attendance, groups)
4. **Bulk Import:** Import students from CSV
5. **Notifications:** Email reminders for overdue payments or missed attendance
6. **Mobile Optimization:** Make the dashboard mobile-friendly
7. **Multi-user Auth:** Add login with Google accounts
8. **Audit Logs:** Track who made changes and when

---

## Support

If you get stuck:
1. Check the error message in browser console (F12)
2. Look at Apps Script Executions log for backend errors
3. Verify Spreadsheet IDs are correct
4. Verify column headers match exactly: `student_id`, `first_name`, `last_name`, etc.
5. Check that you deployed Apps Script as "Web app" (not just saved)

Good luck! 🚀

