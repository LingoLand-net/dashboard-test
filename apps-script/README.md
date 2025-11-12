# Apps Script API contract (expected endpoints)

This file describes the minimal set of endpoints the frontend expects your Google Apps Script Web App to implement. You will deploy your Apps Script and use the published Web App URL in `services/config.js`.

Recommended routes (use query param `resource` and `action`, or a path style you prefer):

- GET /?resource=students&action=list
  - returns: { ok: true, data: [ { student... } ] }
- POST /?resource=students&action=create
  - body: { student: { first_name, last_name, ... } }
  - returns: { ok: true, data: { student_id, ... } }
- POST /?resource=students&action=update
  - body: { student: { student_id, ... } }

- Similar pattern for `student_groups`, `attendance`, `payments`, `events`, `contacts`.

Security
- Use Google's authentication checks (Session.getActiveUser() or PropertiesService) as needed. If your frontend will be public to parents, add appropriate auth on the server.

Implementation note
- Return JSON string from doGet/doPost handlers, and set correct CORS headers if needed.
- Example GAS router: read `resource` and `action`, route to sheet-specific functions.
