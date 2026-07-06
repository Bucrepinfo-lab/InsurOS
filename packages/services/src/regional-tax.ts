import type {
  InsuranceLine,
  SubnationalTaxRule,
  TaxLineComputation
} from "@insuros/domain";
import {
  computeSubnationalTaxLines,
  computeTaxLines,
  totalTaxDue
} from "@insuros/domain";
import { getPersistence } from "./persistence";

export interface RegionalComputationResult {
  countryCode: string;
  regionCode: string;
  insuranceLine: InsuranceLine;
  grossPremium: number;
  currency: string;
  nationalLines: TaxLineComputation[];
  regionalLines: TaxLineComputation[];
  totalDue: number;
}

export class RegionalTaxService {
  private get db() {
    return getPersistence();
  }

  async getRules(): Promise<SubnationalTaxRule[]> {
    return this.db.subnationalTaxRules.findAll();
  }

  async getRulesForCountry(countryCode: string): Promise<SubnationalTaxRule[]> {
    return this.db.subnationalTaxRules.findWhere(
      (rule) => rule.countryCode === countryCode
    );
  }

  async getRulesForRegion(regionCode: string): Promise<SubnationalTaxRule[]> {
    return this.db.subnationalTaxRules.findWhere(
      (rule) => rule.regionCode === regionCode
    );
  }

  /**
   * Full statutory computation for one region: national mandatory
   * components plus the region's subnational rules.
   */
  async computeRegional(
    countryCode: string,
    regionCode: string,
    grossPremium: number,
    insuranceLine: InsuranceLine
  ): Promise<RegionalComputationResult> {
    const [jurisdiction] = await this.db.taxJurisdictions.findWhere(
      (item) => item.countryCode === countryCode
    );

    if (!jurisdiction) {
      throw new Error(`Unknown jurisdiction: ${countryCode}`);
    }

    const nationalLines = computeTaxLines(
      grossPremium,
      jurisdiction.components.filter((component) => component.mandatory),
      insuranceLine
    );

    const regionalLines = computeSubnationalTaxLines(
      grossPremium,
      await this.db.subnationalTaxRules.findWhere(
        (rule) => rule.regionCode === regionCode
      ),
      insuranceLine
    );

    return {
      countryCode,
      regionCode,
      insuranceLine,
      grossPremium,
      currency: jurisdiction.currency,
      nationalLines,
      regionalLines,
      totalDue: totalTaxDue([...nationalLines, ...regionalLines])
    };
  }
}
