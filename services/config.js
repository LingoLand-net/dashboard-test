// Centralized configuration for frontend services
// Supabase configuration - add your project credentials here

// Supabase Project Settings
// Get these from https://app.supabase.com -> Project Settings -> API
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ntoywdjhihbzuatybafv.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50b3l3ZGpoaWhienVhdHliYWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MzM1NzEsImV4cCI6MjA3ODUwOTU3MX0.J7rG5nOJigfhpqQZZXNbKkhfcrNkNewwqA3cTAlPNpQ';

export const ENV = {
  production: false,
  supabaseEnabled: true
};
