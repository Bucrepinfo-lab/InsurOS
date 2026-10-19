import type { EntityId, IsoDateTime } from "./base";
import type { InsuranceLine } from "./tax";

export interface RiskFactor {
  id: EntityId;
  name: string;
  insuranceLine: InsuranceLine | "All";
  /** Multiplier applied to the technical base premium, e.g. 1.15. */
  multiplier: number;
  description: string;
}

export interface AffordabilityBand {
  id: EntityId;
  name: string;
  targetSegment: string;
  /** Discount off the commercial premium, in percent. */
  discountPercent: number;
  /** Never price below this monthly amount. */
  minMonthlyPremium: number;
  currency: string;
}

export interface CompetitorBenchmark {
  id: EntityId;
  competitor: string;
  insuranceLine: InsuranceLine;
  countryCode: string;
  monthlyPremium: number;
  currency: string;
  capturedAt: IsoDateTime;
}

export interface QuoteInput {
  insuranceLine: InsuranceLine;
  countryCode: string;
  /** Actuarial base monthly premium before loadings. */
  baseMonthlyPremium: number;
  riskFactorIds: EntityId[];
  affordabilityBandId?: EntityId;
  /** Expense loading percent (operating costs recovered per policy). */
  expenseLoadingPercent: number;
  /** Commission loading percent. */
  commissionLoadingPercent: number;
}

export interface PricingQuote {
  insuranceLine: InsuranceLine;
  countryCode: string;
  currency: string;
  technicalPremium: number;
  commercialPremium: number;
  competitorMedian?: number;
  /** Final recommended monthly premium after competitive + affordability adjustment. */
  recommendedPremium: number;
  marginPercent: number;
  adjustments: string[];
  computedAt: IsoDateTime;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function median(values: number[]): number | undefined {
  if (values.length === 0) {
    return undefined;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Competitive-friendly pricing: technical premium (base × risk factors),
 * plus expense/commission loadings = commercial premium; then priced to
 * undercut the competitor median (capped at 5% below) while respecting
 * the affordability band's floor and discount. Digital distribution keeps
 * loadings low — that is the structural price advantage.
 */
export function computeQuote(
  input: QuoteInput,
  factors: RiskFactor[],
  benchmarks: CompetitorBenchmark[],
  band?: AffordabilityBand
): PricingQuote {
  const adjustments: string[] = [];

  const riskMultiplier = input.riskFactorIds.reduce((product, id) => {
    const factor = factors.find((item) => item.id === id);
    return factor ? product * factor.multiplier : product;
  }, 1);

  const technicalPremium = round2(input.baseMonthlyPremium * riskMultiplier);

  const commercialPremium = round2(
    technicalPremium *
      (1 + (input.expenseLoadingPercent + input.commissionLoadingPercent) / 100)
  );

  const competitorMedian = median(
    benchmarks
      .filter(
        (benchmark) =>
          benchmark.insuranceLine === input.insuranceLine &&
          benchmark.countryCode === input.countryCode
      )
      .map((benchmark) => benchmark.monthlyPremium)
  );

  let recommendedPremium = commercialPremium;

  if (competitorMedian !== undefined && commercialPremium > competitorMedian) {
    recommendedPremium = round2(competitorMedian * 0.95);
    adjustments.push(
      `Priced 5% below competitor median (${competitorMedian}) for competitive advantage.`
    );
  }

  if (band) {
    const discounted = round2(
      recommendedPremium * (1 - band.discountPercent / 100)
    );
    recommendedPremium = Math.max(discounted, band.minMonthlyPremium);
    adjustments.push(
      `Affordability band "${band.name}": ${band.discountPercent}% discount, floor ${band.minMonthlyPremium}.`
    );
  }

  if (recommendedPremium < technicalPremium) {
    recommendedPremium = technicalPremium;
    adjustments.push(
      "Floored at technical premium — never price below expected risk cost."
    );
  }

  const marginPercent = round2(
    ((recommendedPremium - technicalPremium) / technicalPremium) * 100
  );

  return {
    insuranceLine: input.insuranceLine,
    countryCode: input.countryCode,
    currency: band?.currency ?? "USD",
    technicalPremium,
    commercialPremium,
    competitorMedian,
    recommendedPremium,
    marginPercent,
    adjustments,
    computedAt: new Date().toISOString()
  };
}
