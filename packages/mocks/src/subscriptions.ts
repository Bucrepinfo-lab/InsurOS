import type { RenewalAlert, Subscription, SubscriptionPlan } from "@insuros/domain";

export const mockSubscriptionPlans: SubscriptionPlan[] = [
  { id: "plan-ke", countryCode: "KE", currency: "KES", monthlyPrice: 10, freeTrialDays: 30, renewalDueDay: 40, alertDays: [35, 39], status: "Active" },
  { id: "plan-ng", countryCode: "NG", currency: "NGN", monthlyPrice: 10, freeTrialDays: 30, renewalDueDay: 40, alertDays: [35, 39], status: "Active" },
  { id: "plan-gb", countryCode: "GB", currency: "GBP", monthlyPrice: 10, freeTrialDays: 30, renewalDueDay: 40, alertDays: [35, 39], status: "Active" },
  { id: "plan-us", countryCode: "US", currency: "USD", monthlyPrice: 10, freeTrialDays: 30, renewalDueDay: 40, alertDays: [35, 39], status: "Active" },
  { id: "plan-in", countryCode: "IN", currency: "INR", monthlyPrice: 10, freeTrialDays: 30, renewalDueDay: 40, alertDays: [35, 39], status: "Active" },
  { id: "plan-br", countryCode: "BR", currency: "BRL", monthlyPrice: 10, freeTrialDays: 30, renewalDueDay: 40, alertDays: [35, 39], status: "Active" },
  { id: "plan-au", countryCode: "AU", currency: "AUD", monthlyPrice: 10, freeTrialDays: 30, renewalDueDay: 40, alertDays: [35, 39], status: "Active" }
];

export const mockSubscriptions: Subscription[] = [
  {
    id: "sub-1",
    subscriberName: "Samuel Kimani",
    msisdn: "+254712000111",
    planId: "plan-ke",
    countryCode: "KE",
    referralCode: "SAM-K2026",
    startedAt: "2026-06-10T06:00:00Z",
    currentCycleStartedAt: "2026-06-10T06:00:00Z",
    renewalDueAt: "2026-07-20T06:00:00Z",
    status: "Trial"
  },
  {
    id: "sub-2",
    subscriberName: "Esther Chebet",
    msisdn: "+254722000222",
    planId: "plan-ke",
    countryCode: "KE",
    referralCode: "EST-C2026",
    startedAt: "2026-04-01T09:00:00Z",
    currentCycleStartedAt: "2026-06-20T09:00:00Z",
    renewalDueAt: "2026-07-30T09:00:00Z",
    lastRenewedAt: "2026-06-20T09:00:00Z",
    status: "Active"
  },
  {
    id: "sub-3",
    subscriberName: "David Omondi",
    msisdn: "+254733000333",
    planId: "plan-ke",
    countryCode: "KE",
    referralCode: "DAV-O2026",
    startedAt: "2026-05-01T08:00:00Z",
    currentCycleStartedAt: "2026-05-25T08:00:00Z",
    renewalDueAt: "2026-07-04T08:00:00Z",
    lastRenewedAt: "2026-05-25T08:00:00Z",
    status: "PastDue"
  }
];

export const mockRenewalAlerts: RenewalAlert[] = [
  { id: "alert-1", subscriptionId: "sub-1", kind: "Day35", scheduledFor: "2026-07-15T06:00:00Z", channel: "Push", status: "Sent" },
  { id: "alert-2", subscriptionId: "sub-1", kind: "Day39", scheduledFor: "2026-07-19T06:00:00Z", channel: "SMS", status: "Scheduled" },
  { id: "alert-3", subscriptionId: "sub-2", kind: "Day35", scheduledFor: "2026-07-25T09:00:00Z", channel: "Push", status: "Scheduled" },
  { id: "alert-4", subscriptionId: "sub-2", kind: "Day39", scheduledFor: "2026-07-29T09:00:00Z", channel: "SMS", status: "Scheduled" }
];
