import crypto from "node:crypto";
import { toE164 } from "@insuros/domain";

/**
 * Google Play reviewer access. Active ONLY when BOTH PLAY_REVIEW_PHONE and
 * PLAY_REVIEW_CODE are set (names only; values live in Fly secrets and in the
 * Play Console "App access" section). The reviewer signs in with that phone and
 * code (no SMS needed) and lands in the isolated demo tenant with sample data —
 * never in a real organisation's data.
 */
export interface PlayReviewConfig {
  phone: string;
  code: string;
}

export function playReviewConfig(): PlayReviewConfig | null {
  const phone = toE164(process.env.PLAY_REVIEW_PHONE ?? "");
  const code = (process.env.PLAY_REVIEW_CODE ?? "").trim();
  if (!phone || code.length < 6) return null;
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

/** Password for the reviewer's Supabase user, derived server-side (never stored or shown). */
export function reviewerPassword(serviceRoleKey: string): string | null {
  const config = playReviewConfig();
  if (!config) return null;
  return crypto
    .createHmac("sha256", serviceRoleKey)
    .update(`insuros-play-review|${config.phone}|${config.code}`)
    .digest("base64url");
}
