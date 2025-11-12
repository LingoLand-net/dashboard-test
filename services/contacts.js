// Contacts service using Supabase
import { supabase, generateId } from './supabase.js';

export async function list(params) {
	try {
		const { data, error } = await supabase
			.from('contacts')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) throw error;
		return data || [];
	} catch (err) {
		console.error('Error listing contacts:', err);
		return [];
	}
}

export async function create(contact) {
	try {
		const newContact = {
			contact_id: contact.contact_id || generateId('con_'),
			name: contact.name || '',
			email: contact.email || '',
			phone: contact.phone || '',
			relationship: contact.relationship || '',
			type: contact.type || 'Parent',
			notes: contact.notes || ''
		};

		const { data, error } = await supabase
			.from('contacts')
			.insert([newContact])
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (err) {
		console.error('Error creating contact:', err);
		throw err;
	}
}

export async function update(contact) {
	try {
		const { data, error } = await supabase
			.from('contacts')
			.update(contact)
			.eq('contact_id', contact.contact_id)
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (err) {
		console.error('Error updating contact:', err);
		throw err;
	}
}

export async function remove(contact_id) {
	try {
		const { error } = await supabase
			.from('contacts')
			.delete()
			.eq('contact_id', contact_id);

		if (error) throw error;
		return true;
	} catch (err) {
		console.error('Error deleting contact:', err);
		throw err;
	}
}
