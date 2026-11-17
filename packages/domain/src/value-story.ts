/**
 * The value story (owner brief 17/11/26): every section of the workspace opens
 * with the pain the industry lives with and what this section does about it,
 * then points to the next section worth seeing — PURE.
 *
 * Rules for the copy (enforced by packages/domain/test/value-story.test.ts):
 *  - Sell the value, not the app: the pain is real and sourced
 *    (docs/VALUE_STRATEGY.md); the answer is only what this release delivers.
 *  - No promise the release cannot keep: claims are decided by people,
 *    InsurOS takes no payments in the app, and nothing is paid automatically.
 *  - Every "next" link is a real section, so the workspace reads as one flow.
 */

export type ValueAccent = "seal" | "gold" | "ocean" | "coral" | "violet" | "teal";
export type ValueMotif = "shield" | "clock" | "ledger" | "people" | "chart" | "seal";

export interface ValueLink {
  label: string;
  href: string;
}

export interface ValueStory {
  /** Stable id; also the anchor on the public /why page. */
  id: string;
  /** Route prefixes this story covers; the longest matching prefix wins. */
  paths: string[];
  accent: ValueAccent;
  motif: ValueMotif;
  /** Short label of the area, sentence case. */
  area: string;
  /** The problem, as the people living it describe it. */
  pain: string;
  /** What this section does about it, today. */
  answer: string;
  /** One concrete thing to do here now. */
  doNow: string;
  /** Where the flow continues (two real sections). */
  next: [ValueLink, ValueLink];
  /** Shown on the public /why page (false for internal admin areas). */
  publicStory: boolean;
}

export const VALUE_STORIES: ValueStory[] = [
  {
    id: "one-ledger",
    paths: ["/dashboard"],
    accent: "seal",
    motif: "ledger",
    area: "One workspace",
    pain: "Customers, policies, claims and money live in separate files, phones and inboxes, so nobody can answer a simple question without calling three people.",
    answer: "One workspace holds them together. Each person opens only the work their role covers, and every list can be searched, filtered and exported.",
    doNow: "Pick the area you work in below and follow the flow from customer to policy to claim.",
    next: [
      { label: "Start with customers", href: "/dashboard/customers" },
      { label: "See the claims desk", href: "/dashboard/claims" }
    ],
    publicStory: true
  },
  {
    id: "customers",
    paths: ["/dashboard/customers"],
    accent: "ocean",
    motif: "people",
    area: "Customers",
    pain: "An agent leaves and the client book leaves with them: names in a notebook, numbers in a personal phone, no record of who was promised what.",
    answer: "Every customer is a record the organisation keeps. An agent sees only the customers they captured; managers see the whole book.",
    doNow: "Search a customer, open the record, and see their policies and claims in one place.",
    next: [
      { label: "Their policies", href: "/dashboard/policies" },
      { label: "Who sold what", href: "/dashboard/sales" }
    ],
    publicStory: true
  },
  {
    id: "policies",
    paths: ["/dashboard/policies"],
    accent: "seal",
    motif: "shield",
    area: "Policies",
    pain: "Customers learn what their cover excludes on the day they claim. Until then nobody can say quickly which policy is in force and who owns it.",
    answer: "Policies sit next to the customer and the claims made on them, with status filters and one-click export for renewals and reviews.",
    doNow: "Filter by status to see what needs attention, then open a policy to check its claims.",
    next: [
      { label: "Claims on these policies", href: "/dashboard/claims" },
      { label: "Products on offer", href: "/dashboard/marketplace" }
    ],
    publicStory: true
  },
  {
    id: "claims",
    paths: ["/dashboard/claims"],
    accent: "coral",
    motif: "clock",
    area: "Claims desk",
    pain: "A claimant gets a receipt, then silence for weeks. Delay, low offers and unexplained decisions make up most complaints to the regulator.",
    answer: "Every claim has a status and a named owner from the first notice. A claims officer sees only their own claims, so nothing waits in a shared pile.",
    doNow: "Open the claims in review and check that each one has an owner and a next step.",
    next: [
      { label: "Risk signals at intake", href: "/dashboard/claims/automation" },
      { label: "Evidence from the scene", href: "/dashboard/claims/evidence" }
    ],
    publicStory: true
  },
  {
    id: "claims-intake",
    paths: ["/dashboard/claims/automation"],
    accent: "violet",
    motif: "seal",
    area: "Claim intake and risk signals",
    pain: "Fraud checks happen late and in the dark, so honest claimants wait while a few false claims push everyone's premium up.",
    answer: "Each first notice is scored on plain signals — late reporting, a very new policy, repeat claims, missing documents — with the reason written beside the score. A person makes every decision.",
    doNow: "Read the reasons on the latest notices. A claimant can be told exactly what is being checked.",
    next: [
      { label: "Check the documents", href: "/dashboard/operations/documents" },
      { label: "Follow the workflow", href: "/dashboard/claims/workflows" }
    ],
    publicStory: true
  },
  {
    id: "claims-evidence",
    paths: ["/dashboard/claims/evidence"],
    accent: "teal",
    motif: "shield",
    area: "Scene evidence",
    pain: "Disputes drag on because nobody can prove when and where a photo was taken, so every small claim waits for an assessor's visit.",
    answer: "Evidence is graded on five checks — live capture, timeliness, location, prompt upload and an unchanged file — so a reviewer sees at a glance what can be relied on.",
    doNow: "Sort by verdict and deal with the weak evidence first.",
    next: [
      { label: "Back to the claim", href: "/dashboard/claims" },
      { label: "Who did what, when", href: "/dashboard/audit" }
    ],
    publicStory: true
  },
  {
    id: "claims-workflow",
    paths: ["/dashboard/claims/workflows", "/dashboard/operations/transitions", "/dashboard/operations/rules"],
    accent: "ocean",
    motif: "ledger",
    area: "Claim workflow",
    pain: "Insurer, broker and assessor each run their own timeline, so no single party owns the claim and the customer is passed around.",
    answer: "One written path from first notice to closure. Each step names who may move the claim forward, and each move is recorded.",
    doNow: "Check which step holds the most claims today.",
    next: [
      { label: "Approvals waiting", href: "/dashboard/operations/approvals" },
      { label: "Overdue work", href: "/dashboard/operations/escalations" }
    ],
    publicStory: true
  },
  {
    id: "documents",
    paths: ["/dashboard/operations/documents", "/dashboard/attachments"],
    accent: "gold",
    motif: "ledger",
    area: "Documents",
    pain: "A claim stalls for days because one document was missing and nobody noticed until the file reached a manager's desk.",
    answer: "Each document type has its required details. Type them, or let your own phone read a photo and check what it found. A record with a missing detail is flagged for review instead of moving on quietly.",
    doNow: "Record a document for an open claim, then clear the ones marked for review.",
    next: [
      { label: "Claim intake", href: "/dashboard/claims/automation" },
      { label: "Scene evidence", href: "/dashboard/claims/evidence" }
    ],
    publicStory: true
  },
  {
    id: "products",
    paths: ["/dashboard/marketplace"],
    accent: "gold",
    motif: "shield",
    area: "Products",
    pain: "Sales talk is about price. What the cover includes lives in a brochure the customer never reads and the agent cannot find.",
    answer: "The product catalogue is one list everyone sells from, so the same cover is described the same way by every agent.",
    doNow: "Open a product and check its details before you quote it.",
    next: [
      { label: "How a price is built", href: "/dashboard/marketplace/pricing-engine" },
      { label: "Small, frequent covers", href: "/dashboard/marketplace/micro" }
    ],
    publicStory: true
  },
  {
    id: "pricing",
    paths: ["/dashboard/marketplace/pricing-engine"],
    accent: "violet",
    motif: "chart",
    area: "Pricing",
    pain: "Price wars push premiums below the cost of the risk, and the customer pays for it later when the claim is squeezed.",
    answer: "A price is built in the open: the risk factors, the loadings, the market benchmark and the floor it may never go below, each shown as its own line.",
    doNow: "Run a quote and read each line of the result. That is the explanation a customer can be given.",
    next: [
      { label: "Is the book profitable?", href: "/dashboard/finance/analytics" },
      { label: "The product catalogue", href: "/dashboard/marketplace" }
    ],
    publicStory: true
  },
  {
    id: "micro",
    paths: ["/dashboard/marketplace/micro"],
    accent: "teal",
    motif: "people",
    area: "Small covers",
    pain: "Most households have no cover at all. Annual premiums and paperwork assume a salary, and most incomes are daily and irregular.",
    answer: "Small covers are designed here with daily or weekly premiums and a grace period for a missed day, ready for a licensed insurer to offer.",
    doNow: "Compare the small covers and their grace rules.",
    next: [
      { label: "Price a cover", href: "/dashboard/marketplace/pricing-engine" },
      { label: "People following up", href: "/dashboard/subscribers" }
    ],
    publicStory: true
  },
  {
    id: "finance",
    paths: ["/dashboard/finance"],
    accent: "seal",
    motif: "chart",
    area: "Finance",
    pain: "Premiums, commissions and claim payments sit in different spreadsheets, so month-end is a week of matching figures by hand.",
    answer: "Invoices, reconciliation and payout records are views of the same policies and claims the rest of the team works on. InsurOS does not move money; it keeps the record straight.",
    doNow: "Open reconciliation and look at what does not match.",
    next: [
      { label: "What tax is due", href: "/dashboard/finance/tax" },
      { label: "The ratios that matter", href: "/dashboard/finance/analytics" }
    ],
    publicStory: true
  },
  {
    id: "tax",
    paths: ["/dashboard/finance/tax"],
    accent: "gold",
    motif: "seal",
    area: "Levies and tax",
    pain: "Levies are worked out by hand at the deadline, and insurers are fined every year for returns filed late.",
    answer: "Each country's levies are listed with their rate, what they apply to and a link to the authority's own portal, so the working is ready before the deadline. Rates are a guide; confirm them with the authority before you file.",
    doNow: "Open your country and check each levy line against your last return.",
    next: [
      { label: "County and state rules", href: "/dashboard/finance/tax/regional" },
      { label: "Records behind the figures", href: "/dashboard/finance/reconciliation" }
    ],
    publicStory: true
  },
  {
    id: "analytics",
    paths: ["/dashboard/finance/analytics"],
    accent: "ocean",
    motif: "chart",
    area: "Performance",
    pain: "Managers learn that a line is losing money months later, from the audited accounts.",
    answer: "Loss, expense and combined ratios sit on one page by country and period, so a line that is slipping shows while there is still time to act.",
    doNow: "Find the line with the highest combined ratio and open its claims.",
    next: [
      { label: "The claims behind it", href: "/dashboard/claims" },
      { label: "How it was priced", href: "/dashboard/marketplace/pricing-engine" }
    ],
    publicStory: true
  },
  {
    id: "sales",
    paths: ["/dashboard/sales", "/dashboard/subscribers"],
    accent: "coral",
    motif: "people",
    area: "Sales team",
    pain: "Targets are set by phone call, and nobody can show who was given what, or which agent brought in which business.",
    answer: "Each agent has a named supervisor and a written target. An agent sees their own book; a manager sees their team's.",
    doNow: "Open assignments and check that every agent has a current target.",
    next: [
      { label: "Commission statements", href: "/dashboard/sales/commissions" },
      { label: "The customers they brought", href: "/dashboard/customers" }
    ],
    publicStory: true
  },
  {
    id: "commissions",
    paths: ["/dashboard/sales/commissions"],
    accent: "gold",
    motif: "chart",
    area: "Commissions",
    pain: "Agents wait for commission and cannot see how it was worked out, so every month ends in an argument.",
    answer: "A statement per agent and period: what they earned directly, what came from their team, what was clawed back and why. The working is on the page.",
    doNow: "Open a statement and trace one line back to the policy that earned it.",
    next: [
      { label: "The team and targets", href: "/dashboard/sales/assignments" },
      { label: "Tax on commissions", href: "/dashboard/finance/tax" }
    ],
    publicStory: true
  },
  {
    id: "operations",
    paths: ["/dashboard/operations", "/dashboard/activity", "/dashboard/notifications", "/dashboard/comments"],
    accent: "ocean",
    motif: "clock",
    area: "Daily operations",
    pain: "Work is chased by phone and memory. Things slip, and nobody knows a task is late until the customer complains.",
    answer: "Tasks, approvals and escalations sit in one queue with an owner on each, so late work is visible to the person who can fix it.",
    doNow: "Open escalations and clear the oldest one first.",
    next: [
      { label: "Approvals waiting", href: "/dashboard/operations/approvals" },
      { label: "Documents to review", href: "/dashboard/operations/documents" }
    ],
    publicStory: true
  },
  {
    id: "access",
    paths: ["/dashboard/governance", "/dashboard/identity", "/dashboard/tenants"],
    accent: "violet",
    motif: "shield",
    area: "Who can see what",
    pain: "Shared passwords and one login for the whole office: anyone can open anything, and a former employee still can.",
    answer: "Each person signs in with their own phone and holds a role for their own region. Access is checked on the server, and an administrator can sign anyone out of every device at once.",
    doNow: "Review who holds access in your region and remove anyone who has left.",
    next: [
      { label: "The record of every action", href: "/dashboard/audit" },
      { label: "Terms people accepted", href: "/dashboard/legal" }
    ],
    publicStory: true
  },
  {
    id: "audit",
    paths: ["/dashboard/audit", "/dashboard/legal"],
    accent: "teal",
    motif: "seal",
    area: "Proof on record",
    pain: "When a regulator or a customer asks who approved something and when, the answer is a search through emails.",
    answer: "Actions are recorded with who, what and when, and each version of the terms keeps a record of who accepted it.",
    doNow: "Search the record for a claim or policy number and read its history.",
    next: [
      { label: "Who holds access", href: "/dashboard/governance/access" },
      { label: "Back to the claims desk", href: "/dashboard/claims" }
    ],
    publicStory: true
  },
  {
    id: "content",
    paths: ["/dashboard/operations/crm", "/dashboard/operations/templates", "/dashboard/operations/settings", "/dashboard/operations/feature-flags", "/dashboard/operations/policies", "/dashboard/operations/events"],
    accent: "coral",
    motif: "ledger",
    area: "Set-up",
    pain: "Every branch words things its own way, and a change of process takes months to reach everyone.",
    answer: "Templates, settings and messages are kept in one place, so a change made once reaches every desk.",
    doNow: "Check the settings that apply to your team.",
    next: [
      { label: "Daily operations", href: "/dashboard/operations" },
      { label: "Who can change this", href: "/dashboard/governance/access" }
    ],
    publicStory: false
  }
];

/** The story for a path: the longest matching route prefix wins; unknown dashboard paths get the workspace story. */
export function storyForPath(pathname: string): ValueStory | null {
  const path = pathname.split("?")[0]!.replace(/\/+$/, "") || "/";
  if (!path.startsWith("/dashboard")) return null;
  let best: { story: ValueStory; length: number } | null = null;
  for (const story of VALUE_STORIES) {
    for (const prefix of story.paths) {
      const matches = path === prefix || path.startsWith(`${prefix}/`);
      if (matches && (!best || prefix.length > best.length)) best = { story, length: prefix.length };
    }
  }
  return best?.story ?? null;
}

/** Stories shown on the public /why page, in reading order. */
export function publicStories(): ValueStory[] {
  return VALUE_STORIES.filter((story) => story.publicStory);
}

/** The public link a story is shared with (no sign-in needed to read it). */
export function storyShareUrl(story: ValueStory, baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/why#${story.id}`;
}

/** Plain text for WhatsApp, SMS or email: the pain, the answer, the link. */
export function storyShareText(story: ValueStory, baseUrl: string): string {
  return `${story.area}: ${story.pain}\n\nWhat we do about it: ${story.answer}\n\n${storyShareUrl(story, baseUrl)}`;
}
