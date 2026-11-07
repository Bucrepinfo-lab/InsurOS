import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client used ONLY to send and verify the SMS one-time
 * code. It keeps no session: InsurOS issues its own signed app session and
 * trusted-device cookie after the code is verified (lib/auth/device-auth.ts).
 */
export function createSupabaseOtpClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });
}
