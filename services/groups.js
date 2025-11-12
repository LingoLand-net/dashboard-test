// Groups service using Supabase
import { supabase, generateId } from './supabase.js';

export async function list(params) {
	try {
		// Get all groups with student count
		const { data: groups, error } = await supabase
			.from('groups')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) throw error;

		// Enrich with student count
		const enriched = await Promise.all(
			(groups || []).map(async (group) => {
				const { count, error: countError } = await supabase
					.from('student_groups')
					.select('*', { count: 'exact' })
					.eq('group_id', group.group_id)
					.eq('status', 'active');

				return {
					...group,
					student_count: count || 0
				};
			})
		);

		return enriched || [];
	} catch (err) {
		console.error('Error listing groups:', err);
		return [];
	}
}

export async function create(group) {
	try {
		const newGroup = {
			group_id: group.group_id || generateId('grp_'),
			group_name: group.group_name || '',
			level: group.level || '',
			status: group.status || 'active',
			description: group.description || '',
			capacity: group.capacity || null,
			instructor: group.instructor || '',
			schedule: group.schedule || '',
			notes: group.notes || ''
		};

		const { data, error } = await supabase
			.from('groups')
			.insert([newGroup])
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (err) {
		console.error('Error creating group:', err);
		throw err;
	}
}

export async function update(group) {
	try {
		const { data, error } = await supabase
			.from('groups')
			.update(group)
			.eq('group_id', group.group_id)
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (err) {
		console.error('Error updating group:', err);
		throw err;
	}
}

export async function remove(group_id) {
	try {
		const { error } = await supabase
			.from('groups')
			.delete()
			.eq('group_id', group_id);

		if (error) throw error;
		return true;
	} catch (err) {
		console.error('Error deleting group:', err);
		throw err;
	}
}

export async function enroll(studentId, groupName){
	try {
		const { data, error } = await supabase
			.from('student_groups')
			.insert([{
				id: generateId('sg_'),
				student_id: studentId,
				group_name: groupName,
				status: 'active'
			}])
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (err) {
		console.error('Error enrolling student:', err);
		throw err;
	}
}

export async function unenroll(studentId, groupName) {
	try {
		const { error } = await supabase
			.from('student_groups')
			.delete()
			.eq('student_id', studentId)
			.eq('group_name', groupName);

		if (error) throw error;
		return true;
	} catch (err) {
		console.error('Error unenrolling student:', err);
		throw err;
	}
}

export async function getStudents(groupName) {
	try {
		const { data, error } = await supabase
			.from('student_groups')
			.select('*, students(*)')
			.eq('group_name', groupName)
			.eq('status', 'active');

		if (error) throw error;
		return data || [];
	} catch (err) {
		console.error('Error getting group students:', err);
		return [];
	}
}

