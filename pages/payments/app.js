// Payments - Dashboard with stats, filtering, and bulk mark as paid
import { createStatCard, mountStatCards } from '../../components/statcard.js';
import { createSearchBar, createCategoryFilter } from '../../components/filters.js';
import { logger } from '../../utils/logger.js';
import { apiCall } from '../../services/api.js';

let allPayments = [];
let filteredPayments = [];

export function mountPaymentsUI(container = document) {
  const addBtn = container.querySelector('#add-btn');
  if (addBtn) addBtn.style.display = 'none';
}

export async function loadPaymentsUI(containerSelector = '#payments-list') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = '<div class="empty-state"><div class="spinner"></div></div>';

  try {
    const response = await apiCall('payments', 'list', {});
    allPayments = response.data || [];

    const statsResponse = await apiCall('payments', 'summary', {});
    const stats = statsResponse.data || {};

    renderPaymentsDashboard(container, stats);
  } catch (err) {
    logger.error('Failed to load payments:', err);
    container.innerHTML = `<div class="alert alert-error">Error: ${err.message}</div>`;
  }
}

function renderPaymentsDashboard(container, stats) {
  container.innerHTML = '';

  // Stats section
  const statsSection = document.createElement('div');
  statsSection.className = 'dashboard-section';
  
  const statsDiv = document.createElement('div');
  statsDiv.className = 'stat-cards';
  const statCards = [
    { label: 'Collected', value: `$${stats.collected?.toFixed(2) || '0.00'}`, icon: '✓', trend: 8 },
    { label: 'Pending', value: `$${stats.pending?.toFixed(2) || '0.00'}`, icon: '⏳' },
    { label: 'Overdue', value: `$${stats.overdue?.toFixed(2) || '0.00'}`, icon: '⚠️', trend: -3 },
    { label: 'Total', value: `$${stats.total?.toFixed(2) || '0.00'}`, icon: '💰' },
  ];
  mountStatCards(statsDiv, statCards);
  statsSection.appendChild(statsDiv);
  container.appendChild(statsSection);

  // Filter section
  const filterSection = document.createElement('div');
  filterSection.className = 'filter-section';
  
  const statusFilter = createCategoryFilter(
    [
      { value: '', label: 'All Statuses' },
      { value: 'paid', label: 'Paid' },
      { value: 'pending', label: 'Pending' },
      { value: 'overdue', label: 'Overdue' }
    ],
    (status) => filterPayments(status, container)
  );
  filterSection.appendChild(statusFilter);
  container.appendChild(filterSection);

  // Table section
  const tableSection = document.createElement('div');
  tableSection.className = 'dashboard-section';
  tableSection.id = 'payments-table';
  container.appendChild(tableSection);

  renderPaymentsTable(tableSection, allPayments);
}

function filterPayments(status, container) {
  filteredPayments = status ? allPayments.filter(p => p.status === status) : allPayments;
  const tableSection = container.querySelector('#payments-table');
  renderPaymentsTable(tableSection, filteredPayments);
}

function renderPaymentsTable(container, payments) {
  if (!payments || payments.length === 0) {
    container.innerHTML = '<div class="empty-state">No payments found</div>';
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'table-wrapper';
  const table = document.createElement('table');
  table.className = 'table';
  
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['Student', 'Group', 'Amount', 'Due Date', 'Status', 'Action'].forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  payments.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="Student">${p.student_id}</td>
      <td data-label="Group">${p.group_name}</td>
      <td data-label="Amount"><strong>$${parseFloat(p.amount).toFixed(2)}</strong></td>
      <td data-label="Due Date">${p.due_date}</td>
      <td data-label="Status"><span class="badge badge-${p.status === 'paid' ? 'success' : p.status === 'overdue' ? 'danger' : 'warning'}">${p.status}</span></td>
      <td data-label="Action">
        ${p.status !== 'paid' ? `<button class="btn btn-sm btn-success" data-mark-paid="${p.payment_id}">✓ Mark Paid</button>` : '—'}
      </td>
    `;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  wrapper.appendChild(table);
  container.innerHTML = '';
  container.appendChild(wrapper);

  // Attach mark paid listeners
  wrapper.addEventListener('click', e => {
    const btn = e.target.closest('[data-mark-paid]');
    if (btn) {
      markPaymentPaid(btn.dataset.markPaid);
    }
  });
}

async function markPaymentPaid(paymentId) {
  try {
    const response = await apiCall('payments', 'mark_paid', { payment_ids: [paymentId] });
    if (response.ok) {
      alert('✓ Payment marked as paid');
      loadPaymentsUI();
    } else {
      alert('Error: ' + response.error);
    }
  } catch (err) {
    logger.error('Error marking payment:', err);
    alert('Error: ' + err.message);
  }
}
