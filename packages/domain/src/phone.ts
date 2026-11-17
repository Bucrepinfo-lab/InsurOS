/**
 * Phone normalization to E.164 — PURE. The phone is the login identity AND the
 * M-Pesa identity (SMS OTP + STK push both target the same E.164 number).
 * Defaults to Kenya (+254); other E.164 numbers pass through unchanged.
 */
export interface NormalizePhoneOptions {
  defaultCountryCode?: string;
}

function cleanPhone(input: string): string {
  return input.trim().replace(/[\s()\-.]/g, "");
}

const E164_DIGITS = /^[1-9]\d{7,14}$/;

function e164OrNull(digits: string): string | null {
  return E164_DIGITS.test(digits) ? `+${digits}` : null;
}

export function toE164(input: string, options: NormalizePhoneOptions = {}): string | null {
  const cc = options.defaultCountryCode ?? "254";
  if (!input) return null;
  const s = cleanPhone(input);
  if (!s) return null;
  if (s.startsWith("+")) return e164OrNull(s.slice(1));
  if (s.startsWith("00")) return e164OrNull(s.slice(2));
  if (s.startsWith("0")) return e164OrNull(cc + s.slice(1));
  if (s.startsWith(cc)) return e164OrNull(s);
  return e164OrNull(cc + s);
}

/**
 * Recipient for Africa's Talking SMS, which needs "+E.164". Supabase's Send-SMS
 * hook passes `user.phone` as bare international digits ("254712345678",
 * "447700900123") with no plus, so a bare 11-15 digit string is already
 * international and must NOT get the default country code prefixed again.
 * Local forms ("0712...", "712...") still go through toE164's Kenya default.
 */
export function toSmsRecipient(input: string, options: NormalizePhoneOptions = {}): string | null {
  if (!input) return null;
  const s = cleanPhone(input);
  if (!s) return null;
  if (s.startsWith("+")) return e164OrNull(s.slice(1));
  if (s.startsWith("00")) return e164OrNull(s.slice(2));
  if (s.startsWith("0")) return toE164(s, options);
  if (/^\d{11,15}$/.test(s)) return e164OrNull(s);
  return toE164(s, options);
}

export function isE164(input: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(input.trim());
}
