"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Google Play requires an in-app + web account-deletion path. InsurOS is currently
 * mock-backed, so a policyholder's *account* is their Supabase login (and device
 * trust) — this removes it. Policies and claims are the insurer's records, retained
 * under the insurer's data-retention policy. When PostgreSQL lands, also erase the
 * policyholder's personal profile row here.
 */
export async function deleteMyAccount(): Promise<{ ok: boolean }> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return { ok: true };
}
