import type { EntityId, IsoDateTime } from "./base";
import type { InsuranceLine } from "./tax";

export type PremiumFrequency = "Daily" | "Weekly" | "Monthly";

export type ActivationChannel = "USSD" | "MobileApp" | "Agent" | "Embedded";

export interface ParametricTrigger {
  /** Measurable index, e.g. "Rainfall below 40mm in 30 days (county gauge)". */
  index: string;
  /** Automatic payout as percent of cover amount when triggered. */
  payoutPercent: number;
  dataSource: string;
}

export interface MicroProduct {
  id: EntityId;
  name: string;
  insuranceLine: InsuranceLine;
  countryCode: string;
  targetSegment: string;
  coverAmount: number;
  premiumAmount: number;
  premiumFrequency: PremiumFrequency;
  currency: string;
  activationChannels: ActivationChannel[];
  /** Present on index-based products: claims pay automatically, no FNOL. */
  parametricTrigger?: ParametricTrigger;
  status: "Active" | "Draft" | "Retired";
}

export interface MobileMoneyProvider {
  id: EntityId;
  name: string;
  countryCode: string;
  ussdCode?: string;
  apiStatus: "Live" | "Sandbox" | "Planned";
}

export type MicroPolicyStatus = "Active" | "Grace" | "Lapsed" | "Cancelled";

export interface MicroPolicy {
  id: EntityId;
  productId: EntityId;
  holderName: string;
  /** Mobile number in E.164 — identity and payment instrument in one. */
  msisdn: string;
  channel: ActivationChannel;
  providerId: EntityId;
  enrolledAt: IsoDateTime;
  lastPaymentAt?: IsoDateTime;
  status: MicroPolicyStatus;
}

export interface MicroPayment {
  id: EntityId;
  policyId: EntityId;
  amount: number;
  currency: string;
  providerId: EntityId;
  providerReference: string;
  paidAt: IsoDateTime;
}

/**
 * Grace/lapse policy: a micro policy stays Active within one frequency
 * period of the last payment, then enters Grace for one further period,
 * then Lapses. Forgiving by design — the segment has irregular income.
 */
export function resolvePolicyStatus(
  frequency: PremiumFrequency,
  lastPaymentAt: IsoDateTime | undefined,
  now: IsoDateTime
): MicroPolicyStatus {
  if (!lastPaymentAt) {
    return "Grace";
  }

  const periodMs =
    frequency === "Daily"
      ? 86_400_000
      : frequency === "Weekly"
        ? 7 * 86_400_000
        : 30 * 86_400_000;

  const elapsed = new Date(now).getTime() - new Date(lastPaymentAt).getTime();

  if (elapsed <= periodMs) {
    return "Active";
  }

  if (elapsed <= 2 * periodMs) {
    return "Grace";
  }

  return "Lapsed";
}
