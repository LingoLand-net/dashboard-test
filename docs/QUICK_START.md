# 🚀 Quick Start Checklist

## Part 1: Prepare Spreadsheet IDs (5 mins)

- [ ] Open Google Drive
- [ ] For each of your 6 sheets, copy the Spreadsheet ID from the URL:
  ```
  https://docs.google.com/spreadsheets/d/COPY_THIS_ID/edit
  ```

Write them here:
```
students: ___________________________________________
student_groups: ___________________________________________
attendance: ___________________________________________
payments: ___________________________________________
events: ___________________________________________
contacts: ___________________________________________
```

---

## Part 2: Set Up Google Apps Script (10 mins)

- [ ] Open one of your Google Sheets (e.g., students sheet)
- [ ] Click **Tools** → **Script Editor** (opens new tab)
- [ ] You're now in the Apps Script editor

### Create 9 files in Apps Script:

For each `.gs` file in your local `api/gas/` folder:

1. **Code.gs** - Copy from `api/gas/Code.gs`
2. **utils.gs** - Copy from `api/gas/utils.gs`
3. **auth.gs** - Copy from `api/gas/auth.gs`
4. **students.gs** - Copy from `api/gas/students.gs`
5. **student_groups.gs** - Copy from `api/gas/student_groups.gs`
6. **attendance.gs** - Copy from `api/gas/attendance.gs`
7. **payments.gs** - Copy from `api/gas/payments.gs`
8. **events.gs** - Copy from `api/gas/events.gs`
9. **contacts.gs** - Copy from `api/gas/contacts.gs`

**How to add files:**
- Click **+** next to "Files" (left sidebar)
- Select "Script" → Name it (e.g., `utils.gs`)
- Copy-paste the code from your local file
- Click "Save"
- Repeat for all 9 files

- [ ] In `utils.gs`, update the `SPREADSHEET_MAP` with your actual IDs:
  ```javascript
  var SPREADSHEET_MAP = {
    students: 'ID_FROM_STUDENTS_SHEET',
    student_groups: 'ID_FROM_STUDENT_GROUPS_SHEET',
    attendance: 'ID_FROM_ATTENDANCE_SHEET',
    payments: 'ID_FROM_PAYMENTS_SHEET',
    events: 'ID_FROM_EVENTS_SHEET',
    contacts: 'ID_FROM_CONTACTS_SHEET'
  };
  ```

---

## Part 3: Deploy as Web App (3 mins)

- [ ] In Apps Script editor, click **Deploy** (top right)
- [ ] Click **New deployment**
- [ ] Click gear icon (⚙️) → Select **Web app**
- [ ] **Execute as:** Your Google account
- [ ] **Who has access:** "Anyone" or "Anyone with a Google account"
- [ ] Click **Deploy**
- [ ] **Copy the Web App URL** (looks like: `https://script.google.com/macros/s/...`)

Write it here:
```
Web App URL: _________________________________________________
```

---

## Part 4: Update Frontend (2 mins)

- [ ] Open `services/config.js` in your code editor
- [ ] Update `WEB_APP_URL`:
  ```javascript
  export const WEB_APP_URL = 'YOUR_WEB_APP_URL_FROM_ABOVE';
  ```

---

## Part 5: Test! (5 mins)

- [ ] Start a local web server for the frontend (VS Code Live Server or `python -m http.server`)
- [ ] Open `index.html` in your browser
- [ ] Go to **Students** page
- [ ] Click **+ Add New**
- [ ] Fill form:
  - First name: "Test"
  - Last name: "User"
- [ ] Click **Save**
- [ ] **Check your Google Sheets**: A new row should appear in the `students` sheet! ✅

If it works:
- [ ] Try **Edit** (click Edit button, change name, save)
- [ ] Try **Delete** (click Delete button, confirm)
- [ ] Test all other modules (Payments, Contacts, Events, Attendance, Groups)

---

## Troubleshooting

**❌ Network Error / Can't reach backend:**
- [ ] Check that Web App URL in `services/config.js` is correct
- [ ] Check browser console (F12) for errors
- [ ] Make sure you deployed Apps Script as Web App (not just saved)

**❌ "Sheet not found" error:**
- [ ] Verify Google Sheet names are exact: `students`, `student_groups`, `attendance`, `payments`, `events`, `contacts`
- [ ] Check that column headers are in Row 1 (not Row 0)

**❌ "Spreadsheet not found" error:**
- [ ] Double-check Spreadsheet IDs in `utils.gs` SPREADSHEET_MAP
- [ ] IDs should be from the URL, between `/d/` and `/edit`

**❌ Still not working?**
- [ ] Open Apps Script Editor → **Executions** (clock icon)
- [ ] Look for error messages
- [ ] Take a screenshot and debug

---

## You're Done! 🎉

Your Lingoville Dashboard is now:
- ✅ **Running locally** on your computer
- ✅ **Connected to Google Sheets** for data storage
- ✅ **Ready to add students, payments, contacts, events, attendance, groups**

Next steps:
- Add test data to Google Sheets (optional)
- Share the frontend URL with teachers/staff
- Add more features or customize as needed

