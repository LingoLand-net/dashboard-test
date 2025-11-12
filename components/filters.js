// SearchBar Component
export function createSearchBar(placeholder = 'Search...', onSearch = null) {
  const wrapper = document.createElement('div');
  wrapper.className = 'search-bar-wrapper';
  
  wrapper.innerHTML = `
    <div class="search-bar">
      <input 
        type="text" 
        class="search-input" 
        placeholder="${placeholder}"
        aria-label="Search"
      >
      <span class="search-icon">🔍</span>
    </div>
  `;
  
  const input = wrapper.querySelector('.search-input');
  
  if (onSearch) {
    let timeout;
    input.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        onSearch(e.target.value);
      }, 300);
    });
  }
  
  return wrapper;
}

// CategoryFilter Component
export function createCategoryFilter(options = [], onChange = null) {
  const wrapper = document.createElement('div');
  wrapper.className = 'filter-wrapper';
  
  wrapper.innerHTML = `
    <select class="filter-select" aria-label="Filter by category">
      <option value="">All Categories</option>
      ${options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
    </select>
  `;
  
  const select = wrapper.querySelector('.filter-select');
  
  if (onChange) {
    select.addEventListener('change', (e) => {
      onChange(e.target.value);
    });
  }
  
  return wrapper;
}
