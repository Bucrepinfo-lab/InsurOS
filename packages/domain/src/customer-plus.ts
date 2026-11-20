/**
 * The customer's own page, and its monthly plan "My Cover Plus" — PURE.
 *
 * Owner brief 18/11/26: the customer page is (1) a marketing tool customers
 * show to friends and family, and (2) a monthly subscription of 10 units of
 * the local currency, first month free, charged only for months taken.
 *
 * What stays free, always: what they have insured, when cover ends, the
 * reminders, reporting a claim and talking to their agent. Locking a
 * policyholder out of their own cover or a claim would hurt them and the
 * agency's standing with the regulator, so those are never behind the plan.
 * Plus adds what people come back to look at: the value of what they insured
 * today, the agency's news and offers, and their cover as a PDF.
 *
 * Price (owner 18/11/26): KES 49 a month or KES 490 a year. Whoever joins in
 * the founding window (the first 12 months after launch) keeps that price for
 * as long as they stay subscribed; a lapse of two months or more ends the lock.
 *
 * Months are calendar months on the country's clock. There is no automatic
 * renewal: each month is paid by the customer on their own phone, and a month
 * not paid is simply not charged.
 */
export const PLUS_TRIAL_DAYS = 30;

/**
 * Prices (owner decision 18/11/26, replacing 10 units a month): Kenya KES 49 a
 * month or KES 490 a year (two months free). Other countries are set near the
 * same value (about USD 0.40 a month) and marked indicative until a person
 * approves them for that country. Approved by the owner 20/11/26 ("approve all
 * prices"): Uganda, Tanzania, Rwanda, Nigeria, Ghana and South Africa; then the
 * pawaPay second round ("approve the second-round prices").
 */
export type PlusPlan = "MONTH" | "YEAR";

export interface PlusPrice {
  currency: string;
  monthly: number;
  yearly: number;
  /** Approved for this country by a named person; otherwise indicative. */
  approved: boolean;
}

export const PLUS_PRICES: Record<string, PlusPrice> = {
  KE: { currency: "KES", monthly: 49, yearly: 490, approved: true },
  UG: { currency: "UGX", monthly: 1_500, yearly: 15_000, approved: true },
  TZ: { currency: "TZS", monthly: 1_000, yearly: 10_000, approved: true },
  RW: { currency: "RWF", monthly: 500, yearly: 5_000, approved: true },
  NG: { currency: "NGN", monthly: 600, yearly: 6_000, approved: true },
  GH: { currency: "GHS", monthly: 5, yearly: 50, approved: true },
  ZA: { currency: "ZAR", monthly: 7, yearly: 70, approved: true },
  // Second round, approved by the owner 20/11/26: the pawaPay countries.
  ZM: { currency: "ZMW", monthly: 8, yearly: 80, approved: true },
  MW: { currency: "MWK", monthly: 650, yearly: 6_500, approved: true },
  MZ: { currency: "MZN", monthly: 25, yearly: 250, approved: true },
  CM: { currency: "XAF", monthly: 220, yearly: 2_200, approved: true },
  CG: { currency: "XAF", monthly: 220, yearly: 2_200, approved: true },
  GA: { currency: "XAF", monthly: 220, yearly: 2_200, approved: true },
  CI: { currency: "XOF", monthly: 220, yearly: 2_200, approved: true },
  SN: { currency: "XOF", monthly: 220, yearly: 2_200, approved: true },
  BJ: { currency: "XOF", monthly: 220, yearly: 2_200, approved: true },
  BF: { currency: "XOF", monthly: 220, yearly: 2_200, approved: true },
  CD: { currency: "CDF", monthly: 900, yearly: 9_000, approved: true },
  LS: { currency: "LSL", monthly: 6, yearly: 60, approved: true },
  SL: { currency: "SLE", monthly: 9, yearly: 90, approved: true },
  ZW: { currency: "USD", monthly: 0.49, yearly: 4.9, approved: true },
  ET: { currency: "ETB", monthly: 60, yearly: 600, approved: true },
  IN: { currency: "INR", monthly: 35, yearly: 350, approved: false },
  GB: { currency: "GBP", monthly: 0.49, yearly: 4.9, approved: false },
  US: { currency: "USD", monthly: 0.49, yearly: 4.9, approved: false }
};

/** Months a plan covers. */
export const PLAN_MONTHS: Record<PlusPlan, number> = { MONTH: 1, YEAR: 12 };

/** How long the founding price is held for those who join early. */
export const PLUS_FOUNDING_MONTHS = 12;

export type PlusFeature = "value-today" | "announcements" | "cover-pdf";

export const PLUS_FEATURES: { id: PlusFeature; title: string; sw: string }[] = [
  { id: "value-today", title: "What your vehicle is worth today", sw: "Thamani ya gari lako leo" },
  { id: "announcements", title: "News and offers from your agency", sw: "Habari na ofa kutoka kwa wakala wako" },
  { id: "cover-pdf", title: "Your cover as a PDF to keep or show", sw: "Bima zako kama PDF ya kuhifadhi au kuonyesha" }
];

export type PlusState =
  /** Payments are not switched on yet: everyone gets Plus, nobody is asked to pay. */
  | "open"
  /** Inside the free first month. */
  | "trial"
  /** This calendar month is paid. */
  | "paid"
  /** Free month over and this month not paid: Plus is paused, everything else still works. */
  | "paused";

export interface PlusAccount {
  /** First time the customer opened their page: the free month starts here. */
  plusStartedAt?: string;
  /** Calendar months paid, "2026-12". Written only by a confirmed payment. */
  plusPaidMonths?: string[];
  /**
   * The founding price, locked on the customer's first confirmed payment made
   * inside the founding window. It holds for as long as they keep paying
   * without a gap of more than one month.
   */
  plusPriceLock?: { monthly: number; yearly: number; currency: string; lockedAt: string };
}

export interface PlusStatus {
  state: PlusState;
  unlocked: boolean;
  /** "2026-11" on the country's clock. */
  month: string;
  /** Last day of the free month, "2026-12-17", when in trial. */
  trialEndsOn: string | null;
  daysLeft: number | null;
  /** What this customer pays: their locked founding price, or today's list price. */
  price: { monthly: number; yearly: number; currency: string; locked: boolean };
}

const DAY = 86_400_000;

/** "2026-11" on a country's clock. */
export function monthKey(now: Date, timeZone = "Africa/Nairobi"): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit" }).format(now).slice(0, 7);
}

export function listPriceFor(countryCode: string | undefined): PlusPrice {
  return PLUS_PRICES[(countryCode ?? "KE").toUpperCase()] ?? PLUS_PRICES.KE!;
}

/** "2026-11" → "2026-12" (n months on). */
export function addMonths(month: string, n: number): string {
  const [y, m] = month.split("-").map(Number) as [number, number];
  const total = y * 12 + (m - 1) + n;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}

/**
 * Does the customer's locked price still hold? Yes while their paid months run
 * without a gap of more than one month up to `month` (a lapse of two months
 * or more returns them to the list price).
 */
export function lockHolds(account: PlusAccount, month: string): boolean {
  if (!account.plusPriceLock) return false;
  const paid = new Set(account.plusPaidMonths ?? []);
  const last = [...paid].filter((m) => m <= month).sort().at(-1);
  if (!last) return false;
  return addMonths(last, 2) > month;
}

/** The price this customer pays now: their founding price if it holds, else the list price. */
export function priceFor(account: PlusAccount, list: PlusPrice, month: string): PlusStatus["price"] {
  if (account.plusPriceLock && lockHolds(account, month)) {
    const l = account.plusPriceLock;
    return { monthly: l.monthly, yearly: l.yearly, currency: l.currency, locked: true };
  }
  return { monthly: list.monthly, yearly: list.yearly, currency: list.currency, locked: false };
}

/** Is the founding window open? `foundingUntil` unset means Plus has not launched yet: open. */
export function foundingOpen(now: Date, foundingUntil: string | null | undefined): boolean {
  if (!foundingUntil) return true;
  const end = Date.parse(foundingUntil);
  return Number.isNaN(end) || now.getTime() < end;
}

export function plusStatus(
  account: PlusAccount,
  input: { now: Date; timeZone?: string; list: PlusPrice; paymentsOn: boolean }
): PlusStatus {
  const month = monthKey(input.now, input.timeZone);
  const price = priceFor(account, input.list, month);
  const started = account.plusStartedAt ? Date.parse(account.plusStartedAt) : input.now.getTime();
  const trialEnd = started + PLUS_TRIAL_DAYS * DAY;
  const daysLeft = Math.max(0, Math.ceil((trialEnd - input.now.getTime()) / DAY));
  const trialEndsOn = new Intl.DateTimeFormat("en-CA", { timeZone: input.timeZone ?? "Africa/Nairobi" }).format(new Date(trialEnd - 1));
  if (!input.paymentsOn) return { state: "open", unlocked: true, month, trialEndsOn: null, daysLeft: null, price };
  if (input.now.getTime() < trialEnd) return { state: "trial", unlocked: true, month, trialEndsOn, daysLeft, price };
  if (account.plusPaidMonths?.includes(month)) return { state: "paid", unlocked: true, month, trialEndsOn: null, daysLeft: null, price };
  return { state: "paused", unlocked: false, month, trialEndsOn: null, daysLeft: null, price };
}

/** Record a confirmed payment for a month. Paying the same month twice keeps one entry. */
export function withPaidMonth(account: PlusAccount, month: string): Required<Pick<PlusAccount, "plusPaidMonths">> {
  return withPaidPlan(account, month, "MONTH");
}

/** Record a confirmed payment for a plan starting at `month` (a year covers 12 months). Idempotent. */
export function withPaidPlan(account: PlusAccount, month: string, plan: PlusPlan): Required<Pick<PlusAccount, "plusPaidMonths">> {
  if (!/^\d{4}-\d{2}$/.test(month)) throw new Error("month must look like 2026-11");
  const months = Array.from({ length: PLAN_MONTHS[plan] }, (_, i) => addMonths(month, i));
  return { plusPaidMonths: [...new Set([...(account.plusPaidMonths ?? []), ...months])].sort() };
}

/**
 * Apply a confirmed Plus payment: the months it covers, and the founding price
 * locked when this is the customer's first payment inside the founding window.
 * Refuses an amount below what the plan costs this customer.
 */
export function applyPlusPayment(
  account: PlusAccount,
  input: { month: string; plan: PlusPlan; amount: number; list: PlusPrice; now: Date; foundingUntil?: string | null }
): { ok: true; update: Pick<PlusAccount, "plusPaidMonths" | "plusPriceLock"> } | { ok: false; reason: string } {
  const price = priceFor(account, input.list, input.month);
  const due = input.plan === "YEAR" ? price.yearly : price.monthly;
  if (input.amount + 1e-9 < due) return { ok: false, reason: `paid ${input.amount}, plan costs ${due}` };
  const update: Pick<PlusAccount, "plusPaidMonths" | "plusPriceLock"> = withPaidPlan(account, input.month, input.plan);
  if (!account.plusPriceLock && foundingOpen(input.now, input.foundingUntil)) {
    update.plusPriceLock = { monthly: input.list.monthly, yearly: input.list.yearly, currency: input.list.currency, lockedAt: input.now.toISOString() };
  }
  return { ok: true, update };
}

/**
 * The words a customer shares with friends. Nothing private: no values, no
 * policy numbers, no claims; just that they are covered and a way to join.
 */
export function shareMessage(input: { firstName: string; items: number; agency: string; link: string; lang: "en" | "sw" }): string {
  const what = input.items === 1 ? (input.lang === "sw" ? "kitu 1" : "1 thing") : input.lang === "sw" ? `vitu ${input.items}` : `${input.items} things`;
  return input.lang === "sw"
    ? `Nimewekea bima ${what} kupitia ${input.agency}, na naona kila kitu kwenye simu yangu: thamani, tarehe ya mwisho na madai. Jiunge hapa: ${input.link}`
    : `I have ${what} insured through ${input.agency}, and I can see it all on my phone: values, renewal dates and claims. Get covered here: ${input.link}`;
}

/** The ledger reference of a Plus payment: which customer, from which month, which plan. */
export function plusPaymentReference(customerId: string, month: string, plan: PlusPlan = "MONTH"): string {
  return `PLUS:${customerId}:${month}${plan === "YEAR" ? ":Y" : ""}`;
}

export function parsePlusReference(reference: string | undefined): { customerId: string; month: string; plan: PlusPlan } | null {
  const match = /^PLUS:([A-Za-z0-9_-]{1,80}):(\d{4}-\d{2})(:Y)?$/.exec(reference ?? "");
  return match ? { customerId: match[1]!, month: match[2]!, plan: match[3] ? "YEAR" : "MONTH" } : null;
}
