// Attendance model helper
export function normalizeAttendance(raw = {}) {
  return {
    attendance_id: String(raw.attendance_id ?? '').trim(),
    student_id: String(raw.student_id ?? '').trim(),
    group_name: raw.group_name || '',
    attendance_date: raw.attendance_date || null,
    status: raw.status || 'present',
    notes: raw.notes || '',
  };
}

export function validateAttendance(a) {
  if (!a.student_id) throw new Error('student_id is required');
  if (!a.attendance_date) throw new Error('attendance_date is required');
  const validStatuses = ['present', 'absent', 'late', 'excused'];
  if (!validStatuses.includes(a.status)) throw new Error(`status must be one of: ${validStatuses.join(', ')}`);
  return true;
}
