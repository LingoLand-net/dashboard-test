// Attendance - Fast bulk marking with per-student toggles
import { logger } from '../../utils/logger.js';
import { apiCall } from '../../services/api.js';

let allGroups = [];
let currentGroup = null;
let currentDate = null;
let groupStudents = [];

export function mountAttendanceUI(container = document) {
  const addBtn = container.querySelector('#add-btn');
  if (addBtn) {
    addBtn.style.display = 'none';
  }
}

export async function loadAttendanceUI(containerSelector = '#attendance-list') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = '<div class="empty-state"><div class="spinner"></div><div class="empty-state-text">Loading attendance...</div></div>';

  try {
    // Load all groups (attendance can be marked for any group)
    const groupResponse = await apiCall('student_groups', 'list', {});
    
    if (!groupResponse.ok) {
      throw new Error(groupResponse.error || 'Failed to load groups');
    }

    // Extract unique groups from student_groups
    allGroups = groupResponse.data || [];
    
    // Check if there's a group in URL or passed in
    const urlParams = new URLSearchParams(window.location.search);
    const groupParam = urlParams.get('group') || null;
    
    renderAttendanceUI(container, groupParam);
  } catch (err) {
    logger.error('Failed to load attendance:', err);
    container.innerHTML = `<div class="alert alert-error">Error loading attendance: ${err.message}</div>`;
  }
}

function renderAttendanceUI(container, initialGroup = null) {
  container.innerHTML = '';

  // 1. Group selector and date picker
  const controlsSection = document.createElement('div');
  controlsSection.className = 'attendance-controls';
  
  const groupLabel = document.createElement('label');
  groupLabel.textContent = 'Select Group:';
  const groupSelect = document.createElement('select');
  groupSelect.id = 'group-select';
  groupSelect.className = 'form-control';
  groupSelect.innerHTML = '<option value="">-- Select a group --</option>';
  
  allGroups.forEach(group => {
    const option = document.createElement('option');
    option.value = group.group_name;
    option.textContent = `${group.group_name} (${group.schedule_time}) - ${group.student_count} students`;
    if (group.group_name === initialGroup) option.selected = true;
    groupSelect.appendChild(option);
  });

  const dateLabel = document.createElement('label');
  dateLabel.textContent = 'Date:';
  const dateInput = document.createElement('input');
  dateInput.id = 'attendance-date';
  dateInput.type = 'date';
  dateInput.className = 'form-control';
  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;

  controlsSection.appendChild(groupLabel);
  controlsSection.appendChild(groupSelect);
  controlsSection.appendChild(dateLabel);
  controlsSection.appendChild(dateInput);
  container.appendChild(controlsSection);

  // Load students if initial group provided
  if (initialGroup && allGroups.find(g => g.group_name === initialGroup)) {
    groupSelect.value = initialGroup;
    loadGroupStudents(initialGroup, today, container);
  }

  // Event listeners
  groupSelect.addEventListener('change', e => {
    const groupName = e.target.value;
    if (groupName) {
      const date = dateInput.value || today;
      loadGroupStudents(groupName, date, container);
    } else {
      // Clear students area
      const studentsArea = container.querySelector('#students-area');
      if (studentsArea) studentsArea.innerHTML = '';
    }
  });

  dateInput.addEventListener('change', e => {
    const groupName = groupSelect.value;
    if (groupName) {
      loadGroupStudents(groupName, e.target.value, container);
    }
  });

  // Placeholder for students
  const studentsArea = document.createElement('div');
  studentsArea.id = 'students-area';
  studentsArea.className = 'students-area';
  container.appendChild(studentsArea);
}

async function loadGroupStudents(groupName, date, container) {
  const studentsArea = container.querySelector('#students-area');
  if (!studentsArea) return;

  studentsArea.innerHTML = '<div class="spinner"></div>';

  try {
    currentGroup = groupName;
    currentDate = date;

    const response = await apiCall('attendance', 'group_students', {
      group_name: groupName,
      date: date
    });

    if (!response.ok) {
      throw new Error(response.error || 'Failed to load students');
    }

    groupStudents = response.data || [];
    renderStudentList(container, groupStudents);
  } catch (err) {
    logger.error('Failed to load group students:', err);
    studentsArea.innerHTML = `<div class="alert alert-error">Error loading students: ${err.message}</div>`;
  }
}

function renderStudentList(container, students) {
  const studentsArea = container.querySelector('#students-area');
  if (!studentsArea) return;

  studentsArea.innerHTML = '';

  if (students.length === 0) {
    studentsArea.innerHTML = '<div class="empty-state"><p>No students enrolled in this group</p></div>';
    return;
  }

  // Bulk action buttons
  const bulkSection = document.createElement('div');
  bulkSection.className = 'bulk-action-section';
  
  const bulkLabel = document.createElement('label');
  bulkLabel.textContent = 'Bulk Actions:';
  
  const presentBtn = document.createElement('button');
  presentBtn.className = 'btn btn-success';
  presentBtn.textContent = '✓ Mark All Present';
  presentBtn.addEventListener('click', () => markAllStatus('present'));

  const absentBtn = document.createElement('button');
  absentBtn.className = 'btn btn-danger';
  absentBtn.textContent = '✗ Mark All Absent';
  absentBtn.addEventListener('click', () => markAllStatus('absent'));

  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn btn-primary';
  saveBtn.textContent = '💾 Save Attendance';
  saveBtn.addEventListener('click', () => saveAttendance(container));

  bulkSection.appendChild(bulkLabel);
  bulkSection.appendChild(presentBtn);
  bulkSection.appendChild(absentBtn);
  bulkSection.appendChild(saveBtn);
  studentsArea.appendChild(bulkSection);

  // Student list
  const studentsList = document.createElement('div');
  studentsList.className = 'attendance-student-list';

  students.forEach(student => {
    const row = document.createElement('div');
    row.className = 'attendance-student-row';
    row.dataset.studentId = student.student_id;

    const studentInfo = document.createElement('div');
    studentInfo.className = 'student-info';
    studentInfo.innerHTML = `
      <strong>${student.first_name} ${student.last_name}</strong>
      <small>${student.student_id}</small>
    `;

    const toggleButtons = document.createElement('div');
    toggleButtons.className = 'toggle-buttons';

    const presentBtn = document.createElement('button');
    presentBtn.className = 'toggle-btn' + (student.attendance_status === 'present' ? ' active' : '');
    presentBtn.textContent = 'Present';
    presentBtn.dataset.status = 'present';
    presentBtn.addEventListener('click', () => toggleStatus(row, 'present'));

    const absentBtn = document.createElement('button');
    absentBtn.className = 'toggle-btn' + (student.attendance_status === 'absent' ? ' active' : '');
    absentBtn.textContent = 'Absent';
    absentBtn.dataset.status = 'absent';
    absentBtn.addEventListener('click', () => toggleStatus(row, 'absent'));

    const lateBtn = document.createElement('button');
    lateBtn.className = 'toggle-btn' + (student.attendance_status === 'late' ? ' active' : '');
    lateBtn.textContent = 'Late';
    lateBtn.dataset.status = 'late';
    lateBtn.addEventListener('click', () => toggleStatus(row, 'late'));

    toggleButtons.appendChild(presentBtn);
    toggleButtons.appendChild(absentBtn);
    toggleButtons.appendChild(lateBtn);

    row.appendChild(studentInfo);
    row.appendChild(toggleButtons);
    studentsList.appendChild(row);
  });

  studentsArea.appendChild(studentsList);
}

function toggleStatus(row, status) {
  const buttons = row.querySelectorAll('.toggle-btn');
  buttons.forEach(btn => {
    if (btn.dataset.status === status) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  row.dataset.status = status;
}

function markAllStatus(status) {
  const container = document.querySelector('#attendance-list');
  const rows = container.querySelectorAll('.attendance-student-row');
  rows.forEach(row => {
    toggleStatus(row, status);
  });
}

async function saveAttendance(container) {
  if (!currentGroup || !currentDate) {
    alert('Please select a group and date');
    return;
  }

  const rows = container.querySelectorAll('.attendance-student-row');
  const students = [];

  rows.forEach(row => {
    const studentId = row.dataset.studentId;
    const status = row.dataset.status;
    
    if (status) {
      students.push({
        student_id: studentId,
        status: status,
        notes: ''
      });
    }
  });

  if (students.length === 0) {
    alert('Please mark at least one student');
    return;
  }

  try {
    const response = await apiCall('attendance', 'save_group', {
      group_name: currentGroup,
      date: currentDate,
      students: students
    });

    if (response.ok) {
      alert(`✓ Attendance saved for ${students.length} students`);
      logger.log(`Saved attendance for ${currentGroup} on ${currentDate}`);
      // Reload
      loadAttendanceUI();
    } else {
      alert('Error: ' + response.error);
    }
  } catch (err) {
    logger.error('Failed to save attendance:', err);
    alert('Error saving attendance');
  }
}
