// Dashboard - Data loading entry point
export async function loadDashboard(containerSelector) {
  const { loadDashboard: loadDashboardUI } = await import('./app.js');
  return loadDashboardUI(containerSelector);
}
