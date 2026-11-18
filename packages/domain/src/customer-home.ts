import type { Policy } from "./policy";

/**
 * What a customer sees about their own cover — PURE.
 *
 * Their policies, what is insured and for how much, when cover ends, and for
 * vehicles an ESTIMATE of today's value. Reminders start 30 days before
 * expiry. Figures are shown as the customer's records hold them; the
 * insurer's valuation and policy schedule decide.
 */
export type ExpiryLevel = "expired" | "due-soon" | "in-force" | "unknown";

export const RENEWAL_REMINDER_DAYS = 30;

export interface ExpiryStatus {
  level: ExpiryLevel;
  /** Whole days until the last day of cover (negative after it). */
  days: number | null;
  words: string;
}

const DAY = 86_400_000;
/** Today's calendar date on the country's clock (default Nairobi): `2026-11-18`. */
export const localDay = (now: Date, timeZone = "Africa/Nairobi") =>
  new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
const eatDay = (now: Date, timeZone?: string) => localDay(now, timeZone);

export function expiryStatus(expiryDate: string | undefined, now: Date, timeZone?: string): ExpiryStatus {
  if (!expiryDate || !/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) return { level: "unknown", days: null, words: "Expiry date not on record" };
  const days = Math.round((Date.parse(`${expiryDate}T00:00:00Z`) - Date.parse(`${eatDay(now, timeZone)}T00:00:00Z`)) / DAY);
  if (days < 0) return { level: "expired", days, words: `Expired ${-days} ${-days === 1 ? "day" : "days"} ago` };
  if (days === 0) return { level: "due-soon", days, words: "Last day of cover is today" };
  if (days <= RENEWAL_REMINDER_DAYS) return { level: "due-soon", days, words: `Expires in ${days} ${days === 1 ? "day" : "days"}` };
  return { level: "in-force", days, words: `In force for ${days} more days` };
}

/**
 * Kenya: depreciation by vehicle age that KRA applies to used vehicles under
 * the EAC rates (public notice, effective 1 September 2023). Used here only to
 * estimate how a car's value moves; it is not the insurer's valuation.
 * Age in whole years since manufacture -> share of value lost.
 */
export const KE_VEHICLE_DEPRECIATION: { overYears: number; upToYears: number; lost: number }[] = [
  { overYears: 1, upToYears: 2, lost: 0.2 },
  { overYears: 2, upToYears: 3, lost: 0.3 },
  { overYears: 3, upToYears: 4, lost: 0.4 },
  { overYears: 4, upToYears: 5, lost: 0.5 },
  { overYears: 5, upToYears: 6, lost: 0.55 },
  { overYears: 6, upToYears: 7, lost: 0.6 },
  { overYears: 7, upToYears: 8, lost: 0.65 }
];

/** Share of value lost at an age, or null when the schedule does not cover it (over 8 years). */
export function depreciationAt(ageYears: number): number | null {
  if (ageYears <= 1) return 0;
  const band = KE_VEHICLE_DEPRECIATION.find((row) => ageYears > row.overYears && ageYears <= row.upToYears);
  return band ? band.lost : null;
}

export interface ValueEstimate {
  insured: number;
  estimateToday: number | null;
  /** Negative = lost value since the policy started. */
  change: number | null;
  note: string;
}

/**
 * Today's value of a vehicle, estimated from the value insured at the start
 * of cover and the age bands above. Kenya only; other countries get no
 * estimate until a schedule is entered for them.
 */
export function estimateVehicleValue(
  policy: Pick<Policy, "sumInsured" | "yearOfManufacture" | "startDate">,
  now: Date,
  countryCode = "KE"
): ValueEstimate | null {
  if (!policy.sumInsured) return null;
  const insured = policy.sumInsured;
  if (countryCode !== "KE" || !policy.yearOfManufacture || !policy.startDate) {
    return { insured, estimateToday: null, change: null, note: "No estimate: the vehicle's year or the cover start date is missing." };
  }
  const years = (iso: string) => (Date.parse(`${iso}T00:00:00Z`) - Date.UTC(policy.yearOfManufacture!, 0, 1)) / (365.25 * DAY);
  const atStart = depreciationAt(years(policy.startDate));
  const today = depreciationAt(years(eatDay(now)));
  if (atStart === null || today === null) {
    return { insured, estimateToday: null, change: null, note: "Over 8 years old: ask your agent for a valuation." };
  }
  const estimate = Math.round((insured * (1 - today)) / (1 - atStart) / 1000) * 1000;
  return {
    insured,
    estimateToday: estimate,
    change: estimate - insured,
    note: "An estimate from the vehicle's age (KRA's used-vehicle depreciation bands). The insurer's valuation decides; review the value insured at renewal."
  };
}

/** Policies that belong to a customer: by record id, or by name for older rows. */
export function policiesOfCustomer<P extends Pick<Policy, "customer" | "customerId">>(
  policies: readonly P[],
  customer: { id: string; name: string }
): P[] {
  return policies.filter((policy) => policy.customerId === customer.id || (!policy.customerId && policy.customer === customer.name));
}
