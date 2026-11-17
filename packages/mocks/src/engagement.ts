import type { EngagementItem, NewsletterIssue, SubscriberDashboardPrefs } from "@insuros/domain";

/**
 * Sample customer content. It states only what is true today
 * (docs/VALUE_STRATEGY.md): no payout speed, no automatic approval, no USSD
 * code, no invented customers or figures.
 */
export const mockEngagementItems: EngagementItem[] = [
  {
    id: "eng-weather-1",
    kind: "WeatherAlert",
    title: "Heavy rain is forecast: a short checklist",
    body: "When heavy rain is forecast, park away from trees and flood-prone lanes, and photograph your car and property today so their condition before the storm is on record. Keep your policy number and your agent's number where you can find them.",
    countryCode: "KE",
    cta: "How evidence is graded",
    ctaHref: "/why#claims-evidence",
    shareable: true,
    shareText: "Heavy rain is forecast. Photograph your car and property today so their condition before the storm is on record, and keep your policy number to hand.",
    publishedAt: "2026-07-14T06:00:00Z",
    status: "Published"
  },
  {
    id: "eng-tip-1",
    kind: "SafetyTip",
    title: "Three photos that help a motor claim",
    body: "Front of the vehicle, the point of impact, and the other party's number plate, taken at the scene. Clear photos taken at the time mean fewer questions from the claims officer and fewer disputes later.",
    insuranceLine: "Motor",
    cta: "How evidence is graded",
    ctaHref: "/why#claims-evidence",
    shareable: true,
    shareText: "After a road accident, take three photos at the scene: the front of your vehicle, the point of impact and the other party's number plate. Clear evidence means fewer disputes on a claim.",
    publishedAt: "2026-07-12T06:00:00Z",
    status: "Published"
  },
  {
    id: "eng-milestone-1",
    kind: "Milestone",
    title: "120 days of continuous cover",
    body: "You have kept your cover in force for 120 days. Continuous cover means there is no gap for a loss to fall into. Check that your details and documents are still current.",
    countryCode: "KE",
    shareable: false,
    publishedAt: "2026-07-10T06:00:00Z",
    status: "Published"
  },
  {
    id: "eng-referral-1",
    kind: "ReferralPrompt",
    title: "Know someone without cover?",
    body: "Most households have no insurance at all. If someone you know is asking where to start, pass on your agent's contact and the short explanation of how claims are handled.",
    cta: "Why teams use it",
    ctaHref: "/why",
    shareable: true,
    shareText: "If you are asking where to start with insurance, ask an agent three things: what the cover excludes, who owns your claim, and how you will be told the decision.",
    publishedAt: "2026-07-08T06:00:00Z",
    status: "Published"
  },
  {
    id: "eng-health-1",
    kind: "PolicyHealth",
    title: "Is your cover in order?",
    body: "Three things to check: premiums are up to date, your documents are on file, and no policy has lapsed. If any is not, your agent can tell you what to do next.",
    shareable: false,
    publishedAt: "2026-07-06T06:00:00Z",
    status: "Published"
  }
];

export const mockNewsletterIssues: NewsletterIssue[] = [
  {
    id: "nl-3",
    threadId: "cover-letter",
    threadName: "The Cover Letter",
    issueNumber: 3,
    subject: "What happens to a claim after you report it",
    preview: "The steps a claim goes through, who owns each one, and what you can ask at any point.",
    body: "A claim moves through written steps: first notice, document check, review, decision and closure. Each step has a named owner. A person makes the decision, and a rejection comes with reasons in writing. At any point you can ask which step your claim is at and who holds it.",
    publishedAt: "2026-07-01T06:00:00Z"
  },
  {
    id: "nl-2",
    threadId: "cover-letter",
    threadName: "The Cover Letter",
    issueNumber: 2,
    subject: "How a premium is worked out",
    preview: "The parts of a price: the risk, the loadings and the floor.",
    body: "A premium starts from the expected cost of the risk, adds the cost of running the cover, and is checked against a floor it may never go below. A price below that floor looks cheap today and is paid for later, when claims are squeezed. Ask to see each line of your quote.",
    publishedAt: "2026-06-01T06:00:00Z"
  },
  {
    id: "nl-1",
    threadId: "cover-letter",
    threadName: "The Cover Letter",
    issueNumber: 1,
    subject: "Insurance that shows its working",
    preview: "Issue 1: what to expect from us, and what to ask of any insurer.",
    body: "Premiums are certain; too often the claim is not. This letter explains, one piece at a time, how cover works: what a policy excludes, how a price is built, how a claim is handled and how to complain if something goes wrong.",
    publishedAt: "2026-05-01T06:00:00Z"
  }
];

export const mockSubscriberPrefs: SubscriberDashboardPrefs[] = [
  {
    subscriptionId: "sub-1",
    enabledWidgets: ["PolicyStates", "RenewalCountdown", "ClaimsTracker", "WeatherAlerts", "Newsletter", "ReferralCard"],
    locale: "en"
  },
  {
    subscriptionId: "sub-2",
    enabledWidgets: ["PolicyStates", "RenewalCountdown", "SpendVsCover", "Newsletter"],
    locale: "en"
  }
];
