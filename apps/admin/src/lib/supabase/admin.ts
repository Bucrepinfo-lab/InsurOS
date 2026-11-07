import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — SERVER ONLY (never import from a client
 * component). Used solely to delete a user's own auth account on request.
 * Env (names only): NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 * Returns null when the service-role key is not configured.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
