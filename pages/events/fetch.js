// Events - Data loading entry point
export async function loadEvents(containerSelector) {
  const { loadEventsUI } = await import('./app.js');
  return loadEventsUI(containerSelector);
}