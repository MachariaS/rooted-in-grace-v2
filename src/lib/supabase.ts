import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { serverEnv } from './env';

let client: SupabaseClient | undefined;

// Service-role client: bypasses row-level security, so it must only ever be
// used in server routes, never shipped to the browser.
export function supabaseAdmin(): SupabaseClient {
  client ??= createClient(serverEnv('SUPABASE_URL'), serverEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
