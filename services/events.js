// Events service using Supabase
import { supabase, generateId } from './supabase.js';

export async function list(params) {
	try {
		const { data, error } = await supabase
			.from('events')
			.select('*')
			.order('event_date', { ascending: true });

		if (error) throw error;
		return data || [];
	} catch (err) {
		console.error('Error listing events:', err);
		return [];
	}
}

export async function create(event) {
	try {
		const newEvent = {
			event_id: event.event_id || generateId('evt_'),
			event_name: event.event_name || '',
			event_date: event.event_date || null,
			event_time: event.event_time || null,
			location: event.location || '',
			description: event.description || '',
			group_id: event.group_id || null,
			group_name: event.group_name || '',
			organizer: event.organizer || '',
			capacity: event.capacity || null,
			status: event.status || 'planned',
			notes: event.notes || ''
		};

		const { data, error } = await supabase
			.from('events')
			.insert([newEvent])
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (err) {
		console.error('Error creating event:', err);
		throw err;
	}
}

export async function update(event) {
	try {
		const { data, error } = await supabase
			.from('events')
			.update(event)
			.eq('event_id', event.event_id)
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (err) {
		console.error('Error updating event:', err);
		throw err;
	}
}

export async function remove(event_id) {
	try {
		const { error } = await supabase
			.from('events')
			.delete()
			.eq('event_id', event_id);

		if (error) throw error;
		return true;
	} catch (err) {
		console.error('Error deleting event:', err);
		throw err;
	}
}
