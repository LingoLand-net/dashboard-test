# Lingoville Dashboard — Complete Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Your Computer)                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Browser (index.html + main.js + pages)                      │   │
│  │ ✓ Students, Payments, Contacts, Events, Attendance, Groups │   │
│  │ ✓ Add/Edit/Delete forms with validation                    │   │
│  │ ✓ Real-time table rendering                                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                            ↓ (API calls)                             │
│                    services/api.js                                   │
│               (centralized HTTP client)                              │
│                            ↓                                         │
└──────────────────────────────────────────────────────────────────────┘
                          INTERNET
                             ↓
┌──────────────────────────────────────────────────────────────────────┐
│              BACKEND (Google Apps Script + Sheets)                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Google Apps Script Web App (deployed)                       │   │
│  │ ✓ Code.gs (router: handles requests)                       │   │
│  │ ✓ utils.gs (helpers: read/write sheets)                    │   │
│  │ ✓ students.gs, payments.gs, etc. (CRUD handlers)           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                            ↓                                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Google Sheets (6 separate spreadsheets)                     │   │
│  │ ✓ students (with student_id primary key)                   │   │
│  │ ✓ student_groups (joins students to groups)                │   │
│  │ ✓ attendance (tracks presence)                             │   │
│  │ ✓ payments (tracks tuition)                                │   │
│  │ ✓ events (classes, holidays, reschedules)                  │   │
│  │ ✓ contacts (parents, leads, prospects)                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## API Request Flow

### Example: Add a Student

```
1. USER ACTION (Frontend)
   └─ Clicks "+ Add New" on Students page
   └─ Fills form: first_name="Ahmed", last_name="Khan"
   └─ Clicks "Save"

2. FRONTEND (main.js → pages/students/app.js)
   └─ Validates form (first_name & last_name required)
   └─ Calls services/students.js
   └─ Calls api.js

3. HTTP REQUEST
   POST https://script.google.com/macros/s/DEPLOYMENT_ID/exec
   Body: {
     "resource": "students",
     "action": "create",
     "student": {
       "first_name": "Ahmed",
       "last_name": "Khan",
       "email": "",
       "phone": ""
     }
   }

4. BACKEND (Google Apps Script)
   └─ Code.gs receives request
   └─ Calls: students_create(params, body, e)
   └─ students.gs handles: generateId, validation
   └─ utils.gs calls appendRow() → adds row to 'students' sheet

5. GOOGLE SHEETS
   └─ New row added: [stu_abc123, Ahmed, Khan, ...]

6. RESPONSE
   {
     "ok": true,
     "data": {
       "student_id": "stu_abc123",
       "first_name": "Ahmed",
       "last_name": "Khan",
       ...
     }
   }

7. FRONTEND UPDATE
   └─ Modal closes
   └─ Page refreshes (calls loadStudents)
   └─ New student appears in table ✓
```

---

## Key Connections

| Frontend | Backend | Google Sheet |
|----------|---------|--------------|
| `pages/students/app.js` | `students.gs` | `students` sheet |
| `pages/payments/app.js` | `payments.gs` | `payments` sheet |
| `pages/contacts/app.js` | `contacts.gs` | `contacts` sheet |
| `pages/events/app.js` | `events.gs` | `events` sheet |
| `pages/attendance/app.js` | `attendance.gs` | `attendance` sheet |
| `pages/groups/app.js` | `student_groups.gs` | `student_groups` sheet |

---

## Setup Checklist

- [ ] **Created 6 Google Sheets** with correct column headers
- [ ] **Copied all `.gs` files** into Apps Script editor
- [ ] **Updated spreadsheet IDs** in `utils.gs` SPREADSHEET_MAP
- [ ] **Deployed Apps Script** as Web App (get deployment URL)
- [ ] **Updated `services/config.js`** with Web App URL
- [ ] **Test: Add student** → Check Google Sheet for new row
- [ ] **Test: Edit student** → Update row in Google Sheet
- [ ] **Test: Delete student** → Delete row from Google Sheet
- [ ] **Test: All other modules** (payments, contacts, events, attendance, groups)

---

## Column Mapping (Frontend ↔ Backend ↔ Sheet)

### Students Example:
```
Frontend Form Field    →  API Request Field  →  Sheet Column
first_name             →  student.first_name →  first_name
last_name              →  student.last_name  →  last_name
email                  →  student.email      →  email
phone                  →  student.phone      →  phone
```

### Important:
- **IDs are auto-generated** by Apps Script (e.g., `stu_abc123`)
- **Don't manually enter IDs** in frontend forms
- IDs are returned after create and used for edit/delete

---

## Debugging Tips

### Check what's being sent:
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try add/edit/delete action
4. Click on the request → **Payload** tab
5. See what JSON is being sent

### Check what's being received:
1. In **Network** tab, click request
2. Go to **Response** tab
3. See the response from Apps Script

### Check Apps Script logs:
1. Open **Google Apps Script editor**
2. Click **Executions** (clock icon, left side)
3. See successful / failed requests
4. Click on a failed request to see error details

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Cannot read property 'first_name'" | Check that form data is being sent correctly (Network tab → Payload) |
| "Sheet 'students' not found" | Rename your Google Sheet to `students` (exact match, case-sensitive) |
| "Spreadsheet ID not found" | Double-check IDs in `utils.gs` SPREADSHEET_MAP — copy from URL exactly |
| Data not saving | Check Apps Script Executions log for errors |
| Frontend can't reach backend | Verify Web App URL is correct in `services/config.js` |
| "Unauthorized" error | Make sure Apps Script deployed with "Anyone" access |

---

## Next Steps

1. **Follow the step-by-step guide** in `APPS_SCRIPT_SETUP.md`
2. **Deploy Apps Script** and get Web App URL
3. **Update frontend config** with Web App URL
4. **Test the flow** by adding a student
5. **Populate test data** in each sheet (optional)
6. **Add more validation/business logic** as needed

---

## Files Location

```
Frontend Code:
├── index.html                      (main page structure)
├── main.js                         (routing & page loading)
├── services/
│   ├── api.js                      (HTTP client)
│   ├── config.js                   (Web App URL) ← UPDATE THIS
│   └── {students,payments,...}.js  (API wrappers)
└── pages/
    ├── students/
    │   ├── fetch.js               (load & render table)
    │   └── app.js                 (form handling)
    └── {payments,contacts,...}/   (similar structure)

Backend Code:
└── api/gas/
    ├── Code.gs                    (router)
    ├── utils.gs                   (helpers) ← UPDATE IDs HERE
    ├── auth.gs                    (authentication)
    └── {students,payments,...}.gs (CRUD handlers)

Documentation:
└── docs/
    ├── DB-structure.md            (database design)
    ├── APPS_SCRIPT_SETUP.md       (step-by-step setup)
    └── ARCHITECTURE.md            (this file)
```

