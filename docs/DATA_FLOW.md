# Data Flow Diagrams

## Complete CRUD Flow Example: Create a Student

```
FRONTEND (Browser)                    BACKEND (Google Apps Script)         STORAGE (Google Sheets)
═════════════════════════════════════════════════════════════════════════════════════════════════════

User clicks "+ Add New"
    ↓
Modal opens with form
(first_name, last_name, email, phone, etc.)
    ↓
User fills: first_name="Ahmed", last_name="Khan"
User clicks "Save"
    ↓
pages/students/app.js
handleStudentSubmit()
    ├─ Validate (first_name & last_name required) ✓
    ├─ Call services/students.js → create()
    │       ↓
    │   services/api.js → request()
    │       ├─ URL: "?resource=students&action=create"
    │       ├─ Method: POST
    │       └─ Body: {student: {first_name:"Ahmed", last_name:"Khan"}}
    │               ↓
    │               ═══════════════════════════════════════════════════════
    │               │
    │               ↓ CROSSES INTERNET BOUNDARY
    │
    │               Code.gs
    │               doPost(e)
    │                   ├─ Parse: resource="students", action="create"
    │                   ├─ Call: students_create(params, body, e)
    │                   │       ↓
    │                   │   students.gs
    │                   │   students_create(params, body, e)
    │                   │       ├─ Extract: body.student
    │                   │       ├─ Generate: student_id = "stu_abc123"
    │                   │       ├─ Call: appendRow("students", {...}, "students")
    │                   │       │       ↓
    │                   │       │   utils.gs
    │                   │       │   appendRow(sheetName, obj, resource)
    │                   │       │       ├─ Get spreadsheet ID from SPREADSHEET_MAP
    │                   │       │       ├─ Get sheet: "students"
    │                   │       │       ├─ Get headers: [student_id, first_name, last_name, ...]
    │                   │       │       ├─ Build row: ["stu_abc123", "Ahmed", "Khan", ...]
    │                   │       │       └─ sheet.appendRow(row)
    │                   │       │               ↓
    │                   │       │               ════════════════════════════════════
    │                   │       │               │
    │                   │       │               ↓ ROW ADDED TO SHEET
    │                   │       │
    │                   │       │               students sheet:
    │                   │       │               ┌──────────────┬────────────┬──────────┐
    │                   │       │               │ student_id   │ first_name │ last_name│
    │                   │       │               ├──────────────┼────────────┼──────────┤
    │                   │       │               │ stu_abc123   │ Ahmed      │ Khan     │
    │                   │       │               └──────────────┴────────────┴──────────┘
    │                   │       │               ↑ NEW ROW
    │                   │       │
    │                   │       └─ Return: {ok: true, data: {student_id: "stu_abc123", ...}}
    │                   │
    │                   └─ Return response as JSON
    │               ↓ CROSSES INTERNET BOUNDARY
    │               ═══════════════════════════════════════════════════════
    │               │
    ├─ Receive response
│   {ok: true, data: {student_id: "stu_abc123", first_name: "Ahmed", last_name: "Khan"}}
    ├─ Close modal
    ├─ Call loadStudents() to refresh table
    │       ↓
    │   services/students.js → list()
    │       ↓
    │   services/api.js → request()
    │       ├─ URL: "?resource=students&action=list"
    │       ├─ Method: GET
    │       │       ↓
    │       │       ═══════════════════════════════════════════════════════
    │       │       │
    │       │       ↓ Code.gs → students_list()
    │       │       ├─ Call getSheetValues("students", "students")
    │       │       │       ↓
    │       │       │   utils.gs
    │       │       │   getSheetValues(sheetName, resource)
    │       │       │       ├─ Get spreadsheet
    │       │       │       ├─ Get sheet: "students"
    │       │       │       ├─ Read all rows
    │       │       │       ├─ Convert to array of objects:
    │       │       │       │   [
    │       │       │       │     {student_id:"stu_abc123", first_name:"Ahmed", ...},
    │       │       │       │     {student_id:"stu_def456", first_name:"Sara", ...}
    │       │       │       │   ]
    │       │       │       └─ Return
    │       │       │
    │       │       └─ Return {ok: true, data: [...]}
    │       │       ↓ CROSSES INTERNET BOUNDARY
    │       │       ═══════════════════════════════════════════════════════
    │       │
    ├─ Receive data
    ├─ Call renderTable(container, data)
    │       ├─ Create <table> element
    │       ├─ Add headers
    │       ├─ For each student, add row:
    │       │   <tr>
    │       │     <td>stu_abc123</td>
    │       │     <td>Ahmed</td>
    │       │     <td>Khan</td>
    │       │     <td>
    │       │       <button data-edit-student="stu_abc123">Edit</button>
    │       │       <button data-delete-student="stu_abc123">Delete</button>
    │       │     </td>
    │       │   </tr>
    │       └─ Append to DOM
    └─ Page displays new student in table ✓
```

---

## Edit Flow

```
User sees new student "Ahmed Khan" in table
User clicks "Edit" button
    ↓
Modal opens with form pre-filled with Ahmed's data
User changes last_name="King"
User clicks "Save"
    ↓
handleStudentSubmit()
    ├─ Validate ✓
    ├─ Call services/students.js → update()
    │       ├─ service/api.js → request()
    │       │   POST ?resource=students&action=update
    │       │   Body: {student: {student_id: "stu_abc123", last_name: "King", ...}}
    │       │       ↓
    │       │   Code.gs → students_update()
    │       │       ├─ Find row with student_id="stu_abc123"
    │       │       │   findRowIndexById("students", "student_id", "stu_abc123")
    │       │       │   → Returns row number (e.g., row 2)
    │       │       ├─ Update that row
    │       │       │   updateRowByIndex(2, {last_name: "King"}, ...)
    │       │       │   → Updates column B in row 2
    │       │       └─ Return {ok: true, data: {...}}
    │       │           ↓
    │       └─ Response received
    ├─ Close modal
    ├─ Refresh table (same as List flow above)
    └─ Table updates: "Ahmed King" is now displayed ✓

Google Sheet now shows:
    ┌──────────────┬────────────┬──────────┐
    │ student_id   │ first_name │ last_name│
    ├──────────────┼────────────┼──────────┤
    │ stu_abc123   │ Ahmed      │ King     │ ← CHANGED
    └──────────────┴────────────┴──────────┘
```

---

## Delete Flow

```
User clicks "Delete" button on Ahmed's row
    ↓
Confirmation dialog: "Are you sure?"
User clicks "Yes"
    ↓
deleteStudentRow("stu_abc123")
    ├─ Call services/students.js → remove()
    │       ├─ service/api.js → request()
    │       │   POST ?resource=students&action=delete
    │       │   Body: {student: {student_id: "stu_abc123"}}
    │       │       ↓
    │       │   Code.gs → students_delete()
    │       │       ├─ Find row index for student_id="stu_abc123"
    │       │       │   → Row 2
    │       │       ├─ Delete that row
    │       │       │   sheet.deleteRow(2)
    │       │       └─ Return {ok: true}
    │       │           ↓
    │       └─ Response received
    ├─ Close modal (if open)
    ├─ Refresh table
    └─ Ahmed is removed from display ✓

Google Sheet now shows:
    ┌──────────────┬────────────┬──────────┐
    │ student_id   │ first_name │ last_name│
    ├──────────────┼────────────┼──────────┤
    │ stu_def456   │ Sara       │ Ahmed    │ ← ONLY ROW LEFT
    └──────────────┴────────────┴──────────┘
```

---

## API Request Format

### CREATE Request
```
POST /macros/s/DEPLOYMENT_ID/exec

{
  "resource": "students",
  "action": "create",
  "student": {
    "first_name": "Ahmed",
    "last_name": "Khan",
    "email": "ahmed@example.com",
    "phone": "+1-234-567-8900"
  }
}

Response:
{
  "ok": true,
  "data": {
    "student_id": "stu_abc123",
    "first_name": "Ahmed",
    "last_name": "Khan",
    "email": "ahmed@example.com",
    "phone": "+1-234-567-8900"
  }
}
```

### READ (List) Request
```
GET /macros/s/DEPLOYMENT_ID/exec?resource=students&action=list

Response:
{
  "ok": true,
  "data": [
    {
      "student_id": "stu_abc123",
      "first_name": "Ahmed",
      "last_name": "Khan",
      "email": "ahmed@example.com",
      ...
    },
    {
      "student_id": "stu_def456",
      "first_name": "Sara",
      "last_name": "Ahmed",
      ...
    }
  ]
}
```

### UPDATE Request
```
POST /macros/s/DEPLOYMENT_ID/exec

{
  "resource": "students",
  "action": "update",
  "student": {
    "student_id": "stu_abc123",
    "last_name": "King"
  }
}

Response:
{
  "ok": true,
  "data": {
    "student_id": "stu_abc123",
    "last_name": "King"
  }
}
```

### DELETE Request
```
POST /macros/s/DEPLOYMENT_ID/exec

{
  "resource": "students",
  "action": "delete",
  "student": {
    "student_id": "stu_abc123"
  }
}

Response:
{
  "ok": true
}
```

---

## URL Query Parameters (Alternative Format)

You can also use query params instead of POST body:

```
GET /macros/s/DEPLOYMENT_ID/exec?resource=students&action=list

GET /macros/s/DEPLOYMENT_ID/exec?resource=students&action=read&student_id=stu_abc123

POST /macros/s/DEPLOYMENT_ID/exec?resource=students&action=delete&student_id=stu_abc123
(with student_id in both URL and body)
```

Currently, the frontend uses the **POST body method** (more secure, handles complex data).

