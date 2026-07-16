import type { KpiSnapshot } from "@insuros/domain";

export const mockKpiSnapshots: KpiSnapshot[] = [
  {
    id: "kpi-ke-2026-05",
    period: "2026-05",
    countryCode: "KE",
    currency: "KES",
    grossWrittenPremium: 182_000_000,
    claimsIncurred: 118_300_000,
    operatingExpenses: 63_700_000,
    stpRatePercent: 22,
    avgClaimCycleDays: 21,
    policyRetentionPercent: 74
  },
  {
    id: "kpi-ke-2026-06",
    period: "2026-06",
    countryCode: "KE",
    currency: "KES",
    grossWrittenPremium: 195_500_000,
    claimsIncurred: 121_200_000,
    operatingExpenses: 58_650_000,
    stpRatePercent: 41,
    avgClaimCycleDays: 12,
    policyRetentionPercent: 78
  },
  {
    id: "kpi-ng-2026-06",
    period: "2026-06",
    countryCode: "NG",
    currency: "NGN",
    grossWrittenPremium: 410_000_000,
    claimsIncurred: 270_600_000,
    operatingExpenses: 143_500_000,
    stpRatePercent: 18,
    avgClaimCycleDays: 26,
    policyRetentionPercent: 69
  }
];
