import type {
  RenewalAlert,
  Subscription,
  SubscriptionPlan
} from "@insuros/domain";
import { computeCycleSchedule, resolveSubscriptionStatus } from "@insuros/domain";
import { getPersistence } from "./persistence";

export interface SubscribeInput {
  subscriberName: string;
  msisdn: string;
  countryCode: string;
}

export class SubscriptionService {
  private get db() {
    return getPersistence();
  }

  async getPlans(): Promise<SubscriptionPlan[]> {
    return this.db.subscriptionPlans.findAll();
  }

  async getSubscriptions(): Promise<Subscription[]> {
    return this.db.subscriptions.findAll();
  }

  async getAlerts(): Promise<RenewalAlert[]> {
    return this.db.renewalAlerts.findAll();
  }

  /**
   * Subscribe: first month free, renewal due day 40, alert nudges
   * scheduled for days 35 and 39 automatically.
   */
  async subscribe(input: SubscribeInput): Promise<Subscription> {
    const [plan] = await this.db.subscriptionPlans.findWhere(
      (item) => item.countryCode === input.countryCode && item.status === "Active"
    );

    if (!plan) {
      throw new Error(`No active plan for ${input.countryCode}`);
    }

    const now = new Date().toISOString();
    const schedule = computeCycleSchedule(now, plan);

    const subscription = await this.db.subscriptions.insert({
      id: `sub-${Date.now()}`,
      subscriberName: input.subscriberName,
      msisdn: input.msisdn,
      planId: plan.id,
      countryCode: input.countryCode,
      referralCode: `${input.subscriberName.slice(0, 3).toUpperCase()}-${Date.now() % 10000}`,
      startedAt: now,
      currentCycleStartedAt: now,
      renewalDueAt: schedule.renewalDueAt,
      status: "Trial"
    });

    for (const alert of schedule.alerts) {
      await this.db.renewalAlerts.insert({
        id: `alert-${subscription.id}-${alert.kind}`,
        subscriptionId: subscription.id,
        kind: alert.kind,
        scheduledFor: alert.scheduledFor,
        channel: alert.kind === "Day39" ? "SMS" : "Push",
        status: "Scheduled"
      });
    }

    return subscription;
  }

  /** Renew a cycle: new day-40 due date, fresh day-35/39 alerts. */
  async renew(subscriptionId: string): Promise<Subscription> {
    const subscription = await this.db.subscriptions.findById(subscriptionId);

    if (!subscription) {
      throw new Error(`Unknown subscription: ${subscriptionId}`);
    }

    const plan = await this.db.subscriptionPlans.findById(subscription.planId);

    if (!plan) {
      throw new Error(`Unknown plan: ${subscription.planId}`);
    }

    const now = new Date().toISOString();
    const schedule = computeCycleSchedule(now, plan);

    const renewed = await this.db.subscriptions.update(subscriptionId, {
      currentCycleStartedAt: now,
      renewalDueAt: schedule.renewalDueAt,
      lastRenewedAt: now,
      status: "Active"
    });

    for (const alert of schedule.alerts) {
      await this.db.renewalAlerts.insert({
        id: `alert-${subscriptionId}-${alert.kind}-${Date.now()}`,
        subscriptionId,
        kind: alert.kind,
        scheduledFor: alert.scheduledFor,
        channel: alert.kind === "Day39" ? "SMS" : "Push",
        status: "Scheduled"
      });
    }

    return renewed as Subscription;
  }

  /** Recompute Trial/Active/PastDue for all subscriptions (daily job). */
  async refreshStatuses(): Promise<Subscription[]> {
    const now = new Date().toISOString();
    const subscriptions = await this.db.subscriptions.findAll();
    const refreshed: Subscription[] = [];

    for (const subscription of subscriptions) {
      const status = resolveSubscriptionStatus(subscription, now);
      const updated = await this.db.subscriptions.update(subscription.id, {
        status
      });

      if (updated) {
        refreshed.push(updated);
      }
    }

    return refreshed;
  }
}
