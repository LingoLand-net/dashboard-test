This database is implemented using **Google Sheets** with **Apps Script and API integrations**.  
It is optimized for simplicity, scalability, and data linking between sheets, this is what ill use moving on.

---

## Table Overview

| Sheet | Purpose |
|--------|----------|
| students | Core student data and profile management, add delete update while accessing all the other sheets to get attendance payments groups etc.. |
| student_groups | Connects students to multiple groups (many-to-many) |
| attendance | Tracks presence and absences per group and date |
| payments | Tracks tuition or session payments |
| events | Stores classes, managing schedules or holidays, Group reschedules or makeup sessions Holidays or canceled days |
| contacts | Manages parents, leads, and prospects |

---

## Relationships

- **students ↔ student_groups** → One student can join multiple groups.
- **student_groups → attendance** → Each group tracks daily attendance.
- **student_groups → payments** → Payments can be tracked per group.
- **students ↔ contacts** → One contact (parent) can be linked to multiple students via `parent_contact_id`.
- **groups/teachers** are configured in **Config sheet** or hard-coded in Apps Script.

---

## Notes

- Each sheet uses a `*_id` field as a **primary key**.
- `student_id` is the main link between most sheets.
- Add-on: A **Config** sheet can store teacher and group lists for dropdowns and automation.
- Auto-fields like `created_date` or `enrollment_date` can be filled using Apps Script triggers.

---

## Example Automation Ideas

- On form submission → auto-generate `student_id` and `enrollment_date`.
- When marking attendance → Apps Script can validate that the student belongs to that group.
- Payment reminders → automatically detect overdue payments by comparing `due_date` and `status`.



structure workbook
```yml
Google sheets
├── 📄 students
│    Columns:
│    A: student_id
│    B: first_name
│    C: last_name
│    D: email
│    E: phone
│    F: date_of_birth
│    G: enrollment_date
│    H: status
│    I: family_id
│    J: parent_contact_id
│    K: notes
│
├── 📄 student_groups
│    Columns:
│    A: id
│    B: student_id
│    C: group_name
│    D: teacher_name
│    E: enrollment_date
│    F: status
│
├── 📄 attendance
│    Columns:
│    A: attendance_id
│    B: student_id
│    C: group_name
│    D: attendance_date
│    E: status
│    F: notes
│
├── 📄 payments
│    Columns:
│    A: payment_id
│    B: student_id
│    C: group_name
│    D: amount
│    E: payment_date
│    F: due_date
│    G: status
│    H: payment_method
│    I: notes
│
├── 📄 events
│    Columns:
│    A: event_id
│    B: group_name
│    C: title
│    D: description
│    E: event_date
│    F: start_time
│    G: end_time
│    H: event_type
│    I: notes
│
├── 📄 contacts
│    Columns:
│    A: contact_id
│    B: name
│    C: email
│    D: phone
│    E: contact_type
│    F: status
│    G: notes
│    H: created_date
│
└── ⚙️ Config (instead of hard-coding values inside scripts, i'll keep them editable in the Config sheet)
     Columns:
     A: group_name
     B: teacher_name
     C: level
     D: schedule_day
     E: schedule_time

```
