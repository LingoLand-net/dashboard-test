import { list as listStudents } from '../../services/students.js';

export async function loadStudents(containerSelector = '#students-list'){
	try {
		// This will be replaced by the app.js loadStudentsUI function
		// which loads stats and all related data
		await import('./app.js').then(module => {
			module.loadStudentsUI(containerSelector);
		});
	} catch(err) {
		const container = document.querySelector(containerSelector);
		if (container) container.innerText = 'Error: ' + err.message;
	}
}

