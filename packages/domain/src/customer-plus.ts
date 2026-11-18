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
 * Months are calendar months on the country's clock. There is no automatic
 * renewal: each month is paid by the customer on their own phone, and a month
 * not paid is simply not charged.
 */
export const PLUS_TRIAL_DAYS = 30;
export const PLUS_UNITS_PER_MONTH = 10;

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
}

export interface PlusStatus {
  state: PlusState;
  unlocked: boolean;
  /** "2026-11" on the country's clock. */
  month: string;
  /** Last day of the free month, "2026-12-17", when in trial. */
  trialEndsOn: string | null;
  daysLeft: number | null;
  price: { amount: number; currency: string };
}

const DAY = 86_400_000;

/** "2026-11" on a country's clock. */
export function monthKey(now: Date, timeZone = "Africa/Nairobi"): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit" }).format(now).slice(0, 7);
}

export function plusStatus(account: PlusAccount, input: { now: Date; timeZone?: string; currency: string; paymentsOn: boolean }): PlusStatus {
  const month = monthKey(input.now, input.timeZone);
  const price = { amount: PLUS_UNITS_PER_MONTH, currency: input.currency };
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
  if (!/^\d{4}-\d{2}$/.test(month)) throw new Error("month must look like 2026-11");
  return { plusPaidMonths: [...new Set([...(account.plusPaidMonths ?? []), month])].sort() };
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
