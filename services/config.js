// Centralized configuration for frontend services
// Supabase configuration - add your project credentials here

// Supabase Project Settings
// Get these from https://app.supabase.com -> Project Settings -> API
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here';

export const ENV = {
  production: false,
  supabaseEnabled: true
};
