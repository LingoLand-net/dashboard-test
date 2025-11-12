# Google Apps Script Setup Guide

## Step 1: Gather Your Spreadsheet IDs

You need the Spreadsheet ID for each of your 6 Google Sheets. Find it in the URL:

```
https://docs.google.com/spreadsheets/d/1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T/edit
                               ↑ Copy this
```

### Your Spreadsheet IDs:
```
students: ___________________________
student_groups: ___________________________
attendance: ___________________________
payments: ___________________________
events: ___________________________
contacts: ___________________________
```

---

## Step 2: Create Google Apps Script Project

1. **Go to any of your Google Sheets** (e.g., the students spreadsheet)
2. Click **Tools** → **Script Editor**
3. This opens Google Apps Script in a new tab
4. You're now in the Apps Script editor for that spreadsheet

---

## Step 3: Create Files in Apps Script Editor

The Apps Script editor groups files by `.gs` (Google Script) files. You need to create these files:

1. **Code.gs** ← Main router (handles all requests)
2. **utils.gs** ← Helper functions (sheet reading/writing)
3. **auth.gs** ← Authentication (optional, currently permissive)
4. **students.gs** ← Student CRUD handlers
5. **student_groups.gs** ← Group linking handlers
6. **attendance.gs** ← Attendance CRUD handlers
7. **payments.gs** ← Payment CRUD handlers
8. **events.gs** ← Events CRUD handlers
9. **contacts.gs** ← Contacts CRUD handlers

### How to add files in Apps Script:
- In the left sidebar, click **+** icon next to "Files"
- Select "Create new file" → "Script"
- Name it (e.g., `utils.gs`)
- Copy the code from your local `api/gas/` folder into it

---

## Step 4: Copy Code into Apps Script

Go to your local `api/gas/` folder and copy each file's contents into the corresponding Apps Script file:

- `Code.gs` → Paste into Apps Script `Code.gs`
- `utils.gs` → Paste into Apps Script `utils.gs`
- `auth.gs` → Paste into Apps Script `auth.gs`
- `students.gs` → Paste into Apps Script `students.gs`
- `student_groups.gs` → Paste into Apps Script `student_groups.gs`
- `attendance.gs` → Paste into Apps Script `attendance.gs`
- `payments.gs` → Paste into Apps Script `payments.gs`
- `events.gs` → Paste into Apps Script `events.gs`
- `contacts.gs` → Paste into Apps Script `contacts.gs`

---

## Step 5: Update Spreadsheet IDs in Apps Script

**IMPORTANT:** In the Apps Script editor, open `utils.gs` and replace the placeholder IDs:

```javascript
var SPREADSHEET_MAP = {
  students: 'YOUR_STUDENTS_SHEET_ID',        // ← Replace with actual ID
  student_groups: 'YOUR_STUDENT_GROUPS_SHEET_ID',
  attendance: 'YOUR_ATTENDANCE_SHEET_ID',
  payments: 'YOUR_PAYMENTS_SHEET_ID',
  events: 'YOUR_EVENTS_SHEET_ID',
  contacts: 'YOUR_CONTACTS_SHEET_ID'
};
```

Each ID is found in the URL of your spreadsheet.

---

## Step 6: Deploy as Web App

1. In Apps Script editor, click **Deploy** (top right)
2. Click **New deployment**
3. Click the dropdown (⚙️ icon) → select **Web app**
4. **Execute as:** Your Google account
5. **Who has access:** "Anyone" (or "Anyone with a Google account")
6. Click **Deploy**
7. You'll get a **Deployment ID** and a **Web App URL**
8. **Copy the Web App URL** (it looks like: `https://script.google.com/macros/s/DEPLOYMENT_ID/exec`)

---

## Step 7: Update Frontend Config

Go to your frontend code and update `services/config.js`:

```javascript
export const WEB_APP_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
```

Replace `YOUR_DEPLOYMENT_ID` with the actual ID from Step 6.

---

## Step 8: Test the Connection

1. Open your frontend (e.g., via VS Code Live Server)
2. Navigate to the **Students** page
3. Click **+ Add New**
4. Fill in: first_name, last_name
5. Click **Save**
6. Check your **students Google Sheet** — a new row should appear! ✅

If it works, all other pages (payments, contacts, events, attendance, groups) will work too.

---

## Sheet Column Names (Double-Check)

Make sure your Google Sheets have these exact column headers in **Row 1**:

### students sheet:
`student_id | first_name | last_name | email | phone | date_of_birth | enrollment_date | status | family_id | parent_contact_id | notes`

### student_groups sheet:
`id | student_id | group_name | teacher_name | enrollment_date | status`

### attendance sheet:
`attendance_id | student_id | group_name | attendance_date | status | notes`

### payments sheet:
`payment_id | student_id | group_name | amount | payment_date | due_date | status | payment_method | notes`

### events sheet:
`event_id | group_name | title | description | event_date | start_time | end_time | event_type | notes`

### contacts sheet:
`contact_id | name | email | phone | contact_type | status | notes | created_date`

---

## Troubleshooting

**"Sheet not found" error:**
- Check that your Google Sheet names match exactly: `students`, `student_groups`, `attendance`, `payments`, `events`, `contacts`

**"Unauthorized" error:**
- Make sure you deployed as "Anyone" or "Anyone with a Google account"
- Or add your email in the frontend auth (if you implement it)

**"Spreadsheet not found" error:**
- Double-check your Spreadsheet IDs in `utils.gs` SPREADSHEET_MAP

**Nothing appears in the sheet:**
- Check browser DevTools (F12) → Network tab
- See if the API call succeeded (200 status)
- Check Apps Script logs: Script Editor → Executions (clock icon)

---

## Next Steps

Once testing works:
1. Populate your sheets with sample data (if desired)
2. Test all 6 modules (Students, Payments, Contacts, Events, Attendance, Groups)
3. Add more validation or business logic in Apps Script as needed
4. Set up recurring triggers if you need automation (e.g., payment reminders)

