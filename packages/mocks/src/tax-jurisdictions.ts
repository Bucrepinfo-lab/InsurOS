import type { TaxJurisdiction } from "@insuros/domain";

/**
 * Statutory insurance tax data per jurisdiction.
 *
 * Rates verified against public sources as of 2026-07-06. Statutory rates
 * change: always re-verify with the named authority before filing.
 */
export const mockTaxJurisdictions: TaxJurisdiction[] = [
  {
    id: "tax-ke",
    countryCode: "KE",
    countryName: "Kenya",
    continentCode: "AF",
    currency: "KES",
    authorityName: "Kenya Revenue Authority (KRA)",
    regulatorName: "Insurance Regulatory Authority (IRA)",
    portalName: "KRA iTax",
    portalUrl: "https://itax.kra.go.ke",
    filingFrequency: "Monthly",
    ratesVerifiedAt: "2026-07-06T00:00:00Z",
    notes:
      "Insurance relief of 15% of premiums (max KES 60,000/yr) available to policyholders. Finance Act 2026 allows KRA to recover unpaid levies as tax.",
    components: [
      {
        id: "tax-ke-itl",
        name: "Insurance Training Levy (ITL)",
        kind: "PremiumLevy",
        ratePercent: 0.2,
        base: "GrossPremium",
        appliesTo: [],
        mandatory: true
      },
      {
        id: "tax-ke-pcf",
        name: "Policyholders Compensation Fund (PCF)",
        kind: "CompensationFundLevy",
        ratePercent: 0.25,
        base: "GrossPremium",
        appliesTo: [],
        mandatory: true
      },
      {
        id: "tax-ke-stamp",
        name: "Stamp Duty",
        kind: "StampDuty",
        ratePercent: 0.05,
        base: "GrossPremium",
        appliesTo: [],
        mandatory: true
      },
      {
        id: "tax-ke-vat",
        name: "VAT (non-exempt services)",
        kind: "VAT",
        ratePercent: 16,
        base: "Commission",
        appliesTo: [],
        mandatory: false,
        notes: "Insurance premiums are VAT-exempt; VAT applies to commissions and taxable ancillary services."
      }
    ]
  },
  {
    id: "tax-ng",
    countryCode: "NG",
    countryName: "Nigeria",
    continentCode: "AF",
    currency: "NGN",
    authorityName: "Nigeria Revenue Service (NRS, formerly FIRS)",
    regulatorName: "NAICOM",
    portalName: "TaxPro-Max",
    portalUrl: "https://taxpromax.firs.gov.ng",
    filingFrequency: "Monthly",
    ratesVerifiedAt: "2026-07-06T00:00:00Z",
    notes:
      "Nigeria Tax Act 2025 effective 1 Jan 2026: 4% Development Levy consolidates TET/IT/NASENI/PTF levies; foreign insurers taxed on Nigerian premiums.",
    components: [
      {
        id: "tax-ng-vat",
        name: "VAT",
        kind: "VAT",
        ratePercent: 7.5,
        base: "GrossPremium",
        appliesTo: ["Motor", "Property", "Marine", "General"],
        mandatory: true,
        notes: "Life insurance premiums are VAT-exempt."
      },
      {
        id: "tax-ng-naicom",
        name: "NAICOM Supervisory Levy",
        kind: "SupervisoryLevy",
        ratePercent: 1,
        base: "GrossPremium",
        appliesTo: [],
        mandatory: true
      },
      {
        id: "tax-ng-dev",
        name: "Development Levy",
        kind: "DevelopmentLevy",
        ratePercent: 4,
        base: "AssessableProfit",
        appliesTo: [],
        mandatory: true,
        notes: "4% of assessable profits (not premium) from 2026."
      }
    ]
  },
  {
    id: "tax-gb",
    countryCode: "GB",
    countryName: "United Kingdom",
    continentCode: "EU",
    currency: "GBP",
    authorityName: "HM Revenue & Customs (HMRC)",
    regulatorName: "FCA / PRA",
    portalName: "HMRC Online Services",
    portalUrl: "https://www.gov.uk/guidance/insurance-premium-tax",
    filingFrequency: "Quarterly",
    ratesVerifiedAt: "2026-07-06T00:00:00Z",
    components: [
      {
        id: "tax-gb-ipt-std",
        name: "Insurance Premium Tax (standard)",
        kind: "IPT",
        ratePercent: 12,
        base: "GrossPremium",
        appliesTo: ["Motor", "Property", "Marine", "General", "Health"],
        mandatory: true,
        notes: "Long-term life insurance is IPT-exempt."
      },
      {
        id: "tax-gb-ipt-high",
        name: "Insurance Premium Tax (higher: travel, appliance, some motor)",
        kind: "IPT",
        ratePercent: 20,
        base: "GrossPremium",
        appliesTo: [],
        mandatory: false
      }
    ]
  },
  {
    id: "tax-us",
    countryCode: "US",
    countryName: "United States",
    continentCode: "NA",
    currency: "USD",
    authorityName: "IRS + State Departments of Insurance",
    regulatorName: "NAIC (state-based regulation)",
    portalName: "EFTPS (federal) / state portals",
    portalUrl: "https://www.eftps.gov",
    filingFrequency: "Quarterly",
    ratesVerifiedAt: "2026-07-06T00:00:00Z",
    notes:
      "State premium taxes typically 1.75%–3.5% of gross premium, varying by state and line. Federal excise tax applies to premiums paid to foreign insurers (1% reinsurance / 4% direct).",
    components: [
      {
        id: "tax-us-state",
        name: "State Premium Tax (representative average)",
        kind: "PremiumTax",
        ratePercent: 2.25,
        base: "GrossPremium",
        appliesTo: [],
        mandatory: true,
        notes: "Configure per-state rates in production."
      },
      {
        id: "tax-us-fet",
        name: "Federal Excise Tax (foreign insurers, direct)",
        kind: "ExciseTax",
        ratePercent: 4,
        base: "GrossPremium",
        appliesTo: [],
        mandatory: false
      }
    ]
  },
  {
    id: "tax-in",
    countryCode: "IN",
    countryName: "India",
    continentCode: "AS",
    currency: "INR",
    authorityName: "GST Council / CBIC",
    regulatorName: "IRDAI",
    portalName: "GST Portal",
    portalUrl: "https://www.gst.gov.in",
    filingFrequency: "Monthly",
    ratesVerifiedAt: "2026-07-06T00:00:00Z",
    notes:
      "56th GST Council (Sept 2025): individual life & health insurance premiums GST-exempt from 22 Sep 2025. Group policies and general/motor lines remain at 18%.",
    components: [
      {
        id: "tax-in-gst-individual",
        name: "GST (individual life & health)",
        kind: "GST",
        ratePercent: 0,
        base: "GrossPremium",
        appliesTo: ["Life", "Health"],
        mandatory: true,
        notes: "Exempt since 22 Sep 2025."
      },
      {
        id: "tax-in-gst-general",
        name: "GST (general, motor, group policies)",
        kind: "GST",
        ratePercent: 18,
        base: "GrossPremium",
        appliesTo: ["Motor", "Property", "Marine", "General"],
        mandatory: true
      }
    ]
  },
  {
    id: "tax-br",
    countryCode: "BR",
    countryName: "Brazil",
    continentCode: "SA",
    currency: "BRL",
    authorityName: "Receita Federal do Brasil",
    regulatorName: "SUSEP",
    portalName: "e-CAC",
    portalUrl: "https://cav.receita.fazenda.gov.br",
    filingFrequency: "Monthly",
    ratesVerifiedAt: "2026-07-06T00:00:00Z",
    notes:
      "IOF on insurance varies by line (0%–7.38%). 5% IOF on VGBL life contributions above BRL 600k/yr from 2026. IOF on insurance scheduled to end in 2027 under tax reform.",
    components: [
      {
        id: "tax-br-iof-life",
        name: "IOF (life & personal accident)",
        kind: "IOF",
        ratePercent: 0.38,
        base: "GrossPremium",
        appliesTo: ["Life", "Health"],
        mandatory: true
      },
      {
        id: "tax-br-iof-general",
        name: "IOF (property & casualty)",
        kind: "IOF",
        ratePercent: 7.38,
        base: "GrossPremium",
        appliesTo: ["Motor", "Property", "General"],
        mandatory: true
      }
    ]
  },
  {
    id: "tax-au",
    countryCode: "AU",
    countryName: "Australia",
    continentCode: "OC",
    currency: "AUD",
    authorityName: "Australian Taxation Office (ATO)",
    regulatorName: "APRA",
    portalName: "ATO Online Services",
    portalUrl: "https://www.ato.gov.au",
    filingFrequency: "Quarterly",
    ratesVerifiedAt: "2026-07-06T00:00:00Z",
    notes:
      "GST 10% on general insurance premiums; life insurance is input-taxed (no GST). State stamp duty varies (approx. 9–11%; ACT abolished).",
    components: [
      {
        id: "tax-au-gst",
        name: "GST",
        kind: "GST",
        ratePercent: 10,
        base: "GrossPremium",
        appliesTo: ["Motor", "Property", "Marine", "General", "Health"],
        mandatory: true
      },
      {
        id: "tax-au-stamp",
        name: "State Stamp Duty (representative)",
        kind: "StampDuty",
        ratePercent: 10,
        base: "GrossPremium",
        appliesTo: ["Motor", "Property", "General"],
        mandatory: false,
        notes: "Varies by state; configure per-state rates in production."
      }
    ]
  }
];
