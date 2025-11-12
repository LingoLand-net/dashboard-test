// Attendance service wrapper
import api from './api.js';

export async function list(params){
	const res = await api.request('?resource=attendance&action=list', { method: 'GET', params });
	return res.data || [];
}

export async function create(attendance){
	const res = await api.request('?resource=attendance&action=create', { method: 'POST', body: { attendance } });
	return res.data;
}

export async function update(attendance){
	const res = await api.request('?resource=attendance&action=update', { method: 'POST', body: { attendance } });
	return res.data;
}

export async function remove(attendance_id){
	const res = await api.request('?resource=attendance&action=delete', { method: 'POST', body: { attendance: { attendance_id } } });
	return res.ok;
}


