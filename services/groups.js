// Groups service wrapper - manages master groups, not enrollments
import api from './api.js';

export async function list(params){
  const res = await api.request('?resource=groups&action=list', { method: 'GET', params });
  return res.data || [];
}

export async function create(group){
  const res = await api.request('?resource=groups&action=create', { method: 'POST', body: { group } });
  return res.data;
}

export async function update(group){
  const res = await api.request('?resource=groups&action=update', { method: 'POST', body: { group } });
  return res.data;
}

export async function remove(groupName){
  const res = await api.request('?resource=groups&action=delete', { method: 'POST', body: { group: { group_name: groupName } } });
  return res.ok;
}

export async function enroll(studentId, groupName){
  const res = await api.request('?resource=groups&action=enroll', { method: 'POST', body: { student_id: studentId, group_name: groupName } });
  return res.data;
}

export async function unenroll(studentId, groupName){
  const res = await api.request('?resource=groups&action=unenroll', { method: 'POST', body: { student_id: studentId, group_name: groupName } });
  return res.ok;
}

export async function getStudents(groupName){
  const res = await api.request('?resource=groups&action=get_students', { method: 'POST', body: { group_name: groupName } });
  return res.data || [];
}

