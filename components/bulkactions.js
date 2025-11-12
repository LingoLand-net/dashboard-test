// BulkActionBar Component
export function createBulkActionBar(actions = [], onAction = null) {
  const wrapper = document.createElement('div');
  wrapper.className = 'bulk-action-bar';
  
  wrapper.innerHTML = `
    <div class="bulk-action-container">
      <input type="checkbox" class="select-all" aria-label="Select all">
      <span class="select-count">0 selected</span>
      <div class="action-buttons">
        ${actions.map(action => `
          <button class="btn btn-sm" data-action="${action.id}">
            ${action.icon} ${action.label}
          </button>
        `).join('')}
      </div>
    </div>
  `;
  
  const selectAll = wrapper.querySelector('.select-all');
  const selectCount = wrapper.querySelector('.select-count');
  let selectedCount = 0;
  
  if (onAction) {
    wrapper.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (btn) {
        const actionId = btn.dataset.action;
        const checkedRows = wrapper.parentElement.querySelectorAll('input[type="checkbox"]:checked:not(.select-all)');
        const selectedIds = Array.from(checkedRows).map(cb => cb.dataset.id);
        onAction(actionId, selectedIds);
      }
    });
  }
  
  // Track selections
  const updateCount = () => {
    const checked = wrapper.parentElement.querySelectorAll('input[type="checkbox"]:checked:not(.select-all)');
    selectedCount = checked.length;
    selectCount.textContent = `${selectedCount} selected`;
  };
  
  selectAll.addEventListener('change', (e) => {
    const checkboxes = wrapper.parentElement.querySelectorAll('input[type="checkbox"]:not(.select-all)');
    checkboxes.forEach(cb => cb.checked = e.target.checked);
    updateCount();
  });
  
  return wrapper;
}
