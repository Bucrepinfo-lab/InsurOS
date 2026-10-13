import type { EntityId } from "./base";

export interface KpiSnapshot {
  id: EntityId;
  /** Accounting period, e.g. "2026-06". */
  period: string;
  countryCode: string;
  currency: string;
  grossWrittenPremium: number;
  claimsIncurred: number;
  operatingExpenses: number;
  /** Percent of claims fully adjudicated without human touch. */
  stpRatePercent: number;
  avgClaimCycleDays: number;
  policyRetentionPercent: number;
}

export interface KpiRatios {
  lossRatioPercent: number;
  expenseRatioPercent: number;
  combinedRatioPercent: number;
  /** Underwriting profit when combined ratio < 100. */
  underwritingProfitable: boolean;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Core insurer economics. Combined ratio below 100% means the book makes
 * an underwriting profit before investment income — the single number
 * that says whether digitalization is paying off.
 */
export function computeRatios(snapshot: KpiSnapshot): KpiRatios {
  const lossRatioPercent = round1(
    (snapshot.claimsIncurred / snapshot.grossWrittenPremium) * 100
  );
  const expenseRatioPercent = round1(
    (snapshot.operatingExpenses / snapshot.grossWrittenPremium) * 100
  );
  const combinedRatioPercent = round1(lossRatioPercent + expenseRatioPercent);

  return {
    lossRatioPercent,
    expenseRatioPercent,
    combinedRatioPercent,
    underwritingProfitable: combinedRatioPercent < 100
  };
}
