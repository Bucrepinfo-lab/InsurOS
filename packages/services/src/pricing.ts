import type {
  AffordabilityBand,
  CompetitorBenchmark,
  PricingQuote,
  QuoteInput,
  RiskFactor
} from "@insuros/domain";
import { computeQuote } from "@insuros/domain";
import { getPersistence } from "./persistence";

export class PricingService {
  private get db() {
    return getPersistence();
  }

  async getRiskFactors(): Promise<RiskFactor[]> {
    return this.db.riskFactors.findAll();
  }

  async getAffordabilityBands(): Promise<AffordabilityBand[]> {
    return this.db.affordabilityBands.findAll();
  }

  async getBenchmarks(): Promise<CompetitorBenchmark[]> {
    return this.db.competitorBenchmarks.findAll();
  }

  /**
   * Produce a competitive-friendly quote: risk-adjusted technical premium,
   * lean digital loadings, competitor undercut, affordability floor.
   */
  async quote(input: QuoteInput): Promise<PricingQuote> {
    const factors = await this.db.riskFactors.findAll();
    const benchmarks = await this.db.competitorBenchmarks.findAll();
    const band = input.affordabilityBandId
      ? await this.db.affordabilityBands.findById(input.affordabilityBandId)
      : undefined;

    return computeQuote(input, factors, benchmarks, band);
  }
}
