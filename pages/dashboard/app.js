// Dashboard - Landing page with stats and quick actions
import { createStatCard, mountStatCards } from '../../components/statcard.js';
import { logger } from '../../utils/logger.js';
import { apiCall } from '../../services/api.js';

let dashboardData = {};

export function mountDashboardUI(container = document) {
  const addBtn = container.querySelector('#add-btn');
  if (addBtn) {
    // Hide add button on dashboard
    addBtn.style.display = 'none';
  }
}

export async function loadDashboard(containerSelector = '#dashboard-list') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = '<div class="empty-state"><div class="spinner"></div><div class="empty-state-text">Loading dashboard...</div></div>';

  try {
    // Load dashboard stats
    const response = await apiCall('dashboard', 'summary', {});
    
    if (!response.ok) {
      throw new Error(response.error || 'Failed to load dashboard');
    }

    dashboardData = response.data;
    renderDashboard(container);
  } catch (err) {
    logger.error('Failed to load dashboard:', err);
    
    // Check if error is due to missing endpoint (not deployed yet)
    const isNotDeployed = err.message.includes('Unknown resource/action') || 
                         err.message.includes('dashboard');
    
    if (isNotDeployed) {
      container.innerHTML = `
        <div style="padding: 2rem; max-width: 600px;">
          <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem;">
            <h3 style="color: #856404; margin-bottom: 0.5rem;">⚠️ Backend Not Fully Deployed</h3>
            <p style="color: #856404; margin: 0.5rem 0;">Your Google Apps Script backend is running, but the dashboard endpoints haven't been deployed yet.</p>
          </div>
          
          <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 1.5rem;">
            <h4 style="margin-bottom: 1rem;">What to do:</h4>
            <ol style="margin: 0; padding-left: 1.5rem;">
              <li style="margin-bottom: 0.5rem;">Open <strong>Google Apps Script</strong>: <a href="https://script.google.com" target="_blank" style="color: #3b82f6;">script.google.com</a></li>
              <li style="margin-bottom: 0.5rem;">Open the <strong>"Lingoville Dashboard"</strong> project</li>
              <li style="margin-bottom: 0.5rem;">Click <strong>Deploy</strong> (top right)</li>
              <li style="margin-bottom: 0.5rem;">Choose <strong>"New Deployment"</strong></li>
              <li style="margin-bottom: 0.5rem;">Select <strong>"Web app"</strong> type</li>
              <li style="margin-bottom: 0.5rem;">Set "Execute as": <strong>Your Account</strong></li>
              <li style="margin-bottom: 1rem;">Set "Who has access": <strong>Anyone</strong></li>
              <li style="margin-bottom: 0.5rem;">Click <strong>"Deploy"</strong></li>
            </ol>
          </div>
          
          <div style="margin-top: 1rem; padding: 1rem; background: #e7f3ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
            <p style="margin: 0; font-size: 0.9rem;"><strong>Technical Info:</strong> ${err.message}</p>
            <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem;"><strong>Status:</strong> Backend is reachable but endpoint not deployed. This is normal - just redeploy and you're done!</p>
          </div>
          
          <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem;">
            Retry After Deploy
          </button>
        </div>
      `;
    } else {
      // Show generic error message
      container.innerHTML = `<div class="alert alert-error">Error loading dashboard: ${err.message}</div>`;
    }
  }
}

function renderDashboard(container) {
  container.innerHTML = '';

  // 1. Stats section with 6 tiles
  const statsSection = document.createElement('div');
  statsSection.className = 'dashboard-section';
  
  const stats = [
    { label: 'Active Students', value: dashboardData.activeStudents || 0, icon: '👥' },
    { label: 'Active Groups', value: dashboardData.activeGroups || 0, icon: '🎓' },
    { label: 'Collected', value: `$${(dashboardData.totalCollected || 0).toFixed(2)}`, icon: '✓', trend: 5 },
    { label: 'Due', value: `$${(dashboardData.totalDue || 0).toFixed(2)}`, icon: '⏳', trend: -3 },
    { label: 'Attendance Rate', value: (dashboardData.attendanceRate || 0) + '%', icon: '📊' },
    { label: 'Overdue', value: dashboardData.overduepayments || 0, icon: '⚠️' }
  ];

  const statsDiv = document.createElement('div');
  statsDiv.className = 'stat-cards';
  mountStatCards(statsDiv, stats);
  statsSection.appendChild(statsDiv);
  container.appendChild(statsSection);

  // 2. Today's Groups section with quick-click action
  if (dashboardData.todaysGroups && dashboardData.todaysGroups.length > 0) {
    const todaySection = document.createElement('section');
    todaySection.className = 'dashboard-section';
    
    const todayTitle = document.createElement('h3');
    todayTitle.textContent = "📅 Today's Groups";
    todayTitle.className = 'section-title';
    todaySection.appendChild(todayTitle);

    const groupsGrid = document.createElement('div');
    groupsGrid.className = 'groups-grid';

    dashboardData.todaysGroups.forEach(group => {
      const groupCard = document.createElement('div');
      groupCard.className = 'quick-action-card';
      groupCard.innerHTML = `
        <div class="card-header">
          <h4>${group.group_name}</h4>
          <span class="badge badge-info">${group.schedule_time}</span>
        </div>
        <div class="card-body">
          <p><strong>Teacher:</strong> ${group.teacher_name}</p>
          <p><strong>Level:</strong> ${group.level || 'N/A'}</p>
        </div>
        <button class="btn btn-primary btn-full" data-action="attendance" data-group="${group.group_name}">
          Mark Attendance
        </button>
      `;
      groupsGrid.appendChild(groupCard);
    });

    todaySection.appendChild(groupsGrid);
    container.appendChild(todaySection);

    // Add event listener for quick action
    groupsGrid.addEventListener('click', e => {
      const btn = e.target.closest('[data-action="attendance"]');
      if (btn) {
        const groupName = btn.dataset.group;
        // Navigate to attendance page and load that group
        const event = new CustomEvent('navigate', {
          detail: {
            page: 'attendance',
            group: groupName
          }
        });
        window.dispatchEvent(event);
      }
    });
  }

  // 3. Overdue Payments section
  const overdueSection = document.createElement('section');
  overdueSection.className = 'dashboard-section';
  
  const overdueTitle = document.createElement('h3');
  overdueTitle.textContent = '⚠️ Overdue Payments';
  overdueTitle.className = 'section-title';
  overdueSection.appendChild(overdueTitle);

  if (dashboardData.overduepayments && dashboardData.overduepayments > 0) {
    loadOverdueList(overdueSection);
  } else {
    const emptyMsg = document.createElement('p');
    emptyMsg.className = 'text-muted';
    emptyMsg.textContent = 'No overdue payments! ✓';
    overdueSection.appendChild(emptyMsg);
  }

  container.appendChild(overdueSection);
}

async function loadOverdueList(container) {
  try {
    const response = await apiCall('dashboard', 'overdue', {});
    
    if (!response.ok || !response.data || response.data.length === 0) {
      container.innerHTML += '<p class="text-muted">No overdue payments</p>';
      return;
    }

    const table = document.createElement('table');
    table.className = 'table';
    
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Student', 'Group', 'Amount', 'Due Date', 'Parent', 'Action'].forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    response.data.forEach(payment => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td data-label="Student">${payment.student_name}</td>
        <td data-label="Group">${payment.group}</td>
        <td data-label="Amount"><strong>$${payment.amount.toFixed(2)}</strong></td>
        <td data-label="Due Date">${payment.due_date}</td>
        <td data-label="Parent">${payment.parent_name}${payment.parent_email ? ` (${payment.parent_email})` : ''}</td>
        <td data-label="Action">
          <button class="btn btn-sm btn-success" data-mark-paid="${payment.payment_id}" title="Mark as Paid">
            ✓ Paid
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    const wrapper = document.createElement('div');
    wrapper.className = 'table-wrapper';
    wrapper.appendChild(table);
    container.appendChild(wrapper);

    // Add mark paid functionality
    wrapper.addEventListener('click', e => {
      const btn = e.target.closest('[data-mark-paid]');
      if (btn) {
        const paymentId = btn.dataset.markPaid;
        markPaymentPaid(paymentId);
      }
    });
  } catch (err) {
    logger.error('Failed to load overdue payments:', err);
    container.innerHTML += `<p class="text-error">Error loading overdue payments</p>`;
  }
}

async function markPaymentPaid(paymentId) {
  try {
    const response = await apiCall('payments', 'mark_paid', {
      payment_ids: [paymentId]
    });

    if (response.ok) {
      logger.log('Payment marked as paid');
      // Reload dashboard
      loadDashboard();
    } else {
      alert('Error: ' + response.error);
    }
  } catch (err) {
    logger.error('Failed to mark payment as paid:', err);
    alert('Error marking payment as paid');
  }
}
