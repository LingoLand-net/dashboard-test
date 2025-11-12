// Centralized API client - Now using Supabase instead of Google Apps Script
// This file is kept for backward compatibility but all actual API calls
// should use the service modules (students.js, payments.js, etc.)

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

// Legacy: This was used for Google Apps Script integration
// Now all data operations go through Supabase directly via service modules

export const API_CONFIG = {
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY,
  enabled: true
};

// Helper function for legacy code that might still reference API functions
export async function callLegacyAPI(endpoint, options = {}) {
  console.warn(`⚠️  Legacy API call to ${endpoint}. Use service modules instead.`);
  throw new Error('Legacy Google Apps Script API is no longer available. Use Supabase service modules instead.');
}

// All functionality has been migrated to individual service modules
// See the services/ folder for:
// - students.js
// - payments.js
// - attendance.js
// - contacts.js
// - events.js
// - groups.js
// - supabase.js (Supabase client initialization)

export default { API_CONFIG, callLegacyAPI };
