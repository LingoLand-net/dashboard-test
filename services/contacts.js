// Contacts service wrapper
import api from './api.js';

export async function list(params){
	const res = await api.request('?resource=contacts&action=list', { method: 'GET', params });
	return res.data || [];
}

export async function create(contact){
	const res = await api.request('?resource=contacts&action=create', { method: 'POST', body: { contact } });
	return res.data;
}

export async function update(contact){
	const res = await api.request('?resource=contacts&action=update', { method: 'POST', body: { contact } });
	return res.data;
}

export async function remove(contact_id){
	const res = await api.request('?resource=contacts&action=delete', { method: 'POST', body: { contact: { contact_id } } });
	return res.ok;
}


