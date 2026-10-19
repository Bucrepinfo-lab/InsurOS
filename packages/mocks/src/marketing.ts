import type { MarketingContent } from "@insuros/domain";

export const mockMarketingContent: MarketingContent[] = [
  {
    id: "mkt-claims-speed",
    title: "Claims speed merit",
    headline: "Claims paid in hours, not weeks.",
    body: "Our straight-through engine approves clean claims automatically against published rules — with the reasons shown to you in plain language. No black boxes, no waiting rooms. If a human needs to look, you see exactly why and when.",
    cta: "See how claims work",
    ctaHref: "/dashboard/claims/automation",
    insuranceLine: "All",
    placement: "ClaimsPortal",
    audience: "All",
    locale: "en",
    status: "Active"
  },
  {
    id: "mkt-price-fair",
    title: "Fair pricing merit",
    headline: "Prices that respect your pocket — engineered, not inflated.",
    body: "We run no branch network and push no paper, and those savings fund your premium. Our pricing engine benchmarks the market and prices below the median while never cutting corners on your cover. Safe-driver and mitigation discounts are automatic.",
    cta: "Get a quote",
    ctaHref: "/dashboard/marketplace/pricing-engine",
    insuranceLine: "All",
    placement: "PricingQuote",
    audience: "Prospect",
    locale: "en",
    status: "Active"
  },
  {
    id: "mkt-micro-20bob",
    title: "Micro affordability merit",
    headline: "Real cover from KES 20 a day — right from your phone.",
    body: "Dial the USSD code, pay with mobile money, and you are covered before you put the phone down. No forms, no office visits, no salary slip. Miss a day? Our grace period understands hustle income.",
    cta: "Dial *334# to start",
    insuranceLine: "All",
    placement: "Micro",
    audience: "Prospect",
    locale: "en",
    status: "Active"
  },
  {
    id: "mkt-parametric",
    title: "Parametric merit",
    headline: "Drought cover that pays itself. No claim forms. Ever.",
    body: "Our index products watch the rainfall data for you. When the trigger hits, the payout lands in your mobile money — automatically. You never file a claim, argue with an assessor, or wait for a committee.",
    cta: "Explore index covers",
    ctaHref: "/dashboard/marketplace/micro",
    insuranceLine: "General",
    placement: "Micro",
    audience: "All",
    locale: "en",
    status: "Active"
  },
  {
    id: "mkt-transparency",
    title: "Transparency merit",
    headline: "Photograph the scene. Seal the truth. Skip the disputes.",
    body: "Capture incident photos live in the app — GPS, time, and a cryptographic seal attach automatically. Strong evidence means instant processing, no adjuster visits, and no he-said-she-said. Your honesty becomes your fast lane.",
    cta: "How scene capture works",
    ctaHref: "/dashboard/claims/evidence",
    insuranceLine: "All",
    placement: "ClaimsPortal",
    audience: "Policyholder",
    locale: "en",
    status: "Active"
  },
  {
    id: "mkt-trust-global",
    title: "Trust merit",
    headline: "Insurance that shows its working.",
    body: "Every decision on your policy — price, claim, payout — comes with the reason attached. Regulated in every country we operate, taxes remitted to the shilling, terms you accepted versioned forever. That is what insurance should have been all along.",
    cta: "Why InsurOS",
    insuranceLine: "All",
    placement: "All",
    audience: "All",
    locale: "en",
    status: "Active"
  }
];
