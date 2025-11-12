// Tiny modal controller to open/close modal fragments
export function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

export function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

export function mountModalButtons(container = document) {
  container.addEventListener('click', e => {
    const btn = e.target.closest('[data-modal-close]');
    if (btn) {
      const id = btn.dataset.modalClose;
      closeModal(id);
    }
  });
}
