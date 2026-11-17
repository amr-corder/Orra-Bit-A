import { createClient, User as SupabaseUser, Session } from '@supabase/supabase-js';
import { ROOT_ADMIN_EMAIL } from '../firebase';

function normalizeEnvValue(raw: string | undefined, keyName: string): string {
  if (!raw) return '';
  let cleaned = raw.trim().replace(/^['"]|['"]$/g, '');
  const prefix = `${keyName}=`;
  if (cleaned.startsWith(prefix)) {
    cleaned = cleaned.slice(prefix.length).trim().replace(/^['"]|['"]$/g, '');
  }
  return cleaned;
}

const rawSupabaseUrl = normalizeEnvValue(import.meta.env.VITE_SUPABASE_URL, 'VITE_SUPABASE_URL');
const supabaseUrl = /^https?:\/\/.+/i.test(rawSupabaseUrl)
  ? rawSupabaseUrl
  : 'https://bjfnwlwxeraitfemkjxv.supabase.co';
const supabaseKey =
  normalizeEnvValue(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, 'VITE_SUPABASE_PUBLISHABLE_KEY') ||
  'sb_publishable_AvPD45QGYvzWjww3qnVzrA_x4OMyMeS';

if (!rawSupabaseUrl || !/^https?:\/\/.+/i.test(rawSupabaseUrl)) {
  console.warn(
    'VITE_SUPABASE_URL was missing or malformed; normalized fallback applied.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export type { SupabaseUser, Session };

/**
 * Only the explicitly allowlisted account may access the admin dashboard.
 */
export function isSupabaseAdminUser(user: SupabaseUser | null | undefined): boolean {
  if (!user || !user.email) return false;

  const isEmailConfirmed = Boolean(
    user.email_confirmed_at || (user as { confirmed_at?: string }).confirmed_at
  );
  if (!isEmailConfirmed) return false;

  return user.email.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase();
}

export function formatSupabaseAuthError(error: unknown): string {
  const raw =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message: unknown }).message)
      : String(error || '');
  const normalized = raw.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  if (normalized.includes('email not confirmed')) {
    return 'Account email is not confirmed yet. Please confirm the user in Supabase Authentication before signing in.';
  }
  if (normalized.includes('too many requests') || normalized.includes('rate limit')) {
    return 'Too many sign-in attempts. Please wait a moment and try again.';
  }
  if (normalized.includes('network') || normalized.includes('fetch')) {
    return 'Unable to reach Supabase authentication servers. Check your internet connection and try again.';
  }
  return raw || 'Unable to sign in with Supabase.';
}
