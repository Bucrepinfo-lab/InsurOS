"use server";

import { toE164 } from "@insuros/domain";
import { getAuthMode } from "@/lib/auth/config";
import { matchesPlayReview, playReviewConfig, reviewerPassword } from "@/lib/play-review";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Google Play reviewer sign-in (no SMS). Only when PLAY_REVIEW_PHONE and
 * PLAY_REVIEW_CODE are both set and the pair matches (constant-time). Ensures a
 * Supabase user exists for that phone with a server-derived password, then signs
 * in server-side (session cookie). The session is routed to the demo tenant.
 * Returns a bare ok flag — never says whether a phone is the reviewer's.
 */
export async function reviewerSignIn(phoneInput: string, code: string): Promise<{ ok: boolean }> {
  if (getAuthMode() !== "supabase") return { ok: false };
  const config = playReviewConfig();
  const phone = toE164(phoneInput);
  if (!config || !phone || !matchesPlayReview(phone, code)) return { ok: false };

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const admin = createSupabaseAdminClient();
  if (!admin || !serviceRoleKey) return { ok: false };
  const password = reviewerPassword(serviceRoleKey);
  if (!password) return { ok: false };

  // Find the reviewer's auth user by phone (Supabase stores phone without "+").
  const digits = phone.replace(/^\+/, "");
  let userId: string | undefined;
  for (let page = 1; page <= 20 && !userId; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return { ok: false };
    userId = data.users.find((user) => (user.phone ?? "").replace(/^\+/, "") === digits)?.id;
    if (data.users.length < 200) break;
  }

  if (userId) {
    const { error } = await admin.auth.admin.updateUserById(userId, { password, phone_confirm: true });
    if (error) return { ok: false };
  } else {
    const { error } = await admin.auth.admin.createUser({
      phone,
      password,
      phone_confirm: true,
      user_metadata: { full_name: "Store reviewer" }
    });
    if (error) return { ok: false };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ phone, password });
  return { ok: !error };
}
