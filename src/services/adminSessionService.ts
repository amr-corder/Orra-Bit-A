import { supabase } from '../utils/supabase';

export async function claimAdminSession(): Promise<boolean> {
  const { data, error } = await supabase.rpc('claim_admin_session');
  if (error) throw new Error(error.message);
  return data === true;
}

export async function releaseAdminSession(): Promise<void> {
  const { error } = await supabase.rpc('release_admin_session');
  if (error) throw new Error(error.message);
}
