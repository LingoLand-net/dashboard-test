// Payments - Data loading entry point
export async function loadPayments(containerSelector) {
  const { loadPaymentsUI } = await import('./app.js');
  return loadPaymentsUI(containerSelector);
}

