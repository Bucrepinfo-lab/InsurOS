import type { EngagementItem, NewsletterIssue, SubscriberDashboardPrefs } from "@insuros/domain";

export const mockEngagementItems: EngagementItem[] = [
  {
    id: "eng-weather-1",
    kind: "WeatherAlert",
    title: "Heavy rains expected in Nairobi this week",
    body: "The Met Department forecasts heavy rainfall from Thursday. Park away from trees and flood-prone lanes, photograph your car today (30 seconds, in-app) so your pre-storm condition is on record, and keep our USSD line handy. If the worst happens, your claim starts the moment you tap.",
    countryCode: "KE",
    cta: "Record pre-storm photos",
    ctaHref: "/dashboard/claims/evidence",
    shareable: true,
    shareText: "Heavy rains coming to Nairobi this week — my insurance app just warned me and let me photo-record my car in 30 seconds so any claim is instant. First month free if you want in: dial *334# and use my code.",
    publishedAt: "2026-07-14T06:00:00Z",
    status: "Published"
  },
  {
    id: "eng-tip-1",
    kind: "SafetyTip",
    title: "The 3 photos that make any motor claim instant",
    body: "Front, impact point, and the other party's plate — taken live in the app at the scene. Our engine treats sealed scene photos as strong evidence, which means no adjuster visit and payout in hours. Practice once in demo mode so it is muscle memory when it matters.",
    insuranceLine: "Motor",
    cta: "Try demo mode",
    shareable: true,
    shareText: "Learnt this from my insurance app: 3 live photos at the scene = claim paid in hours, no assessor drama. This is how insurance should work. First month free: *334#.",
    publishedAt: "2026-07-12T06:00:00Z",
    status: "Published"
  },
  {
    id: "eng-milestone-1",
    kind: "Milestone",
    title: "120 days protected 🎉",
    body: "You have been continuously covered for 120 days — and your claims fast-lane status is unlocked: your clean record now qualifies you for instant approvals on claims up to KES 50,000. That is loyalty, rewarded with speed.",
    countryCode: "KE",
    shareable: true,
    shareText: "My insurer just unlocked instant claim approvals for me because I kept my cover 120 days straight. 10 bob a month for the app, first month free: *334#.",
    publishedAt: "2026-07-10T06:00:00Z",
    status: "Published"
  },
  {
    id: "eng-referral-1",
    kind: "ReferralPrompt",
    title: "Give a month, get a month",
    body: "Share your code. Your friend gets their first month free (as everyone does) — and when they stay past day 40, you BOTH get a free month. Protection is better in numbers, and so is saving.",
    cta: "Share my code",
    shareable: true,
    shareText: "I use InsurOS — insurance for 10 bob a month that pays claims in hours and warns me before storms. Use my code and we both get a free month. Dial *334#.",
    publishedAt: "2026-07-08T06:00:00Z",
    status: "Published"
  },
  {
    id: "eng-health-1",
    kind: "PolicyHealth",
    title: "Your protection score, explained",
    body: "One number that tells you if your family is actually covered: premiums current, documents verified, no lapsed policies. Green means sleep well. Anything else comes with the exact one tap that fixes it.",
    cta: "Check my score",
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
    subject: "Why we publish our claim-approval rules (competitors won't)",
    preview: "This month: our adjudication rules are public, what the 40-day cycle means for you, and a boda rider's 3-hour claim story.",
    body: "Most insurers keep their claim rules in a drawer. Ours are printed in the app: claims under KES 50,000 with clean documents and sealed scene photos are approved automatically, with the reason shown. This issue we walk through exactly how Samuel's windscreen claim went from photo to payout in under 3 hours — and what the day-35 reminder really does (it protects your fast-lane status, not our revenue).",
    publishedAt: "2026-07-01T06:00:00Z"
  },
  {
    id: "nl-2",
    threadId: "cover-letter",
    threadName: "The Cover Letter",
    issueNumber: 2,
    subject: "10 bob a month. Here is exactly where it goes.",
    preview: "Radical transparency: the unit economics of your subscription, published.",
    body: "Your 10 shillings keeps the rails on: USSD sessions, weather data, document AI, and the servers that approve claims at 2am. We publish this because trust is engineered, not declared. Also inside: drought-index payouts hit 214 farmers this quarter — none of them filed a claim form.",
    publishedAt: "2026-06-01T06:00:00Z"
  },
  {
    id: "nl-1",
    threadId: "cover-letter",
    threadName: "The Cover Letter",
    issueNumber: 1,
    subject: "Welcome to insurance that shows its working",
    preview: "Issue #1: who we are, why claims here take hours not weeks, and your first-month-free promise in writing.",
    body: "InsurOS exists because insurance broke its promise: premiums were certain, payouts were not. We rebuilt the machine — live scene photos, automatic approvals with reasons attached, cover from 20 bob a day, and an app subscription at 10 bob a month with the first month free, renewable on day 40 with fair warnings on days 35 and 39. Every issue of this letter shows one piece of our working.",
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
