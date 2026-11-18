import type { Customer } from "./customer";
import { cleanReferralCode } from "./country-economics";
import type { PolicyStatus } from "./policy";

/**
 * Checks for the data-entry forms (customer, policy, claim). PURE: the server
 * action runs these on whatever the browser sent; the browser's own checks are
 * a convenience only.
 */
export type FormCheck<T> = { ok: true; value: T } | { ok: false; field: string; error: string };

const text = (value: unknown): string => (typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "");

/** Letters, digits and ordinary punctuation: no markup, no control characters. */
const PLAIN = /^[\p{L}\p{N} .,'&()\/-]+$/u;

export interface CustomerFormValue {
  name: string;
  type: Customer["type"];
  email: string;
  /** Cleaned referral code, or empty when nobody referred them. */
  referredBy: string;
}

export function checkCustomerForm(input: {
  name?: unknown;
  type?: unknown;
  email?: unknown;
  referredBy?: unknown;
}): FormCheck<CustomerFormValue> {
  const name = text(input.name);
  if (name.length < 2) return { ok: false, field: "name", error: "Enter the customer's full name." };
  if (name.length > 120) return { ok: false, field: "name", error: "The name is too long (120 characters at most)." };
  if (!PLAIN.test(name)) return { ok: false, field: "name", error: "Use letters, numbers and ordinary punctuation in the name." };
  if (input.type !== "Individual" && input.type !== "Business") {
    return { ok: false, field: "type", error: "Choose Individual or Business." };
  }
  const email = text(input.email).toLowerCase();
  if (email !== "" && (email.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))) {
    return { ok: false, field: "email", error: "That email address does not look right. Leave it empty if there is none." };
  }
  const typedCode = text(input.referredBy);
  const referredBy = typedCode === "" ? "" : cleanReferralCode(typedCode);
  if (referredBy === null) {
    return { ok: false, field: "referredBy", error: "That referral code does not look right. It is two letters, a dash and six characters, for example KE-CFT5SD." };
  }
  return { ok: true, value: { name, type: input.type, email, referredBy } };
}

/** A money amount typed by a person: "12,000", "12000.50", "KES 12 000". Whole shillings, above zero. */
export function checkAmount(raw: unknown, field = "amount"): FormCheck<number> {
  const cleaned = text(raw).replace(/^kes\s*/i, "").replace(/[ ,]/g, "");
  if (!/^\d{1,12}(\.\d{1,2})?$/.test(cleaned)) return { ok: false, field, error: "Enter an amount in shillings, for example 12,000." };
  const amount = Math.round(Number(cleaned));
  if (amount <= 0) return { ok: false, field, error: "The amount must be more than zero." };
  if (amount > 1_000_000_000) return { ok: false, field, error: "That amount is too large. Check the figure." };
  return { ok: true, value: amount };
}

/** "KES 12,000": the way amounts are written across the workspace. */
export function formatKes(amount: number): string {
  return `KES ${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export const NEW_POLICY_STATUSES: readonly PolicyStatus[] = ["Active", "Pending"];

export interface PolicyFormValue {
  customerId: string;
  product: string;
  premium: number;
  status: PolicyStatus;
  insuredItem?: string;
  sumInsured?: number;
  registration?: string;
  yearOfManufacture?: number;
  startDate: string;
  expiryDate: string;
}

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const validDay = (value: string) => ISO_DAY.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().startsWith(value);

/** One year of cover from a start date: the day before the same date next year. */
export function defaultExpiry(startDate: string): string {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(Date.UTC(start.getUTCFullYear() + 1, start.getUTCMonth(), start.getUTCDate() - 1));
  return end.toISOString().slice(0, 10);
}

export function checkPolicyForm(input: {
  customerId?: unknown;
  product?: unknown;
  premium?: unknown;
  status?: unknown;
  insuredItem?: unknown;
  sumInsured?: unknown;
  registration?: unknown;
  yearOfManufacture?: unknown;
  startDate?: unknown;
  expiryDate?: unknown;
  today?: string;
}): FormCheck<PolicyFormValue> {
  const customerId = text(input.customerId);
  if (customerId === "" || customerId.length > 120) return { ok: false, field: "customerId", error: "Choose the customer." };
  const product = text(input.product);
  if (product.length < 2) return { ok: false, field: "product", error: "Enter the product, for example Motor Comprehensive." };
  if (product.length > 80 || !PLAIN.test(product)) {
    return { ok: false, field: "product", error: "Use a short product name in letters and numbers." };
  }
  const premium = checkAmount(input.premium, "premium");
  if (!premium.ok) return premium;
  const status = NEW_POLICY_STATUSES.find((candidate) => candidate === input.status);
  if (!status) return { ok: false, field: "status", error: "Choose whether the policy is in force or pending." };
  const insuredItem = text(input.insuredItem);
  if (insuredItem.length > 80 || (insuredItem && !PLAIN.test(insuredItem))) {
    return { ok: false, field: "insuredItem", error: "Describe what is insured in a few words, for example Toyota Axio." };
  }
  let sumInsured: number | undefined;
  if (text(input.sumInsured) !== "") {
    const value = checkAmount(input.sumInsured, "sumInsured");
    if (!value.ok) return value;
    sumInsured = value.value;
  }
  const registration = text(input.registration).toUpperCase();
  if (registration && !/^[A-Z0-9 -]{3,12}$/.test(registration)) return { ok: false, field: "registration", error: "That registration does not look right, for example KDA 123A." };
  let yearOfManufacture: number | undefined;
  if (text(input.yearOfManufacture) !== "") {
    yearOfManufacture = Number(text(input.yearOfManufacture));
    const thisYear = Number((input.today ?? new Date().toISOString()).slice(0, 4));
    if (!Number.isInteger(yearOfManufacture) || yearOfManufacture < 1950 || yearOfManufacture > thisYear + 1) {
      return { ok: false, field: "yearOfManufacture", error: "Enter the year the vehicle was made, for example 2016." };
    }
  }
  const startDate = text(input.startDate) || (input.today ?? new Date().toISOString()).slice(0, 10);
  if (!validDay(startDate)) return { ok: false, field: "startDate", error: "Enter the date cover starts." };
  const expiryDate = text(input.expiryDate) || defaultExpiry(startDate);
  if (!validDay(expiryDate) || expiryDate <= startDate) return { ok: false, field: "expiryDate", error: "The expiry date must be after the start date." };
  return {
    ok: true,
    value: {
      customerId,
      product,
      premium: premium.value,
      status,
      ...(insuredItem ? { insuredItem } : {}),
      ...(sumInsured !== undefined ? { sumInsured } : {}),
      ...(registration ? { registration: registration.replace(/\s+/g, " ") } : {}),
      ...(yearOfManufacture !== undefined ? { yearOfManufacture } : {}),
      startDate,
      expiryDate
    }
  };
}

export interface ClaimFormValue {
  policyId: string;
  amount: number;
}

export function checkClaimForm(input: { policyId?: unknown; amount?: unknown }): FormCheck<ClaimFormValue> {
  const policyId = text(input.policyId);
  if (policyId === "" || policyId.length > 120) return { ok: false, field: "policyId", error: "Choose the policy the claim is on." };
  const amount = checkAmount(input.amount);
  if (!amount.ok) return amount;
  return { ok: true, value: { policyId, amount: amount.value } };
}

/** A record number such as POL-2026-048213: prefix, year (East Africa Time) and six digits. */
export function newRecordNumber(prefix: "POL" | "CLM" | "CUS" | "DOC", now: Date, sequence: number): string {
  const year = new Date(now.getTime() + 3 * 3_600_000).getUTCFullYear();
  return `${prefix}-${year}-${String(Math.abs(Math.trunc(sequence)) % 1_000_000).padStart(6, "0")}`;
}
