// Events service wrapper
import api from './api.js';

export async function list(params){
  const res = await api.request('?resource=events&action=list', { method: 'GET', params });
  return res.data || [];
}

export async function create(event){
  const res = await api.request('?resource=events&action=create', { method: 'POST', body: { event } });
  return res.data;
}

export async function update(event){
  const res = await api.request('?resource=events&action=update', { method: 'POST', body: { event } });
  return res.data;
}

export async function remove(event_id){
  const res = await api.request('?resource=events&action=delete', { method: 'POST', body: { event: { event_id } } });
  return res.ok;
}
