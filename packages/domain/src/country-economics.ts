/**
 * Prices, commission and referral tokens, PER COUNTRY — PURE.
 *
 * Owner decision 18/11/26: nothing here is global. Every country has its own
 * regulator, commission caps, currency and referral rules, so each gets its
 * own profile, and nothing can be sold in a country until its profile is
 * verified against the law AND approved by a named person.
 *
 * Plan and sources: docs/PRICING_COMMISSION_REFERRAL.md.
 *
 * This module only calculates and checks. It moves no money: commission is
 * paid by the insurer, and paying agents or referrers is done by finance.
 */

/** "verified" = checked against the law as published; "indicative" = secondary source; "not-set" = nothing known. */
export type ProfileStatus = "verified" | "indicative" | "not-set";

export type LineGroup = "general" | "life";

/** The kinds of cover insurance usually provides. Each country maps them to its own classes and caps. */
export const POLICY_LINES = [
  { id: "motor-private", name: "Private car", group: "general" },
  { id: "motor-commercial", name: "Commercial vehicle, matatu, boda boda", group: "general" },
  { id: "medical", name: "Medical (individual, family, group)", group: "general" },
  { id: "home", name: "Home and contents", group: "general" },
  { id: "business-property", name: "Business property (fire and perils)", group: "general" },
  { id: "theft", name: "Burglary and theft", group: "general" },
  { id: "work-injury", name: "Work injury (workers' compensation)", group: "general" },
  { id: "personal-accident", name: "Personal accident", group: "general" },
  { id: "liability", name: "Public, professional and product liability", group: "general" },
  { id: "engineering", name: "Contractors all risks, machinery", group: "general" },
  { id: "marine-cargo", name: "Goods in transit, marine cargo", group: "general" },
  { id: "marine-hull", name: "Boats and vessels", group: "general" },
  { id: "aviation", name: "Aircraft", group: "general" },
  { id: "travel", name: "Travel", group: "general" },
  { id: "crop-livestock", name: "Crop and livestock", group: "general" },
  { id: "bonds", name: "Bonds and guarantees", group: "general" },
  { id: "term-life", name: "Term life", group: "life" },
  { id: "savings-life", name: "Education, endowment, whole life", group: "life" },
  { id: "group-life", name: "Group life, funeral (last expense), credit life", group: "life" },
  { id: "pension", name: "Pension, deferred annuity", group: "life" },
  { id: "annuity", name: "Immediate annuity, single premium", group: "life" }
] as const satisfies readonly { id: string; name: string; group: LineGroup }[];

export type PolicyLineId = (typeof POLICY_LINES)[number]["id"];

/** A legal maximum, as a percentage of premium. */
export interface CommissionCap {
  /** The regulator's class name. */
  className: string;
  /** Max % of the first year's (or a one-year policy's) premium. */
  firstYear: number;
  /** Max % of a renewal premium. Same as firstYear for one-year general covers. */
  renewal: number;
  note?: string;
}

/** Shares of the commission received from the insurer, in % of that commission. */
export interface CommissionSplit {
  agentNew: number;
  agentRenewal: number;
  goldAgentNew: number;
  goldAgentRenewal: number;
  /** Override to the selling agent's team leader. */
  teamLeader: number;
}

export interface ReferralToken {
  /** Fixed amount per verified sign-up, in the country's currency. Never a share of commission or premium. */
  amount: number;
  /** Most tokens one person can earn in a calendar month. */
  monthlyLimit: number;
}

export interface CountryProfile {
  countryCode: string;
  country: string;
  currency: string;
  regulator: string;
  status: ProfileStatus;
  /** Caps by line. A line with no cap is not sold in this country. */
  caps: Partial<Record<PolicyLineId, CommissionCap>>;
  split: CommissionSplit;
  /** Premium per quarter, in local currency, that makes an agent Gold for the next quarter. Unset = no Gold tier yet. */
  goldThresholdPerQuarter?: number;
  /** Unset = no public referral token in this country. */
  referralToken?: ReferralToken;
  /** Added on top of the premium and passed to the authorities. */
  levies: { percent: number; fixed: number; label: string };
  /** No cover until the insurer has the premium. */
  cashBeforeCover: boolean;
  /** Legal limit for paying a claim, in days, when the law sets one. */
  claimPaymentDays?: number;
  /** Where the figures come from. */
  sources: string[];
  /** A person's name and the date they approved selling in this country. */
  approvedBy?: string;
  approvedAt?: string;
}

/** The split the owner chose for every country (docs §4). A country may raise the agency share only to cover its costs. */
export const STANDARD_SPLIT: CommissionSplit = {
  agentNew: 70,
  agentRenewal: 60,
  goldAgentNew: 75,
  goldAgentRenewal: 65,
  teamLeader: 10
};

/** The agent's share on new business never falls below this, in any country. */
export const MIN_AGENT_NEW_SHARE = 60;

const general = (className: string, pct: number): CommissionCap => ({ className, firstYear: pct, renewal: pct });

/**
 * Kenya: caps from the Insurance Regulations, regulation 22 and the Eleventh
 * Schedule (IRA, updated 2023); rebates s.73, licensing s.150, cash before
 * cover s.156, claims s.203 of the Insurance Act. Verified 18/11/26.
 * Referral token and Gold threshold await the owner's approval.
 */
export const KENYA: CountryProfile = {
  countryCode: "KE",
  country: "Kenya",
  currency: "KES",
  regulator: "Insurance Regulatory Authority",
  status: "verified",
  caps: {
    "motor-private": general("Motor-Private", 10),
    "motor-commercial": general("Motor-Commercial", 10),
    medical: general("Medical Insurance", 10),
    home: general("Fire-Domestic", 20),
    "business-property": general("Fire-Industrial", 25),
    theft: general("Theft", 10),
    "work-injury": general("Workmen's Compensation", 20),
    "personal-accident": general("Personal Accident", 20),
    liability: general("Liability", 20),
    engineering: general("Engineering Insurance", 20),
    "marine-cargo": general("Marine-Cargo and other transit", 17.5),
    "marine-hull": general("Marine Hull", 10),
    aviation: general("Aviation", 10),
    travel: general("Miscellaneous", 10),
    "crop-livestock": { ...general("Miscellaneous", 10), note: "Micro-insurance (10%) where the insurer files it so." },
    bonds: general("Miscellaneous", 10),
    "term-life": { className: "Ordinary life: term", firstYear: 10, renewal: 10, note: "Up to 10 years." },
    "savings-life": { className: "Ordinary life: other", firstYear: 50, renewal: 5, note: "20% in year 2; 5% in years 3 to 10." },
    "group-life": { className: "Superannuation: term assurance", firstYear: 8, renewal: 8 },
    pension: { className: "Superannuation: deferred annuity", firstYear: 4, renewal: 2 },
    annuity: { className: "Immediate annuity / single premium", firstYear: 2, renewal: 0 }
  },
  split: STANDARD_SPLIT,
  referralToken: { amount: 100, monthlyLimit: 20 },
  levies: { percent: 0.45, fixed: 40, label: "Training levy and Policyholders' Compensation Fund (0.45%) plus stamp duty" },
  cashBeforeCover: true,
  claimPaymentDays: 90,
  sources: [
    "https://www.ira.go.ke/assets/file/insurance-regulations-updated-2023.pdf",
    "https://ira.go.ke/assets/file/insurance-act-updated-2023.pdf"
  ]
};

/**
 * South Africa: short-term regulation 5.3 shows motor 12.5% and other
 * short-term covers 20% (accident and health 5 to 20% by premium band). Its
 * current status under the 2017 rules is not confirmed: indicative only.
 */
export const SOUTH_AFRICA: CountryProfile = {
  countryCode: "ZA",
  country: "South Africa",
  currency: "ZAR",
  regulator: "Financial Sector Conduct Authority / Prudential Authority",
  status: "indicative",
  caps: {
    "motor-private": general("Motor", 12.5),
    "motor-commercial": general("Motor", 12.5),
    home: general("Other short-term", 20),
    "business-property": general("Other short-term", 20),
    theft: general("Other short-term", 20),
    liability: general("Other short-term", 20),
    engineering: general("Other short-term", 20),
    "marine-cargo": general("Other short-term", 20),
    travel: general("Other short-term", 20)
  },
  split: STANDARD_SPLIT,
  levies: { percent: 0, fixed: 0, label: "Not researched" },
  cashBeforeCover: false,
  sources: ["https://www.acts.co.za/short-term-insurance-act-1998/r1493_5_3_maximum_commission_payable.php"]
};

/** Countries with nothing confirmed yet. Listed so the owner sees them; nothing can be sold there. */
const unset = (countryCode: string, country: string, currency: string, regulator: string): CountryProfile => ({
  countryCode,
  country,
  currency,
  regulator,
  status: "not-set",
  caps: {},
  split: STANDARD_SPLIT,
  levies: { percent: 0, fixed: 0, label: "Not researched" },
  cashBeforeCover: false,
  sources: []
});

export const COUNTRY_PROFILES: CountryProfile[] = [
  KENYA,
  SOUTH_AFRICA,
  unset("UG", "Uganda", "UGX", "Insurance Regulatory Authority of Uganda"),
  unset("TZ", "Tanzania", "TZS", "Tanzania Insurance Regulatory Authority"),
  unset("NG", "Nigeria", "NGN", "National Insurance Commission"),
  unset("GH", "Ghana", "GHS", "National Insurance Commission"),
  unset("IN", "India", "INR", "Insurance Regulatory and Development Authority of India"),
  unset("GB", "United Kingdom", "GBP", "Financial Conduct Authority"),
  unset("US", "United States", "USD", "State insurance departments")
];

export function profileFor(countryCode: string): CountryProfile | undefined {
  return COUNTRY_PROFILES.find((profile) => profile.countryCode === countryCode.toUpperCase());
}

export type SellCheck = { ok: true } | { ok: false; reason: string };

/** Selling is allowed only in a verified, approved country, for a line that has a cap there. */
export function canSell(profile: CountryProfile, line?: PolicyLineId): SellCheck {
  if (profile.status !== "verified") {
    return { ok: false, reason: `${profile.country}: the commission caps have not been checked against the law yet.` };
  }
  if (!profile.approvedBy || !profile.approvedAt) {
    return { ok: false, reason: `${profile.country}: the profile is waiting for the owner's approval.` };
  }
  if (line && !profile.caps[line]) {
    return { ok: false, reason: `${profile.country}: this kind of policy has no commission rule on file.` };
  }
  return { ok: true };
}

/** A split is sound when the shares fit inside 100% and the agent keeps at least the minimum. */
export function checkSplit(split: CommissionSplit): SellCheck {
  const worst = Math.max(split.agentNew, split.agentRenewal, split.goldAgentNew, split.goldAgentRenewal) + split.teamLeader;
  if (worst > 100) return { ok: false, reason: "Agent and team leader shares add up to more than the whole commission." };
  if (split.agentNew < MIN_AGENT_NEW_SHARE) return { ok: false, reason: `The agent must keep at least ${MIN_AGENT_NEW_SHARE}% on new business.` };
  if (split.agentRenewal > split.agentNew || split.goldAgentNew < split.agentNew || split.goldAgentRenewal < split.agentRenewal) {
    return { ok: false, reason: "Gold shares must be at least the standard ones, and renewals no more than new business." };
  }
  return { ok: true };
}

const money = (value: number) => Math.round(value * 100) / 100;

export interface CommissionBreakdown {
  capPercent: number;
  commission: number;
  agent: number;
  teamLeader: number;
  agency: number;
  agentShare: number;
  agencyShare: number;
}

/**
 * How one policy's commission divides, at the legal cap. The insurer may pay
 * less than the cap; pass `insurerRate` to use the rate in the agency agreement.
 * Refuses a rate above the cap.
 */
export function splitCommission(
  profile: CountryProfile,
  line: PolicyLineId,
  premium: number,
  options: { renewal?: boolean; gold?: boolean; insurerRate?: number } = {}
): CommissionBreakdown | null {
  const cap = profile.caps[line];
  if (!cap || !(premium > 0)) return null;
  const capPercent = options.renewal ? cap.renewal : cap.firstYear;
  const rate = options.insurerRate ?? capPercent;
  if (rate < 0 || rate > capPercent) return null;
  const s = profile.split;
  const agentShare = options.gold
    ? options.renewal ? s.goldAgentRenewal : s.goldAgentNew
    : options.renewal ? s.agentRenewal : s.agentNew;
  const agencyShare = 100 - agentShare - s.teamLeader;
  const commission = money((premium * rate) / 100);
  const agent = money((commission * agentShare) / 100);
  const teamLeader = money((commission * s.teamLeader) / 100);
  return { capPercent, commission, agent, teamLeader, agency: money(commission - agent - teamLeader), agentShare, agencyShare };
}

export interface BreakEvenInput {
  /** Expected claims cost per policy, in local currency. */
  expectedClaims: number;
  /** % of premium. */
  commissionRate: number;
  /** Insurer's other running costs, % of premium. */
  runningCostRate: number;
  /** Safety margin against a bad year, % of premium. */
  margin: number;
}

/**
 * The lowest premium that pays the expected claims, the commission, the
 * running costs and the safety margin. Levies are added on top, separately.
 * Returns null when the rates leave nothing to pay claims with.
 */
export function breakEvenPremium(input: BreakEvenInput): number | null {
  const loads = input.commissionRate + input.runningCostRate + input.margin;
  if (!(input.expectedClaims > 0) || loads < 0 || loads >= 90) return null;
  return Math.round(input.expectedClaims / (1 - loads / 100));
}

/** The premium plus the country's levies: what the customer pays. */
export function withLevies(profile: CountryProfile, premium: number): { levies: number; total: number } {
  const levies = money((premium * profile.levies.percent) / 100 + profile.levies.fixed);
  return { levies, total: money(premium + levies) };
}

/* ------------------------------------------------------------------ referral */

const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // no 0/O, 1/I/L

/** A short, stable referral code for a person: country + six characters from their id. */
export function referralCodeFor(countryCode: string, personId: string): string {
  let hash = 2166136261;
  for (const char of personId) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += CODE_ALPHABET.charAt(hash % CODE_ALPHABET.length);
    hash = Math.floor(hash / CODE_ALPHABET.length) ^ Math.imul(hash, 31);
    hash >>>= 0;
  }
  return `${countryCode.toUpperCase().slice(0, 2)}-${code}`;
}

/** Tidy a typed referral code, or null when it cannot be one. */
export function cleanReferralCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const code = raw.trim().toUpperCase().replace(/\s+/g, "");
  return /^[A-Z]{2}-[2-9A-HJKMNP-Z]{6}$/.test(code) ? code : null;
}

export interface ReferralRecord {
  /** The person referred. */
  personId: string;
  /** Their phone, for the duplicate check. Compared only, never shown. */
  phone?: string;
  referredBy: string;
  /** A sign-up counts once the person is verified (phone confirmed, profile complete). */
  verifiedAt?: string;
}

export interface TokenStatement {
  verified: number;
  counted: number;
  overLimit: number;
  amount: number;
  currency: string;
}

/**
 * Tokens one referrer has earned in a month: one per verified sign-up, up
 * to the country's monthly limit. Self-referral and repeat phone numbers
 * earn nothing. The token never depends on a policy being bought.
 */
export function tokensFor(
  profile: CountryProfile,
  referrerCode: string,
  referrerId: string,
  records: readonly ReferralRecord[],
  month: string
): TokenStatement {
  const token = profile.referralToken;
  const seen = new Set<string>();
  let verified = 0;
  for (const record of records) {
    if (record.referredBy !== referrerCode || record.personId === referrerId) continue;
    if (!record.verifiedAt || !record.verifiedAt.startsWith(month)) continue;
    const key = record.phone ? `p:${record.phone}` : `i:${record.personId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    verified += 1;
  }
  const limit = token?.monthlyLimit ?? 0;
  const counted = Math.min(verified, limit);
  return {
    verified,
    counted,
    overLimit: verified - counted,
    amount: token ? counted * token.amount : 0,
    currency: profile.currency
  };
}
