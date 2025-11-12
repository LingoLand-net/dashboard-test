// Events page app - handles create/edit/delete UI
import { list, create, update, remove } from '../../services/events.js';
import { openModal, closeModal } from '../../components/modal.js';
import { logger } from '../../utils/logger.js';

let currentEditId = null;
let allEvents = [];

export function mountEventsUI(container = document) {
  const addBtn = container.querySelector('#add-btn');
  const form = container.querySelector('#form-container');
  
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      currentEditId = null;
      populateEventForm();
      document.querySelector('#modal-title').textContent = 'Add New Event';
      openModal('form-modal');
    });
  }

  if (form) {
    form.addEventListener('submit', handleEventSubmit);
  }

  container.addEventListener('click', e => {
    const editBtn = e.target.closest('[data-edit-event]');
    const deleteBtn = e.target.closest('[data-delete-event]');
    
    if (editBtn) editEventRow(editBtn.dataset.editEvent);
    if (deleteBtn) deleteEventRow(deleteBtn.dataset.deleteEvent);
  });
}

export async function loadEventsUI(containerSelector = '#events-list') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = '<div class="empty-state"><div class="spinner"></div><div class="empty-state-text">Loading events...</div></div>';

  try {
    allEvents = await list();
    renderEventsUI(container);
  } catch (err) {
    logger.error('Failed to load events:', err);
    container.innerHTML = `<div class="alert alert-error">Error loading events: ${err.message}</div>`;
  }
}

function renderEventsUI(container) {
  container.innerHTML = '';

  if (allEvents.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No events yet. Create your first event!</p></div>';
    return;
  }

  // Create table
  const table = document.createElement('table');
  table.className = 'table table-striped';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Event Name</th>
        <th>Date</th>
        <th>Time</th>
        <th>Location</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${allEvents.map(event => `
        <tr>
          <td>${event.event_name || ''}</td>
          <td>${event.date ? new Date(event.date).toLocaleDateString() : ''}</td>
          <td>${event.time || ''}</td>
          <td>${event.location || ''}</td>
          <td><span class="badge badge-${getStatusClass(event.status)}">${event.status || 'planned'}</span></td>
          <td>
            <button data-edit-event="${event.event_id}" class="btn btn-sm btn-primary">Edit</button>
            <button data-delete-event="${event.event_id}" class="btn btn-sm btn-danger">Delete</button>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;

  container.appendChild(table);
}

function getStatusClass(status) {
  const classes = {
    'planned': 'warning',
    'ongoing': 'info',
    'completed': 'success',
    'cancelled': 'danger'
  };
  return classes[status] || 'secondary';
}

function populateEventForm(event = {}) {
  const form = document.querySelector('#form-container');
  form.innerHTML = `
    <div class="form-group">
      <label for="event_name">Event Name *</label>
      <input type="text" id="event_name" name="event_name" value="${event.event_name || ''}" required>
    </div>
    <div class="form-group">
      <label for="event_date">Event Date *</label>
      <input type="date" id="event_date" name="event_date" value="${event.event_date || ''}" required>
    </div>
    <div class="form-group">
      <label for="event_time">Event Time</label>
      <input type="time" id="event_time" name="event_time" value="${event.event_time || ''}">
    </div>
    <div class="form-group">
      <label for="location">Location</label>
      <input type="text" id="location" name="location" value="${event.location || ''}">
    </div>
    <div class="form-group">
      <label for="description">Description</label>
      <textarea id="description" name="description">${event.description || ''}</textarea>
    </div>
    <div class="form-group">
      <label for="organizer">Organizer</label>
      <input type="text" id="organizer" name="organizer" value="${event.organizer || ''}">
    </div>
    <div class="form-group">
      <label for="capacity">Capacity</label>
      <input type="number" id="capacity" name="capacity" value="${event.capacity || ''}">
    </div>
    <div class="form-group">
      <label for="status">Status</label>
      <select id="status" name="status">
        <option value="planned" ${event.status === 'planned' ? 'selected' : ''}>Planned</option>
        <option value="ongoing" ${event.status === 'ongoing' ? 'selected' : ''}>Ongoing</option>
        <option value="completed" ${event.status === 'completed' ? 'selected' : ''}>Completed</option>
        <option value="cancelled" ${event.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
      </select>
    </div>
  `;
}

async function handleEventSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const raw = Object.fromEntries(formData);
  
  try {
    if (!raw.event_name?.trim()) throw new Error('Event name is required');
    if (!raw.event_date) throw new Error('Event date is required');
    
    const event = {
      event_name: raw.event_name.trim(),
      event_date: raw.event_date,
      event_time: raw.event_time || '',
      location: raw.location?.trim() || '',
      description: raw.description?.trim() || '',
      organizer: raw.organizer?.trim() || '',
      capacity: Number(raw.capacity) || 0,
      status: raw.status || 'planned',
    };
    
    if (currentEditId) {
      event.event_id = currentEditId;
      await update(event);
      logger.info('Event updated:', event);
    } else {
      await create(event);
      logger.info('Event created:', event);
    }
    
    closeModal('form-modal');
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'events' } }));
  } catch (err) {
    logger.error('Error saving event:', err.message);
    alert('Error: ' + err.message);
  }
}

async function editEventRow(id) {
  const row = document.querySelector(`[data-edit-event="${id}"]`).closest('tr');
  const cells = row.querySelectorAll('td');
  
  const event = {
    event_id: id,
    event_name: cells[1]?.textContent || '',
    event_date: cells[2]?.textContent || '',
    event_time: cells[3]?.textContent || '',
    location: cells[4]?.textContent || '',
    description: cells[5]?.textContent || '',
    organizer: cells[6]?.textContent || '',
    capacity: cells[7]?.textContent || '',
    status: cells[8]?.textContent || 'planned',
  };
  
  currentEditId = id;
  populateEventForm(event);
  document.querySelector('#modal-title').textContent = 'Edit Event';
  openModal('form-modal');
}

async function deleteEventRow(id) {
  if (!confirm('Are you sure you want to delete this event?')) return;
  
  try {
    await remove(id);
    logger.info('Event deleted:', id);
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'events' } }));
  } catch (err) {
    logger.error('Error deleting event:', err.message);
    alert('Error: ' + err.message);
  }
}
