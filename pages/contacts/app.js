// Contacts - Search and filter by student or contact
import { createSearchBar, createCategoryFilter } from '../../components/filters.js';
import { logger } from '../../utils/logger.js';
import { apiCall } from '../../services/api.js';

let allContacts = [];
let allStudents = [];
let contactsByStudent = {}; // Map of student_id -> [contacts]

export function mountContactsUI(container = document) {
  const addBtn = container.querySelector('#add-btn');
  if (addBtn) addBtn.style.display = 'none';
}

export async function loadContactsUI(containerSelector = '#contacts-list') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = '<div class="empty-state"><div class="spinner"></div></div>';

  try {
    const [contactsRes, studentsRes] = await Promise.all([
      apiCall('contacts', 'list', {}),
      apiCall('students', 'list', {})
    ]);
    
    allContacts = contactsRes.data || [];
    allStudents = studentsRes.data || [];
    
    // Build contacts by student map
    contactsByStudent = {};
    allStudents.forEach(student => {
      const parentId = student.parent_contact_id;
      if (parentId) {
        const parent = allContacts.find(c => c.contact_id === parentId);
        if (parent) {
          if (!contactsByStudent[student.student_id]) {
            contactsByStudent[student.student_id] = [];
          }
          contactsByStudent[student.student_id].push({
            ...parent,
            student_name: `${student.first_name} ${student.last_name}`,
            student_id: student.student_id
          });
        }
      }
    });
    
    renderContactsUI(container);
  } catch (err) {
    logger.error('Failed to load contacts:', err);
    container.innerHTML = `<div class="alert alert-error">Error: ${err.message}</div>`;
  }
}

function renderContactsUI(container) {
  container.innerHTML = '';

  // Search and filter
  const filterSection = document.createElement('div');
  filterSection.className = 'filter-section';
  
  const searchBar = createSearchBar('Search by student or parent name...', (query) => {
    filterContacts(query, container);
  });
  
  const typeFilter = createCategoryFilter(
    [
      { value: '', label: 'All Types' },
      { value: 'Parent', label: 'Parents' },
      { value: 'Emergency', label: 'Emergency' }
    ],
    (type) => filterContacts('', container, type)
  );
  
  filterSection.appendChild(searchBar);
  filterSection.appendChild(typeFilter);
  container.appendChild(filterSection);

  // Table section
  const tableSection = document.createElement('div');
  tableSection.className = 'dashboard-section';
  tableSection.id = 'contacts-table';
  container.appendChild(tableSection);

  renderContactsTable(tableSection, allContacts);
}

function filterContacts(query, container, type) {
  let filtered = allContacts.map(contact => {
    // Find which student(s) this contact is linked to
    const linkedStudents = Object.entries(contactsByStudent)
      .filter(([_, contacts]) => contacts.some(c => c.contact_id === contact.contact_id))
      .map(([_, contacts]) => contacts[0]?.student_name)
      .filter(Boolean);
    
    return {
      ...contact,
      linked_students: linkedStudents.join(', ')
    };
  });
  
  if (query) {
    filtered = filtered.filter(c =>
      c.name?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.phone?.includes(query) ||
      c.linked_students?.toLowerCase().includes(query)
    );
  }
  
  if (type) {
    filtered = filtered.filter(c => c.type === type);
  }

  const tableSection = container.querySelector('#contacts-table');
  renderContactsTable(tableSection, filtered);
}

function renderContactsTable(container, contacts) {
  if (!contacts || contacts.length === 0) {
    container.innerHTML = '<div class="empty-state">No contacts found</div>';
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'table-wrapper';
  const table = document.createElement('table');
  table.className = 'table';
  
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['Parent Name', 'Student Name', 'Email', 'Phone', 'Type'].forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  contacts.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="Parent Name"><strong>${c.name}</strong></td>
      <td data-label="Student Name">${c.linked_students || '—'}</td>
      <td data-label="Email">${c.email || '—'}</td>
      <td data-label="Phone">${c.phone || '—'}</td>
      <td data-label="Type"><span class="badge badge-info">${c.type || 'parent'}</span></td>
    `;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  wrapper.appendChild(table);
  container.innerHTML = '';
  container.appendChild(wrapper);
}
