// Payments service wrapper
import api from './api.js';

export async function list(params){
	const res = await api.request('?resource=payments&action=list', { method: 'GET', params });
	return res.data || [];
}

export async function create(payment){
	const res = await api.request('?resource=payments&action=create', { method: 'POST', body: { payment } });
	return res.data;
}

export async function update(payment){
	const res = await api.request('?resource=payments&action=update', { method: 'POST', body: { payment } });
	return res.data;
}

export async function remove(payment_id){
	const res = await api.request('?resource=payments&action=delete', { method: 'POST', body: { payment: { payment_id } } });
	return res.ok;
}


