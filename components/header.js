// Minimal mount code for header.html fragment
export function mountHeader(container) {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) return;

  // delegate simple interactions (e.g., logout button)
  el.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === 'logout') {
      // Basic example: clear local state and reload
      localStorage.removeItem('session');
      window.location.reload();
    }
  });
}
