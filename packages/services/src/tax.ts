import type {
  InsuranceLine,
  TaxJurisdiction,
  TaxRemittance
} from "@insuros/domain";
import { computeTaxLines, totalTaxDue } from "@insuros/domain";
import { getPersistence } from "./persistence";

export interface ComputeRemittanceInput {
  jurisdictionId: string;
  period: string;
  insuranceLine: InsuranceLine;
  grossPremium: number;
  includeOptionalComponents?: boolean;
}

export class TaxRemittanceService {
  private get db() {
    return getPersistence();
  }

  async getJurisdictions(): Promise<TaxJurisdiction[]> {
    return this.db.taxJurisdictions.findAll();
  }

  async getJurisdiction(id: string): Promise<TaxJurisdiction | undefined> {
    return this.db.taxJurisdictions.findById(id);
  }

  async getJurisdictionByCountry(
    countryCode: string
  ): Promise<TaxJurisdiction | undefined> {
    const [jurisdiction] = await this.db.taxJurisdictions.findWhere(
      (item) => item.countryCode === countryCode
    );

    return jurisdiction;
  }

  async getRemittances(): Promise<TaxRemittance[]> {
    return this.db.taxRemittances.findAll();
  }

  async getRemittancesForCountry(countryCode: string): Promise<TaxRemittance[]> {
    return this.db.taxRemittances.findWhere(
      (remittance) => remittance.countryCode === countryCode
    );
  }

  /**
   * Compute a statutory remittance for a period. Uses the jurisdiction's
   * mandatory components (plus optional ones when requested) and returns a
   * Computed remittance with a direct statutory payment link.
   */
  async computeRemittance(
    input: ComputeRemittanceInput
  ): Promise<TaxRemittance> {
    const jurisdiction = await this.db.taxJurisdictions.findById(
      input.jurisdictionId
    );

    if (!jurisdiction) {
      throw new Error(`Unknown jurisdiction: ${input.jurisdictionId}`);
    }

    const components = jurisdiction.components.filter(
      (component) => component.mandatory || input.includeOptionalComponents
    );

    const lines = computeTaxLines(
      input.grossPremium,
      components,
      input.insuranceLine
    );

    return {
      id: `remit-${jurisdiction.countryCode.toLowerCase()}-${input.period}-${Date.now()}`,
      jurisdictionId: jurisdiction.id,
      countryCode: jurisdiction.countryCode,
      period: input.period,
      insuranceLine: input.insuranceLine,
      grossPremium: input.grossPremium,
      currency: jurisdiction.currency,
      lines,
      totalDue: totalTaxDue(lines),
      status: "Computed",
      dueDate: "",
      paymentUrl: jurisdiction.portalUrl,
      computedAt: new Date().toISOString()
    };
  }
}
