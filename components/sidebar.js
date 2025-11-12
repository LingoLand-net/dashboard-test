// Simple wiring for sidebar interactions
export function mountSidebar(container) {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) return;

  el.addEventListener('click', e => {
    const link = e.target.closest('[data-nav]');
    if (!link) return;
    e.preventDefault();
    const page = link.dataset.nav;
    // dispatch a simple navigation event
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page } }));
  });
}
