// FormSection Component - for multi-section forms
export function createFormSection(title, fields = []) {
  const section = document.createElement('fieldset');
  section.className = 'form-section';
  
  section.innerHTML = `
    <legend class="form-section-title">${title}</legend>
    <div class="form-section-content">
      ${fields.map(field => createFormField(field)).join('')}
    </div>
  `;
  
  return section;
}

// Individual FormField helper
export function createFormField(field) {
  const { name, label, type = 'text', required = false, readonly = false, options = [], value = '' } = field;
  
  let input;
  
  if (type === 'select') {
    input = `
      <select name="${name}" ${required ? 'required' : ''} ${readonly ? 'disabled' : ''}>
        <option value="">-- Select --</option>
        ${options.map(opt => `<option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
      </select>
    `;
  } else if (type === 'textarea') {
    input = `<textarea name="${name}" ${required ? 'required' : ''} ${readonly ? 'readonly' : ''} rows="3">${value}</textarea>`;
  } else {
    input = `<input type="${type}" name="${name}" value="${value}" ${required ? 'required' : ''} ${readonly ? 'readonly' : ''}>`;
  }
  
  return `
    <div class="form-group">
      <label for="${name}">${label}${required ? ' *' : ''}</label>
      ${input}
    </div>
  `;
}

// MultiSection form builder
export function createMultiSectionForm(sections = []) {
  const form = document.createElement('form');
  form.className = 'form multi-section-form';
  form.id = 'form-container';
  
  sections.forEach(section => {
    form.appendChild(createFormSection(section.title, section.fields));
  });
  
  return form;
}
