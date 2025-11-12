// Attendance - Data loading entry point
export async function loadAttendance(containerSelector) {
  const { loadAttendanceUI } = await import('./app.js');
  return loadAttendanceUI(containerSelector);
}

