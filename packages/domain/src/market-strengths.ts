/**
 * What users of good insurance software say they gain from it (from public
 * reviews and vendors' own pages, see docs/VALUE_STRATEGY.md §8), and where
 * InsurOS stands on each today. Solving a pain is half the story; these are
 * the gains a team expects from any system worth moving to.
 *
 * `status` is checked against the product, not against ambition:
 * "here" = works today, "partly" = some of it works, "not-yet" = not built.
 * Only "here" and "partly" are shown in public.
 */
export type StrengthStatus = "here" | "partly" | "not-yet";

export interface MarketStrength {
  id: string;
  /** The strength, as a user would name it. */
  strength: string;
  /** What a team gains from it. */
  gain: string;
  status: StrengthStatus;
  /** What InsurOS does about it today (or what is missing). */
  today: string;
  /** Where to see it, for "here" and "partly". */
  href?: string;
}

export const MARKET_STRENGTHS: MarketStrength[] = [
  {
    id: "easy",
    strength: "Easy to learn and use",
    gain: "New staff are useful in days, and nobody needs a manual to find a customer.",
    status: "here",
    today: "Sections are grouped, one search box jumps to any of them, and every section opens by saying what it is for.",
    href: "/dashboard"
  },
  {
    id: "one-file",
    strength: "One file per customer and per claim",
    gain: "No re-keying and no hunting through folders: the policy, the claim and the documents sit together.",
    status: "here",
    today: "A customer's policies and claims open from the customer record, and a claim's documents and evidence from the claim.",
    href: "/dashboard/customers"
  },
  {
    id: "role-views",
    strength: "A view for each role",
    gain: "Each person sees their own work first, and private records stay private.",
    status: "here",
    today: "An agent sees their own customers and policies, a claims officer their own claims, a manager the whole book. The check is made on the server.",
    href: "/dashboard/governance"
  },
  {
    id: "documents",
    strength: "Details read from a document for a person to accept or correct",
    gain: "Less typing and fewer mistakes, with a person still responsible for what is saved.",
    status: "here",
    today: "A photo of an invoice, receipt, abstract or log book is read on your own phone; you check each value before saving. The photo is not stored.",
    href: "/dashboard/operations/documents"
  },
  {
    id: "phone",
    strength: "Works on a phone",
    gain: "Agents capture a customer or a claim where it happens, not back at the office.",
    status: "here",
    today: "The whole workspace runs in a phone browser and signs in with the person's own number.",
    href: "/dashboard"
  },
  {
    id: "commissions",
    strength: "Commissions worked out and shown",
    gain: "Agents trust what they are paid, and month-end stops being an argument.",
    status: "here",
    today: "A statement per agent and period shows direct earnings, team earnings and clawbacks with the reason.",
    href: "/dashboard/sales/commissions"
  },
  {
    id: "reports",
    strength: "Reports without a specialist",
    gain: "Management and the regulator get figures on time, from the same records the team works on.",
    status: "here",
    today: "Every list can be searched, filtered and exported, and the loss, expense and combined ratios sit on one page.",
    href: "/dashboard/finance/analytics"
  },
  {
    id: "insight",
    strength: "Knowing what your own team uses and looks for",
    gain: "Training and improvements go where people struggle, not where someone guesses.",
    status: "here",
    today: "Counts of the sections opened, searches made and searches that found nothing. No person is recorded.",
    href: "/dashboard/operations/insight"
  },
  {
    id: "less-chasing",
    strength: "Less chasing: work is assigned and followed up",
    gain: "Nothing waits in a shared pile, and late work is seen early.",
    status: "partly",
    today: "Each step has an owner and a time to respond, and a step nobody answers goes to the supervisor. Reminders by SMS or email are not built yet.",
    href: "/dashboard/follow-ups"
  },
  {
    id: "renewals",
    strength: "Renewals that do not slip",
    gain: "Income is kept, and the customer is not left uncovered by accident.",
    status: "partly",
    today: "Policies can be filtered by status and exported for a renewal run. Renewal dates and reminders are not built yet.",
    href: "/dashboard/policies"
  },
  {
    id: "self-service",
    strength: "Customers serve themselves at any hour",
    gain: "Fewer calls to the office, and a customer who can see their own claim.",
    status: "not-yet",
    today: "There is no customer sign-in. Staff answer for the customer from the claim's status and owner."
  },
  {
    id: "multi-quote",
    strength: "Quotes from several insurers side by side",
    gain: "The customer sees a real choice, and the agent wins the sale on advice.",
    status: "not-yet",
    today: "Pricing shows how one price is built. Comparing live quotes from several insurers needs links to those insurers."
  },
  {
    id: "e-sign",
    strength: "Signing on screen",
    gain: "A proposal or discharge is signed in minutes without printing.",
    status: "not-yet",
    today: "Terms acceptance is recorded per version. Signing documents on screen is not built."
  },
  {
    id: "collect",
    strength: "Premiums collected by mobile money",
    gain: "Fewer lapses, and no cash to carry or reconcile by hand.",
    status: "not-yet",
    today: "Payments are switched off in this release. Finance keeps the record; money moves outside InsurOS."
  }
];

/** Strengths that can be shown in public: only what works today, fully or in part. */
export function publicStrengths(): MarketStrength[] {
  return MARKET_STRENGTHS.filter((item) => item.status !== "not-yet");
}
