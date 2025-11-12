// Students service using Supabase
import { supabase, generateId, handleSupabaseError } from './supabase.js';

export async function list(params) {
	try {
		const { data, error } = await supabase
			.from('students')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) throw error;
		return data || [];
	} catch (err) {
		console.error('Error listing students:', err);
		return [];
	}
}

export async function create(student) {
	try {
		const newStudent = {
			student_id: student.student_id || generateId('stu_'),
			first_name: student.first_name || '',
			last_name: student.last_name || '',
			email: student.email || '',
			phone: student.phone || '',
			date_of_birth: student.date_of_birth || null,
			enrollment_date: student.enrollment_date || new Date().toISOString().split('T')[0],
			status: student.status || 'active',
			family_id: student.family_id || null,
			parent_contact_id: student.parent_contact_id || null,
			notes: student.notes || ''
		};

		const { data, error } = await supabase
			.from('students')
			.insert([newStudent])
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (err) {
		console.error('Error creating student:', err);
		throw err;
	}
}

export async function update(student) {
	try {
		const { data, error } = await supabase
			.from('students')
			.update(student)
			.eq('student_id', student.student_id)
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (err) {
		console.error('Error updating student:', err);
		throw err;
	}
}

export async function remove(student_id) {
	try {
		const { error } = await supabase
			.from('students')
			.delete()
			.eq('student_id', student_id);

		if (error) throw error;
		return true;
	} catch (err) {
		console.error('Error deleting student:', err);
		throw err;
	}
}


