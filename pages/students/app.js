// Students page - complete rebuild with stats, family, groups, payments
import { list as listStudents, create, update, remove } from '../../services/students.js';
import { list as listGroups } from '../../services/groups.js';
import { list as listPayments } from '../../services/payments.js';
import { list as listAttendance } from '../../services/attendance.js';
import { list as listContacts } from '../../services/contacts.js';
import { normalizeStudent, validateStudent } from '../../models/student.js';
import { openModal, closeModal } from '../../components/modal.js';
import { createStatCard, mountStatCards } from '../../components/statcard.js';
import { createSearchBar, createCategoryFilter } from '../../components/filters.js';
import { createMultiSectionForm } from '../../components/formsection.js';
import { logger } from '../../utils/logger.js';

let currentEditId = null;
let allStudents = [];
let allGroups = [];
let allPayments = [];
let allAttendance = [];
let allContacts = [];

export function mountStudentsUI(container = document) {
  const addBtn = container.querySelector('#add-btn');
  const form = container.querySelector('#form-container');
  
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      currentEditId = null;
      populateStudentForm();
      document.querySelector('#modal-title').textContent = 'Add New Student';
      openModal('form-modal');
    });
  }

  if (form) {
    form.addEventListener('submit', handleStudentSubmit);
  }

  // Table row actions
  container.addEventListener('click', e => {
    const editBtn = e.target.closest('[data-edit-student]');
    const deleteBtn = e.target.closest('[data-delete-student]');
    const viewBtn = e.target.closest('[data-view-student]');
    
    if (editBtn) {
      const id = editBtn.dataset.editStudent;
      editStudentRow(id);
    }
    
    if (deleteBtn) {
      const id = deleteBtn.dataset.deleteStudent;
      deleteStudentRow(id);
    }

    if (viewBtn) {
      const id = viewBtn.dataset.viewStudent;
      viewStudentProfile(id);
    }
  });
}

export async function loadStudentsUI(containerSelector = '#students-list') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = '<div class="empty-state"><div class="spinner"></div><div class="empty-state-text">Loading...</div></div>';

  try {
    allStudents = await listStudents();
    allGroups = await listGroups();
    allPayments = await listPayments();
    allAttendance = await listAttendance();
    allContacts = await listContacts();

    renderStudentsDashboard(container);
  } catch (err) {
    logger.error('Failed to load students:', err);
    container.innerHTML = `<div class="alert alert-error">Error loading students: ${err.message}</div>`;
  }
}

function renderStudentsDashboard(container) {
  container.innerHTML = '';

  // Calculate stats
  const totalStudents = allStudents.length;
  const activeStudents = allStudents.filter(s => s.status === 'active').length;
  const graduatingStudents = allStudents.filter(s => s.status === 'graduating').length;
  const totalTuition = allPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const overduePayments = allPayments.filter(p => p.status === 'overdue').length;

  // Stats section
  const statsSection = document.createElement('div');
  statsSection.className = 'dashboard-section';
  const stats = [
    { label: 'Total Students', value: totalStudents, icon: '👥' },
    { label: 'Active', value: activeStudents, icon: '✓', trend: 12 },
    { label: 'Graduating', value: graduatingStudents, icon: '🎓' },
    { label: 'Total Tuition', value: `$${totalTuition.toFixed(2)}`, icon: '💰' },
    { label: 'Overdue', value: overduePayments, icon: '⚠️', trend: -5 }
  ];
  mountStatCards(statsSection, stats);
  container.appendChild(statsSection);

  // Search & Filter section
  const filterSection = document.createElement('div');
  filterSection.className = 'filter-section';
  filterSection.style.display = 'flex';
  filterSection.style.gap = '1rem';
  filterSection.style.marginBottom = '1.5rem';
  filterSection.style.flexWrap = 'wrap';
  
  const searchBar = createSearchBar('Search by name, email, or ID...', (query) => {
    filterAndRenderTable(query, '');
  });

  const statusFilter = createCategoryFilter(
    [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'graduating', label: 'Graduating' }
    ],
    (status) => {
      filterAndRenderTable(searchBar.querySelector('.search-input').value, status);
    }
  );

  filterSection.style.flex = '1';
  searchBar.style.flex = '1';
  statusFilter.style.minWidth = '200px';

  filterSection.appendChild(searchBar);
  filterSection.appendChild(statusFilter);
  container.appendChild(filterSection);

  // Table
  const tableSection = document.createElement('div');
  tableSection.className = 'content-wrapper';
  tableSection.id = 'students-content';
  renderStudentsTable(tableSection, allStudents);
  container.appendChild(tableSection);
}

function filterAndRenderTable(query, status) {
  let filtered = [...allStudents];

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(s => 
      s.first_name.toLowerCase().includes(q) ||
      s.last_name.toLowerCase().includes(q) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      s.student_id.toLowerCase().includes(q)
    );
  }

  if (status) {
    filtered = filtered.filter(s => s.status === status);
  }

  const content = document.querySelector('#students-content');
  renderStudentsTable(content, filtered);
}

function renderStudentsTable(container, data) {
  if (!Array.isArray(data) || data.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">👥</div><div class="empty-state-text">No students found</div></div>';
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'table-wrapper';
  const table = document.createElement('table');
  
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  ['ID', 'Name', 'Email', 'Phone', 'Status', 'Enrollment', 'Actions'].forEach(header => {
    const th = document.createElement('th');
    th.innerText = header;
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  data.forEach(student => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="ID">${student.student_id}</td>
      <td data-label="Name">${student.first_name} ${student.last_name}</td>
      <td data-label="Email">${student.email || '—'}</td>
      <td data-label="Phone">${student.phone || '—'}</td>
      <td data-label="Status"><span class="badge badge-${student.status === 'active' ? 'success' : student.status === 'graduating' ? 'warning' : 'info'}">${student.status}</span></td>
      <td data-label="Enrollment">${student.enrollment_date || '—'}</td>
      <td data-label="Actions">
        <div class="action-buttons">
          <button data-view-student="${student.student_id}" class="btn btn-sm btn-primary" title="View Profile">👁</button>
          <button data-edit-student="${student.student_id}" class="btn btn-sm btn-primary">Edit</button>
          <button data-delete-student="${student.student_id}" class="btn btn-sm btn-danger">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  wrapper.appendChild(table);
  container.innerHTML = '';
  container.appendChild(wrapper);
}

function populateStudentForm(student = {}) {
  const sections = [
    {
      title: 'Basic Information',
      fields: [
        { name: 'first_name', label: 'First Name', type: 'text', required: true, value: student.first_name || '' },
        { name: 'last_name', label: 'Last Name', type: 'text', required: true, value: student.last_name || '' },
        { name: 'email', label: 'Email', type: 'email', value: student.email || '' },
        { name: 'phone', label: 'Phone', type: 'tel', value: student.phone || '' },
      ]
    },
    {
      title: 'Personal Details',
      fields: [
        { name: 'date_of_birth', label: 'Date of Birth', type: 'date', value: student.date_of_birth || '' },
        { name: 'enrollment_date', label: 'Enrollment Date', type: 'date', value: student.enrollment_date || '' },
        { name: 'status', label: 'Status', type: 'select', required: true, options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'graduating', label: 'Graduating' }
        ], value: student.status || 'active' }
      ]
    },
    {
      title: 'Group Assignment',
      fields: [
        { name: 'groups', label: 'Groups', type: 'select', options: allGroups.map(g => ({ value: g.id || g.group_name, label: g.group_name || g.name })), value: '' }
      ]
    },
    {
      title: 'Parent/Guardian Info',
      fields: [
        { name: 'parent_info', label: 'Parent/Guardian', type: 'text', readonly: true, value: student.parent_contact_id ? (allContacts.find(c => c.contact_id === student.parent_contact_id || c.id === student.parent_contact_id)?.name || '(Not found)') : '(None linked - add in Contacts)' }
      ]
    },
    {
      title: 'Additional Notes',
      fields: [
        { name: 'notes', label: 'Notes', type: 'textarea', value: student.notes || '' }
      ]
    }
  ];

  const modal = document.querySelector('#form-modal');
  const body = modal.querySelector('.modal-body');
  body.innerHTML = '';

  const form = createMultiSectionForm(sections);
  body.appendChild(form);
}

async function handleStudentSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const raw = Object.fromEntries(formData);
  
  try {
    const student = normalizeStudent(raw);
    validateStudent(student);

    if (currentEditId) {
      student.student_id = currentEditId;
      await update(student);
      logger.info('Student updated successfully');
    } else {
      student.student_id = 'STU_' + Date.now();
      await create(student);
      logger.info('Student created successfully');
    }

    closeModal('form-modal');
    loadStudentsUI();
  } catch (err) {
    logger.error('Error saving student:', err);
    alert('Error: ' + err.message);
  }
}

async function editStudentRow(id) {
  const student = allStudents.find(s => s.student_id === id);
  if (!student) return alert('Student not found');
  
  currentEditId = id;
  populateStudentForm(student);
  document.querySelector('#modal-title').textContent = `Edit Student: ${student.first_name} ${student.last_name}`;
  openModal('form-modal');
}

async function deleteStudentRow(id) {
  if (!confirm('Are you sure you want to delete this student?')) return;
  
  try {
    await remove(id);
    logger.info('Student deleted successfully');
    loadStudentsUI();
  } catch (err) {
    logger.error('Error deleting student:', err);
    alert('Error: ' + err.message);
  }
}

function viewStudentProfile(id) {
  const student = allStudents.find(s => s.student_id === id);
  if (!student) return alert('Student not found');

  const studentPayments = allPayments.filter(p => p.student_id === id);
  const studentAttendance = allAttendance.filter(a => a.student_id === id);
  const studentGroups = allGroups.filter(g => g.student_id === id);

  const attendanceRate = studentAttendance.length > 0 
    ? Math.round((studentAttendance.filter(a => a.status === 'present').length / studentAttendance.length) * 100)
    : 0;

  const html = `
    <div class="profile-view">
      <div class="profile-header">
        <h3>${student.first_name} ${student.last_name}</h3>
        <p class="profile-id">ID: ${student.student_id}</p>
      </div>

      <div class="profile-grid">
        <div class="profile-card">
          <h4>Contact Information</h4>
          <p><strong>Email:</strong> ${student.email || 'N/A'}</p>
          <p><strong>Phone:</strong> ${student.phone || 'N/A'}</p>
          <p><strong>DOB:</strong> ${student.date_of_birth || 'N/A'}</p>
        </div>

        <div class="profile-card">
          <h4>Enrollment</h4>
          <p><strong>Status:</strong> <span class="badge badge-${student.status === 'active' ? 'success' : 'warning'}">${student.status}</span></p>
          <p><strong>Enrolled:</strong> ${student.enrollment_date || 'N/A'}</p>
        </div>

        <div class="profile-card">
          <h4>Academic Performance</h4>
          <p><strong>Groups:</strong> ${studentGroups.length}</p>
          <p><strong>Attendance Rate:</strong> ${attendanceRate}%</p>
        </div>

        <div class="profile-card">
          <h4>Finances</h4>
          <p><strong>Total Paid:</strong> $${studentPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0).toFixed(2)}</p>
          <p><strong>Pending:</strong> $${studentPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0).toFixed(2)}</p>
        </div>
      </div>

      <div class="profile-section">
        <h4>Groups (${studentGroups.length})</h4>
        <ul>${studentGroups.length > 0 ? studentGroups.map(g => `<li>${g.group_name} - ${g.teacher_name || 'TBD'}</li>`).join('') : '<li>No groups</li>'}</ul>
      </div>

      <div class="profile-section">
        <h4>Recent Payments (${studentPayments.length})</h4>
        <ul>${studentPayments.length > 0 ? studentPayments.slice(-5).map(p => `<li>${p.payment_date}: $${p.amount} (${p.status})</li>`).join('') : '<li>No payments</li>'}</ul>
      </div>
    </div>
  `;

  const modal = document.querySelector('#form-modal');
  modal.querySelector('.modal-header').innerHTML = `<h3 class="modal-title">Student Profile</h3><button class="modal-close" data-modal-close="form-modal">&times;</button>`;
  modal.querySelector('.modal-body').innerHTML = html;
  openModal('form-modal');
}
