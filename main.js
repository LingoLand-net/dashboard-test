import { mountSidebar } from './components/sidebar.js';
import { mountHeader } from './components/header.js';
import { mountModalButtons } from './components/modal.js';

// lazy imports for page fetchers and app logic
const PAGE_LOADERS = {
	students: async () => {
		const { loadStudentsUI } = await import('./pages/students/app.js');
		const { mountStudentsUI } = await import('./pages/students/app.js');
		mountStudentsUI(document);
		return loadStudentsUI;
	},
	payments: async () => {
		const { loadPaymentsUI } = await import('./pages/payments/app.js');
		const { mountPaymentsUI } = await import('./pages/payments/app.js');
		mountPaymentsUI(document);
		return loadPaymentsUI;
	},
	contacts: async () => {
		const { loadContactsUI } = await import('./pages/contacts/app.js');
		const { mountContactsUI } = await import('./pages/contacts/app.js');
		mountContactsUI(document);
		return loadContactsUI;
	},
	events: async () => {
		const { loadEventsUI } = await import('./pages/events/app.js');
		const { mountEventsUI } = await import('./pages/events/app.js');
		mountEventsUI(document);
		return loadEventsUI;
	},
	attendance: async () => {
		const { loadAttendanceUI } = await import('./pages/attendance/app.js');
		const { mountAttendanceUI } = await import('./pages/attendance/app.js');
		mountAttendanceUI(document);
		return loadAttendanceUI;
	},
	groups: async () => {
		const { loadGroupsUI } = await import('./pages/groups/app.js');
		const { mountGroupsUI } = await import('./pages/groups/app.js');
		mountGroupsUI(document);
		return loadGroupsUI;
	},
};

function navigateTo(page){
	const loader = PAGE_LOADERS[page];
	if (!loader) return console.warn('No loader for page', page);

	// Close mobile menu
	const sidebar = document.querySelector('#sidebar');
	if (sidebar) sidebar.classList.remove('open');

	// Update sidebar active state
	document.querySelectorAll('[data-nav]').forEach(link => {
		link.classList.remove('active');
		if (link.dataset.nav === page) link.classList.add('active');
	});

	// Update page title
	const titles = {
		students: '👥 Students',
		payments: '💰 Payments',
		contacts: '📞 Contacts',
		events: '📅 Events',
		attendance: '✓ Attendance',
		groups: '🎓 Groups',
	};
	document.querySelector('#page-title').textContent = titles[page] || page;

	// hide all page containers and show the target container id
	document.querySelectorAll('.page-container').forEach(el => el.classList.add('hidden'));
	const targetId = `#${page}-list`;
	const target = document.querySelector(targetId);
	if (target) target.classList.remove('hidden');

	loader()
		.then(fn => fn(targetId))
		.catch(err => console.error('Error loading page:', err));
}

document.addEventListener('DOMContentLoaded', () => {
	mountSidebar(document);
	mountHeader(document);
	mountModalButtons(document);

	// Mobile menu toggle
	const menuToggle = document.querySelector('#menu-toggle');
	const sidebar = document.querySelector('#sidebar');
	if (menuToggle && sidebar) {
		menuToggle.addEventListener('click', () => {
			sidebar.classList.toggle('open');
		});
		// Close menu when clicking on a nav link
		sidebar.addEventListener('click', e => {
			if (e.target.closest('[data-nav]')) {
				sidebar.classList.remove('open');
			}
		});
	}

	window.addEventListener('navigate', e => {
		const page = e.detail && e.detail.page;
		if (page) navigateTo(page);
	});

	// load default page
	navigateTo('students');
});
