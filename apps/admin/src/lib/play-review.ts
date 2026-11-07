import crypto from "node:crypto";
import { toE164 } from "@insuros/domain";

/**
 * Google Play reviewer access. Active ONLY when BOTH PLAY_REVIEW_PHONE and
 * PLAY_REVIEW_CODE are set (names only; values live in Fly secrets and in the
 * Play Console "App access" section). The reviewer enters that phone, then that
 * 6-digit code in place of the SMS code (no SMS is sent), and lands in the
 * isolated demo tenant with sample data — never in a real organisation's data.
 * On the reviewer's device they may set a PIN or skip it.
 */
/** Stable identity of the store reviewer (no Supabase account is created). */
export const PLAY_REVIEW_USER_ID = "play-review";

export interface PlayReviewConfig {
  phone: string;
  code: string;
}

export function playReviewConfig(): PlayReviewConfig | null {
  const phone = toE164(process.env.PLAY_REVIEW_PHONE ?? "");
  const code = (process.env.PLAY_REVIEW_CODE ?? "").trim();
  if (!phone || !/^\d{6}$/.test(code)) return null;
  return { phone, code };
}

export function isPlayReviewPhone(phone: string | null | undefined): boolean {
  const config = playReviewConfig();
  if (!config || !phone) return false;
  return toE164(phone) === config.phone;
}

/** Constant-time check of a reviewer phone + code pair. */
export function matchesPlayReview(phone: string, code: string): boolean {
  const config = playReviewConfig();
  if (!config) return false;
  const a = crypto.createHash("sha256").update(`${toE164(phone) ?? ""}|${code.trim()}`).digest();
  const b = crypto.createHash("sha256").update(`${config.phone}|${config.code}`).digest();
  return crypto.timingSafeEqual(a, b);
}
