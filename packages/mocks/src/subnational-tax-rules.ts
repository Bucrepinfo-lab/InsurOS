import type { SubnationalTaxRule } from "@insuros/domain";

/**
 * Subnational statutory rules. Rates are representative figures compiled
 * 2026-07-06 — always re-verify with the named state/county authority
 * before filing.
 */
export const mockSubnationalTaxRules: SubnationalTaxRule[] = [
  // ── United States: state premium taxes ────────────────────────────────────
  {
    id: "sub-us-ca",
    countryCode: "US",
    regionCode: "US-CA",
    regionName: "California",
    name: "Gross Premium Tax",
    kind: "PremiumTax",
    ratePercent: 2.35,
    currency: "USD",
    base: "GrossPremium",
    appliesTo: [],
    portalName: "CDTFA",
    portalUrl: "https://cdtfa.ca.gov/taxes-and-fees/tax-on-insurers/",
    ratesVerifiedAt: "2026-07-06T00:00:00Z"
  },
  {
    id: "sub-us-ny",
    countryCode: "US",
    regionCode: "US-NY",
    regionName: "New York",
    name: "Premium Tax (P&C)",
    kind: "PremiumTax",
    ratePercent: 2.0,
    currency: "USD",
    base: "GrossPremium",
    appliesTo: ["Motor", "Property", "Marine", "General"],
    portalName: "NY DTF",
    portalUrl: "https://www.tax.ny.gov",
    ratesVerifiedAt: "2026-07-06T00:00:00Z",
    notes: "Accident & health lines taxed at 1.75%."
  },
  {
    id: "sub-us-tx",
    countryCode: "US",
    regionCode: "US-TX",
    regionName: "Texas",
    name: "Premium Tax (P&C)",
    kind: "PremiumTax",
    ratePercent: 1.6,
    currency: "USD",
    base: "GrossPremium",
    appliesTo: ["Motor", "Property", "Marine", "General"],
    portalName: "Texas Comptroller",
    portalUrl: "https://comptroller.texas.gov",
    ratesVerifiedAt: "2026-07-06T00:00:00Z",
    notes: "Life/health taxed at 1.75% on first $450k, 0.875% above."
  },
  {
    id: "sub-us-fl",
    countryCode: "US",
    regionCode: "US-FL",
    regionName: "Florida",
    name: "Insurance Premium Tax",
    kind: "PremiumTax",
    ratePercent: 1.75,
    currency: "USD",
    base: "GrossPremium",
    appliesTo: [],
    portalName: "FL DOR",
    portalUrl: "https://floridarevenue.com",
    ratesVerifiedAt: "2026-07-06T00:00:00Z"
  },
  {
    id: "sub-us-il",
    countryCode: "US",
    regionCode: "US-IL",
    regionName: "Illinois",
    name: "Privilege Tax",
    kind: "PremiumTax",
    ratePercent: 0.5,
    currency: "USD",
    base: "GrossPremium",
    appliesTo: [],
    portalName: "IL DOI",
    portalUrl: "https://idoi.illinois.gov",
    ratesVerifiedAt: "2026-07-06T00:00:00Z"
  },

  // ── Australia: state insurance stamp duty ─────────────────────────────────
  {
    id: "sub-au-nsw",
    countryCode: "AU",
    regionCode: "AU-NSW",
    regionName: "New South Wales",
    name: "Insurance Duty (general)",
    kind: "StampDuty",
    ratePercent: 9,
    currency: "AUD",
    base: "GrossPremium",
    appliesTo: ["Motor", "Property", "General"],
    portalName: "Revenue NSW",
    portalUrl: "https://www.revenue.nsw.gov.au/taxes-duties-levies-royalties/insurance-duty",
    ratesVerifiedAt: "2026-07-06T00:00:00Z"
  },
  {
    id: "sub-au-vic",
    countryCode: "AU",
    regionCode: "AU-VIC",
    regionName: "Victoria",
    name: "Insurance Duty (general)",
    kind: "StampDuty",
    ratePercent: 10,
    currency: "AUD",
    base: "GrossPremium",
    appliesTo: ["Motor", "Property", "General"],
    portalName: "SRO Victoria",
    portalUrl: "https://www.sro.vic.gov.au/insurance-duty",
    ratesVerifiedAt: "2026-07-06T00:00:00Z"
  },
  {
    id: "sub-au-qld",
    countryCode: "AU",
    regionCode: "AU-QLD",
    regionName: "Queensland",
    name: "Insurance Duty (class 2 general)",
    kind: "StampDuty",
    ratePercent: 9,
    currency: "AUD",
    base: "GrossPremium",
    appliesTo: ["Motor", "Property", "General"],
    portalName: "QRO",
    portalUrl: "https://qro.qld.gov.au",
    ratesVerifiedAt: "2026-07-06T00:00:00Z"
  },
  {
    id: "sub-au-act",
    countryCode: "AU",
    regionCode: "AU-ACT",
    regionName: "Australian Capital Territory",
    name: "Insurance Duty (abolished)",
    kind: "StampDuty",
    ratePercent: 0,
    currency: "AUD",
    base: "GrossPremium",
    appliesTo: [],
    portalName: "ACT Revenue Office",
    portalUrl: "https://www.revenue.act.gov.au",
    ratesVerifiedAt: "2026-07-06T00:00:00Z",
    notes: "The ACT fully abolished insurance stamp duty."
  },

  // ── Kenya: county-level levies ────────────────────────────────────────────
  {
    id: "sub-ke-047",
    countryCode: "KE",
    regionCode: "KE-047",
    regionName: "Nairobi County",
    name: "Unified Business Permit (branch office, annual)",
    kind: "BusinessPermit",
    flatAmount: 15000,
    currency: "KES",
    base: "GrossPremium",
    appliesTo: [],
    portalName: "Nairobi County ePayments",
    portalUrl: "https://epayments.nairobi.go.ke",
    ratesVerifiedAt: "2026-07-06T00:00:00Z",
    notes: "Indicative fee band for a medium office; confirm band with county."
  },
  {
    id: "sub-ke-001",
    countryCode: "KE",
    regionCode: "KE-001",
    regionName: "Mombasa County",
    name: "Single Business Permit (branch office, annual)",
    kind: "BusinessPermit",
    flatAmount: 12000,
    currency: "KES",
    base: "GrossPremium",
    appliesTo: [],
    portalName: "Mombasa County Revenue",
    portalUrl: "https://www.mombasa.go.ke",
    ratesVerifiedAt: "2026-07-06T00:00:00Z",
    notes: "Indicative fee band for a medium office; confirm band with county."
  }
];
