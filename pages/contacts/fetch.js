// Contacts - Data loading entry point
export async function loadContacts(containerSelector) {
  const { loadContactsUI } = await import('./app.js');
  return loadContactsUI(containerSelector);
}

