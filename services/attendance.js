// Attendance service using Supabase
import { supabase, generateId } from './supabase.js';

export async function list(params) {
	try {
		const { data, error } = await supabase
			.from('attendance')
			.select('*')
			.order('attendance_date', { ascending: false });

		if (error) throw error;
		return data || [];
	} catch (err) {
		console.error('Error listing attendance:', err);
		return [];
	}
}

export async function create(attendance) {
	try {
		const newAttendance = {
			attendance_id: attendance.attendance_id || generateId('att_'),
			student_id: attendance.student_id || '',
			group_id: attendance.group_id || null,
			group_name: attendance.group_name || '',
			attendance_date: attendance.attendance_date || new Date().toISOString().split('T')[0],
			status: attendance.status || 'present',
			notes: attendance.notes || ''
		};

		const { data, error } = await supabase
			.from('attendance')
			.insert([newAttendance])
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (err) {
		console.error('Error creating attendance:', err);
		throw err;
	}
}

export async function update(attendance) {
	try {
		const { data, error } = await supabase
			.from('attendance')
			.update(attendance)
			.eq('attendance_id', attendance.attendance_id)
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (err) {
		console.error('Error updating attendance:', err);
		throw err;
	}
}

export async function remove(attendance_id) {
	try {
		const { error } = await supabase
			.from('attendance')
			.delete()
			.eq('attendance_id', attendance_id);

		if (error) throw error;
		return true;
	} catch (err) {
		console.error('Error deleting attendance:', err);
		throw err;
	}
}
