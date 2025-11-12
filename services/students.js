// Students service wrapper around services/api.js
import api from './api.js';

export async function list(params) {
	const res = await api.request('?resource=students&action=list', { method: 'GET', params });
	return res.data || [];
}

export async function create(student) {
	const res = await api.request('?resource=students&action=create', { method: 'POST', body: { student } });
	return res.data;
}

export async function update(student) {
	const res = await api.request('?resource=students&action=update', { method: 'POST', body: { student } });
	return res.data;
}

export async function remove(student_id){
	const res = await api.request('?resource=students&action=delete', { method: 'POST', body: { student: { student_id } } });
	return res.ok;
}


