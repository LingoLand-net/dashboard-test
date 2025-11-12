// Groups - Data loading entry point
export async function loadGroupsUI(containerSelector) {
  const { loadGroupsUI: loadUI } = await import('./app.js');
  return loadUI(containerSelector);
}

