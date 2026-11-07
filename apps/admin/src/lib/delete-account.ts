"use server";

import { toE164 } from "@insuros/domain";
import { PrincipalService } from "@insuros/services";
import { getAuthMode } from "@/lib/auth/config";
import { deidentifyPayer } from "@/lib/payments";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DeleteAccountResult =
  | { ok: true }
  | { ok: false; reason: "unauthenticated" | "not_configured" | "provider_error" };

/**
 * Google Play account deletion — really deletes the account:
 *
 * 1. Erase the person's personal data in our store (staff appointment + role
 *    grants revoked and de-identified).
 * 2. De-identify their payment-ledger rows (rows retained, append-only).
 * 3. Delete the Supabase auth user via the admin API (service-role key,
 *    server-only), then end the session.
 *
 * Policies and claims an insurer holds about its customers are the insurer's
 * records (retention per the privacy policy), not this user's account.
 * The user id comes from the server session only — never from the client.
 */
export async function deleteMyAccount(): Promise<DeleteAccountResult> {
  if (getAuthMode() !== "supabase") return { ok: false, reason: "not_configured" };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "unauthenticated" };

  const admin = createSupabaseAdminClient();
  if (!admin) return { ok: false, reason: "not_configured" };

  const phone = user.phone ? toE164(user.phone) : null;

  await new PrincipalService().erasePersonalData({ phone, email: user.email || null });
  if (phone) deidentifyPayer(phone);

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { ok: false, reason: "provider_error" };

  await supabase.auth.signOut().catch(() => undefined);
  return { ok: true };
}
