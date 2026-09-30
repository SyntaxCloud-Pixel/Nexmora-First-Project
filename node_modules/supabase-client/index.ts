import { createClient } from '@supabase/supabase-js';

// We get these from the environment variables injected by Vite in the apps
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your .env file.');
}

// Fallback to a dummy valid URL if env vars are missing to prevent immediate crash (Invalid URL error)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);

// We will also export shared types and Auth Provider from here
export * from './AuthProvider';
