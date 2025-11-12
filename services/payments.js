// Payments service using Supabase
import { supabase, generateId } from './supabase.js';

export async function list(params) {
	try {
		const { data, error } = await supabase
			.from('payments')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) throw error;
		return data || [];
	} catch (err) {
		console.error('Error listing payments:', err);
		return [];
	}
}

export async function create(payment) {
	try {
		const newPayment = {
			payment_id: payment.payment_id || generateId('pay_'),
			student_id: payment.student_id || '',
			group_id: payment.group_id || null,
			group_name: payment.group_name || '',
			amount: payment.amount || 0,
			base_amount: payment.base_amount || payment.amount || 0,
			discount_applied: payment.discount_applied || 0,
			payment_date: payment.payment_date || null,
			due_date: payment.due_date || null,
			status: payment.status || 'pending',
			payment_method: payment.payment_method || '',
			notes: payment.notes || ''
		};

		const { data, error } = await supabase
			.from('payments')
			.insert([newPayment])
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (err) {
		console.error('Error creating payment:', err);
		throw err;
	}
}

export async function update(payment) {
	try {
		const { data, error } = await supabase
			.from('payments')
			.update(payment)
			.eq('payment_id', payment.payment_id)
			.select()
			.single();

		if (error) throw error;
		return data;
	} catch (err) {
		console.error('Error updating payment:', err);
		throw err;
	}
}

export async function remove(payment_id) {
	try {
		const { error } = await supabase
			.from('payments')
			.delete()
			.eq('payment_id', payment_id);

		if (error) throw error;
		return true;
	} catch (err) {
		console.error('Error deleting payment:', err);
		throw err;
	}
}
