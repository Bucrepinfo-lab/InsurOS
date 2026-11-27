import type { EntityId, IsoDateTime } from "./base";
import { toE164 } from "./phone";

/**
 * My record — what a person may change about themselves (owner 27/11/26:
 * "insurance is very professional, and it is also good to edit").
 *
 * The line follows how regulated firms do it, and Kenya's Data Protection Act
 * s.40 (a person may have wrong or out-of-date data about them corrected):
 * - Their own photo and work email: changed by the person at once, recorded.
 * - Their name (the name on their licence and documents) and their sign-in
 *   number: a correction request with a reason, decided by someone who manages
 *   access. Each decision is recorded. A number change keeps the person's
 *   record and PIN; their signed-in phones sign out.
 */

export type ProfileChangeField = "name" | "phone";
export type ProfileChangeStatus = "Pending" | "Approved" | "Declined";

/** Per person (id = their user id). Starts empty in every tenant. */
export interface StaffProfile {
  id: EntityId;
  /** Work email for documents and replies. Optional, never used to sign in. */
  email?: string;
  /** Private storage path of their photo, shown through an expiring link. */
  photoPath?: string;
  updatedAt: IsoDateTime;
}

export interface ProfileChangeRequest {
  id: EntityId;
  userId: string;
  userName: string;
  /** Sign-in number at the time of the request (who is asking). */
  phone: string;
  regionId: EntityId;
  field: ProfileChangeField;
  from: string;
  to: string;
  reason: string;
  status: ProfileChangeStatus;
  requestedAt: IsoDateTime;
  decidedBy?: string;
  decidedAt?: IsoDateTime;
  /** Why it was declined, shown to the person. */
  note?: string;
}

export type Checked<T> = { ok: true; value: T } | { ok: false; error: string };

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,24}$/i;

/** An empty box removes the email. */
export function checkWorkEmail(raw: string): Checked<string | null> {
  const value = raw.trim().toLowerCase();
  if (!value) return { ok: true, value: null };
  if (value.length > 254 || !EMAIL.test(value)) return { ok: false, error: "Enter an email like name@agency.co.ke, or leave it empty." };
  if (value.endsWith("@phone.insuros")) return { ok: false, error: "Enter your own email address." };
  return { ok: true, value };
}

/** Letters (any language), spaces, apostrophes, dots and hyphens; 2 to 120 characters. */
export function checkLegalName(raw: string): Checked<string> {
  const value = raw.trim().replace(/\s+/g, " ");
  if (value.length < 2 || value.length > 120) return { ok: false, error: "Enter the name as it appears on your ID or licence." };
  if (!/^[\p{L}\p{M}][\p{L}\p{M}' .-]*$/u.test(value)) return { ok: false, error: "Use letters only, as on your ID or licence." };
  return { ok: true, value };
}

/** Check a correction request before it is recorded. */
export function checkProfileChange(
  field: ProfileChangeField,
  current: string,
  rawTo: string,
  rawReason: string
): Checked<{ to: string; reason: string }> {
  const reason = rawReason.trim().replace(/\s+/g, " ");
  if (reason.length < 5) return { ok: false, error: "Say in a few words why it should change." };
  if (reason.length > 300) return { ok: false, error: "Keep the reason under 300 characters." };
  if (field === "name") {
    const name = checkLegalName(rawTo);
    if (!name.ok) return name;
    if (name.value.toLowerCase() === current.trim().toLowerCase()) return { ok: false, error: "That is already your name." };
    return { ok: true, value: { to: name.value, reason } };
  }
  const phone = toE164(rawTo);
  if (!phone) return { ok: false, error: "Enter a valid phone number, e.g. 0712 345 678." };
  if (phone === toE164(current)) return { ok: false, error: "That is already your number." };
  return { ok: true, value: { to: phone, reason } };
}

/** Only one open request per person and field. */
export function hasOpenRequest(requests: ProfileChangeRequest[], userId: string, field: ProfileChangeField): boolean {
  return requests.some((r) => r.userId === userId && r.field === field && r.status === "Pending");
}
