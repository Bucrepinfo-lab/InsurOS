import type { EntityId, IsoDateTime } from "./base";

/**
 * App subscription: 10 units of the local currency per month, first month
 * free, renewal due on day 40 of each cycle, with nudges on days 35 and 39.
 */
export interface SubscriptionPlan {
  id: EntityId;
  countryCode: string;
  currency: string;
  monthlyPrice: number;
  freeTrialDays: number;
  /** Renewal falls due this many days after cycle start. */
  renewalDueDay: number;
  /** Days (from cycle start) on which reminder alerts fire. */
  alertDays: number[];
  status: "Active" | "Retired";
}

export type SubscriptionStatus = "Trial" | "Active" | "PastDue" | "Cancelled";

export interface Subscription {
  id: EntityId;
  subscriberName: string;
  msisdn: string;
  planId: EntityId;
  countryCode: string;
  referralCode: string;
  startedAt: IsoDateTime;
  currentCycleStartedAt: IsoDateTime;
  renewalDueAt: IsoDateTime;
  lastRenewedAt?: IsoDateTime;
  status: SubscriptionStatus;
}

export type RenewalAlertKind = "Day35" | "Day39";

export interface RenewalAlert {
  id: EntityId;
  subscriptionId: EntityId;
  kind: RenewalAlertKind;
  scheduledFor: IsoDateTime;
  channel: "Push" | "SMS" | "Email";
  status: "Scheduled" | "Sent";
}

const DAY_MS = 86_400_000;

export interface CycleSchedule {
  trialEndsAt: IsoDateTime;
  renewalDueAt: IsoDateTime;
  alerts: { kind: RenewalAlertKind; scheduledFor: IsoDateTime }[];
}

/** Day-35/day-39/day-40 schedule for a cycle starting at `cycleStart`. */
export function computeCycleSchedule(
  cycleStart: IsoDateTime,
  plan: SubscriptionPlan
): CycleSchedule {
  const start = new Date(cycleStart).getTime();

  return {
    trialEndsAt: new Date(start + plan.freeTrialDays * DAY_MS).toISOString(),
    renewalDueAt: new Date(start + plan.renewalDueDay * DAY_MS).toISOString(),
    alerts: plan.alertDays.map((day) => ({
      kind: (day >= 39 ? "Day39" : "Day35") as RenewalAlertKind,
      scheduledFor: new Date(start + day * DAY_MS).toISOString()
    }))
  };
}

/** Trial for the first cycle, Active once renewed, PastDue after day 40. */
export function resolveSubscriptionStatus(
  subscription: Subscription,
  now: IsoDateTime
): SubscriptionStatus {
  if (subscription.status === "Cancelled") {
    return "Cancelled";
  }

  if (new Date(now).getTime() > new Date(subscription.renewalDueAt).getTime()) {
    return "PastDue";
  }

  return subscription.lastRenewedAt ? "Active" : "Trial";
}
