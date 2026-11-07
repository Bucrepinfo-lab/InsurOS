"use server";

import { PrincipalService } from "@insuros/services";
import { getAuthMode } from "@/lib/auth/config";
import { clearDeviceCookie, clearSessionCookie, getDeviceAuth } from "@/lib/auth/device-auth";
import { getSessionIdentity } from "@/lib/auth/session-user";
import { deidentifyPayer } from "@/lib/payments";
import { PLAY_REVIEW_USER_ID } from "@/lib/play-review";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import "@/lib/tenant-context";

export type DeleteAccountResult =
  | { ok: true }
  | { ok: false; reason: "unauthenticated" | "not_configured" | "provider_error" };

/**
 * Google Play account deletion — really deletes the account:
 *
 * 1. Erase the person's personal data in our store (staff appointment + role
 *    grants revoked and de-identified; PIN deleted; every trusted device revoked).
 * 2. De-identify their payment-ledger rows (rows retained, append-only).
 * 3. Delete the Supabase auth user via the admin API (service-role key,
 *    server-only), then end the session on this device.
 *
 * The user id comes from the verified server session only — never the client.
 */
export async function deleteMyAccount(): Promise<DeleteAccountResult> {
  if (getAuthMode() !== "supabase") return { ok: false, reason: "not_configured" };

  const identity = await getSessionIdentity();
  if (!identity) return { ok: false, reason: "unauthenticated" };

  const isReviewer = identity.userId === PLAY_REVIEW_USER_ID;
  const admin = createSupabaseAdminClient();
  if (!admin && !isReviewer) return { ok: false, reason: "not_configured" };

  await new PrincipalService().erasePersonalData({ phone: identity.phone });
  await deidentifyPayer(identity.phone);

  if (!isReviewer && admin) {
    const { error } = await admin.auth.admin.deleteUser(identity.userId);
    if (error) return { ok: false, reason: "provider_error" };
  }

  await getDeviceAuth().forgetUser(identity.userId);
  await clearSessionCookie();
  await clearDeviceCookie();
  return { ok: true };
}
