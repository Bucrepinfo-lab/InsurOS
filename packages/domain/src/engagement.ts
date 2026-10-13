import type { EntityId, IsoDateTime } from "./base";
import type { InsuranceLine } from "./tax";

export type EngagementKind =
  | "SafetyTip"
  | "WeatherAlert"
  | "PolicyHealth"
  | "Milestone"
  | "ReferralPrompt"
  | "NewsletterIssue";

/**
 * Content that earns the app its place on a subscriber's phone between
 * claims — about their life and money, not our paperwork. Shareable items
 * carry a ready-to-forward blurb for word-of-mouth growth.
 */
export interface EngagementItem {
  id: EntityId;
  kind: EngagementKind;
  title: string;
  body: string;
  insuranceLine?: InsuranceLine;
  countryCode?: string;
  cta?: string;
  ctaHref?: string;
  shareable: boolean;
  /** WhatsApp/SMS-ready forward text, including the referral hook. */
  shareText?: string;
  publishedAt: IsoDateTime;
  status: "Published" | "Draft" | "Archived";
}

export interface NewsletterIssue {
  id: EntityId;
  threadId: string;
  threadName: string;
  issueNumber: number;
  subject: string;
  preview: string;
  body: string;
  publishedAt: IsoDateTime;
}

/** Widgets a subscriber can toggle on their own dashboard. */
export type SubscriberWidget =
  | "PolicyStates"
  | "RenewalCountdown"
  | "ClaimsTracker"
  | "SpendVsCover"
  | "WeatherAlerts"
  | "Newsletter"
  | "ReferralCard";

export interface SubscriberDashboardPrefs {
  subscriptionId: EntityId;
  enabledWidgets: SubscriberWidget[];
  locale: string;
}

/**
 * Policy health: one friendly score a subscriber understands at a glance.
 * Full marks = premiums current, documents verified, no lapsed covers.
 */
export function computePolicyHealth(
  activePolicies: number,
  lapsedPolicies: number,
  paymentsUpToDate: boolean,
  documentsVerified: boolean
): { score: number; label: string } {
  let score = 100;

  if (activePolicies === 0) score -= 40;
  score -= Math.min(30, lapsedPolicies * 15);
  if (!paymentsUpToDate) score -= 20;
  if (!documentsVerified) score -= 10;

  score = Math.max(0, score);

  const label =
    score >= 85
      ? "Excellent — fully protected"
      : score >= 60
        ? "Good — one thing needs attention"
        : score >= 35
          ? "At risk — cover gaps detected"
          : "Unprotected — act now";

  return { score, label };
}
