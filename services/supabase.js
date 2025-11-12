// Supabase client configuration and initialization
// Replace all Google Apps Script API calls with direct Supabase queries

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function to generate IDs with prefixes
export function generateId(prefix = '') {
	const uuid = crypto.randomUUID();
	return prefix + uuid.replace(/-/g, '').substring(0, 12);
}

// Generic error handler
export function handleSupabaseError(error) {
	console.error('Supabase error:', error);
	return {
		ok: false,
		error: error?.message || 'Database operation failed'
	};
}

// Success response formatter
export function successResponse(data, ok = true) {
	return { ok, data };
}

export default { supabase, generateId, handleSupabaseError, successResponse };