/**
 * Supabase phone-OTP auth is enabled only when a project URL + anon key are set.
 * Without them, the app runs in open dev mode (a local dev principal, full access)
 * — outside production only. In production a missing URL/key FAILS CLOSED (see lib/auth/config.ts).
 */
export const supabaseEnabled =
  /^https:\/\/.+\.supabase\.co/.test(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "") &&
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").length > 20;
