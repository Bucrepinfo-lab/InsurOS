import { supabaseEnabled } from "../supabase-enabled";

/**
 * How the app authenticates this process.
 *
 * - "supabase": phone-OTP via Supabase (the only mode allowed in production).
 * - "open-dev": local development only (NODE_ENV !== "production") — a local
 *   developer principal, no sign-in.
 * - "misconfigured": production without Supabase settings or without
 *   DATABASE_URL (production data must be durable). The app FAILS CLOSED:
 *   no dashboard, no actions, /api/health reports 503.
 */
export type AuthMode = "supabase" | "open-dev" | "misconfigured";

export const isProductionRuntime = process.env.NODE_ENV === "production";

export function authSecretConfigured(): boolean {
  return (process.env.AUTH_SECRET ?? "").length >= 32;
}

export function getAuthMode(): AuthMode {
  if (isProductionRuntime && !process.env.DATABASE_URL) return "misconfigured";
  if (isProductionRuntime && !authSecretConfigured()) return "misconfigured";
  if (supabaseEnabled) return "supabase";
  return isProductionRuntime ? "misconfigured" : "open-dev";
}

/** Names (never values) of the required production settings that are missing. */
export function missingAuthEnvNames(): string[] {
  const missing: string[] = [];
  if (isProductionRuntime && !process.env.DATABASE_URL) missing.push("DATABASE_URL");
  if (isProductionRuntime && !authSecretConfigured()) missing.push("AUTH_SECRET");
  if (!/^https:\/\/.+\.supabase\.co/.test(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if ((process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").length <= 20) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return missing;
}
