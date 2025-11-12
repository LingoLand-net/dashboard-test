// Groups page app - handles create/edit/delete UI
import { create, update, remove, list as listGroups } from '../../services/groups.js';
import { list as listStudents } from '../../services/students.js';
import { openModal, closeModal } from '../../components/modal.js';
import { logger } from '../../utils/logger.js';

let currentEditId = null;
let allGroups = [];
let allStudents = [];

export function mountGroupsUI(container = document) {
  const addBtn = container.querySelector('#add-btn');
  const form = container.querySelector('#form-container');
  
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      currentEditId = null;
      populateGroupForm();
      document.querySelector('#modal-title').textContent = 'Add New Group';
      openModal('form-modal');
    });
  }

  if (form) {
    form.addEventListener('submit', handleGroupSubmit);
  }

  container.addEventListener('click', e => {
    const editBtn = e.target.closest('[data-edit-group]');
    const deleteBtn = e.target.closest('[data-delete-group]');
    
    if (editBtn) editGroupRow(editBtn.dataset.editGroup);
    if (deleteBtn) deleteGroupRow(deleteBtn.dataset.deleteGroup);
  });
}

export async function loadGroupsUI(containerSelector = '#groups-list') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = '<div class="empty-state"><div class="spinner"></div><div class="empty-state-text">Loading...</div></div>';

  try {
    allGroups = await listGroups();
    allStudents = await listStudents();
    renderGroupsList(container);
  } catch (err) {
    logger.error('Failed to load groups:', err);
    container.innerHTML = `<div class="alert alert-error">Error loading groups: ${err.message}</div>`;
  }
}

function renderGroupsList(container) {
  container.innerHTML = '';

  if (allGroups.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No groups yet. Click "+ Add New" to create one.</p></div>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'data-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Group Name</th>
        <th>Level</th>
        <th>Students</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${allGroups.map(group => {
        return `
          <tr>
            <td>${group.group_name || '-'}</td>
            <td>${group.level || '-'}</td>
            <td>${group.student_count || 0}</td>
            <td><span class="badge badge-${group.status === 'active' ? 'success' : 'secondary'}">${group.status || 'active'}</span></td>
            <td>
              <button data-edit-group="${group.group_name}" class="btn btn-sm btn-secondary">Edit</button>
              <button data-delete-group="${group.group_name}" class="btn btn-sm btn-danger">Delete</button>
            </td>
          </tr>
        `;
      }).join('')}
    </tbody>
  `;

  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'content-wrapper';
  contentWrapper.appendChild(table);
  container.appendChild(contentWrapper);
}

function populateGroupForm(group = {}) {
  const form = document.querySelector('#form-container');
  form.innerHTML = `
    <div class="form-group">
      <label for="group_name">Group Name *</label>
      <input type="text" id="group_name" name="group_name" value="${group.group_name || ''}" required>
    </div>
    <div class="form-group">
      <label for="level">Level</label>
      <input type="text" id="level" name="level" placeholder="e.g., Beginner, Intermediate, Advanced" value="${group.level || ''}">
    </div>
    <div class="form-group">
      <label for="status">Status</label>
      <select id="status" name="status">
        <option value="active" ${group.status === 'active' ? 'selected' : ''}>Active</option>
        <option value="inactive" ${group.status === 'inactive' ? 'selected' : ''}>Inactive</option>
        <option value="completed" ${group.status === 'completed' ? 'selected' : ''}>Completed</option>
      </select>
    </div>
    <div class="form-group">
      <label for="notes">Notes</label>
      <textarea id="notes" name="notes">${group.notes || ''}</textarea>
    </div>
  `;
}

async function handleGroupSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const raw = Object.fromEntries(formData);
  
  try {
    if (!raw.group_name?.trim()) throw new Error('Group name is required');
    
    const group = {
      group_name: raw.group_name.trim(),
      level: raw.level?.trim() || '',
      status: raw.status || 'active',
      notes: raw.notes?.trim() || '',
    };
    
    if (currentEditId) {
      group.group_name = currentEditId;
      await update(group);
      logger.info('Group updated:', group);
    } else {
      await create(group);
      logger.info('Group created:', group);
    }
    
    closeModal('form-modal');
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'groups' } }));
  } catch (err) {
    logger.error('Error saving group:', err.message);
    alert('Error: ' + err.message);
  }
}

async function editGroupRow(id) {
  const row = document.querySelector(`[data-edit-group="${id}"]`).closest('tr');
  const cells = row.querySelectorAll('td');
  
  const group = {
    group_name: cells[0]?.textContent || id,
    level: cells[2]?.textContent || '',
    status: cells[5]?.textContent?.trim() || 'active',
    notes: ''
  };
  
  currentEditId = id;
  populateGroupForm(group);
  document.querySelector('#modal-title').textContent = 'Edit Group';
  openModal('form-modal');
}

async function deleteGroupRow(id) {
  if (!confirm('Are you sure you want to delete this group?')) return;
  
  try {
    await remove(id);
    logger.info('Group deleted:', id);
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'groups' } }));
  } catch (err) {
    logger.error('Error deleting group:', err.message);
    alert('Error: ' + err.message);
  }
}
