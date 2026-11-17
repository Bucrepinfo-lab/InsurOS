import type { MarketingContent } from "@insuros/domain";

/**
 * Sample customer messages. Each one states only what the workspace does
 * today (docs/VALUE_STRATEGY.md): no payout speed, no automatic payment, no
 * USSD code, no regulatory status.
 */
export const mockMarketingContent: MarketingContent[] = [
  {
    id: "mkt-claims-speed",
    title: "Claim status message",
    headline: "Every claim has a named owner and a status you can ask about.",
    body: "From the first notice your claim has a status and a person responsible for it. If something is being checked, we tell you what and why. Decisions are made by people and come with written reasons.",
    cta: "See how claims are handled",
    ctaHref: "/why#claims",
    insuranceLine: "All",
    placement: "ClaimsPortal",
    audience: "All",
    locale: "en",
    status: "Active"
  },
  {
    id: "mkt-price-fair",
    title: "Open pricing message",
    headline: "A price you can read line by line.",
    body: "Your premium is built from the risk factors, the loadings and a floor it may never go below. Each one is shown as its own line, so you can see what you are paying for and ask about any part of it.",
    cta: "See how a price is built",
    ctaHref: "/why#pricing",
    insuranceLine: "All",
    placement: "PricingQuote",
    audience: "Prospect",
    locale: "en",
    status: "Active"
  },
  {
    id: "mkt-micro-20bob",
    title: "Small covers message",
    headline: "Cover sized for daily and weekly income.",
    body: "Small covers have daily or weekly premiums and a grace period for a missed day. Ask your agent which ones are offered by a licensed insurer in your area.",
    cta: "See small covers",
    ctaHref: "/why#micro",
    insuranceLine: "All",
    placement: "Micro",
    audience: "Prospect",
    locale: "en",
    status: "Active"
  },
  {
    id: "mkt-parametric",
    title: "Index cover message",
    headline: "Index cover: defined by a measured trigger.",
    body: "An index cover is tied to a published measurement, such as rainfall in your county, instead of an assessment of your loss. Ask your agent for the trigger, the data source and the terms before you buy.",
    cta: "See small covers",
    ctaHref: "/why#micro",
    insuranceLine: "General",
    placement: "Micro",
    audience: "All",
    locale: "en",
    status: "Active"
  },
  {
    id: "mkt-transparency",
    title: "Scene evidence message",
    headline: "Good evidence shortens a claim.",
    body: "Photos are graded on five checks: live capture, timeliness, location, prompt upload and an unchanged file. Clear evidence means fewer questions and fewer disputes later.",
    cta: "See how evidence is graded",
    ctaHref: "/why#claims-evidence",
    insuranceLine: "All",
    placement: "ClaimsPortal",
    audience: "Policyholder",
    locale: "en",
    status: "Active"
  },
  {
    id: "mkt-trust-global",
    title: "Records message",
    headline: "Insurance that shows its working.",
    body: "Prices, claim decisions and commissions are recorded with who did what and when, and each version of the terms keeps a record of who accepted it.",
    cta: "Why teams use it",
    ctaHref: "/why",
    insuranceLine: "All",
    placement: "All",
    audience: "All",
    locale: "en",
    status: "Active"
  }
];
