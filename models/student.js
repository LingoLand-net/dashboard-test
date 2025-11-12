// Basic normalization and validation for Student objects
export function normalizeStudent(raw = {}) {
  return {
    student_id: String(raw.student_id ?? '').trim(),
    first_name: String(raw.first_name ?? '').trim(),
    last_name: String(raw.last_name ?? '').trim(),
    email: raw.email ? String(raw.email).toLowerCase().trim() : '',
    phone: String(raw.phone ?? '').trim(),
    date_of_birth: raw.date_of_birth || null,
    enrollment_date: raw.enrollment_date || null,
    status: raw.status || 'active',
    family_id: raw.family_id || null,
    parent_contact_id: raw.parent_contact_id || null,
    notes: raw.notes || '',
  };
}

export function validateStudent(s) {
  if (!s.first_name) throw new Error('first_name is required');
  if (!s.last_name) throw new Error('last_name is required');
  return true;
}
