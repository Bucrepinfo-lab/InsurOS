import type { EntityId, IsoDateTime } from "./base";
import type {
  InsuranceLine,
  TaxBase,
  TaxComponentKind,
  TaxLineComputation
} from "./tax";

export type SubnationalTaxKind = TaxComponentKind | "LocalLevy" | "BusinessPermit";

/**
 * A tax rule scoped to a subnational region (US state, Australian state,
 * Kenyan county). Either a percentage of the base or a flat amount.
 */
export interface SubnationalTaxRule {
  id: EntityId;
  countryCode: string;
  /** Region code, e.g. "US-CA", "AU-NSW", "KE-047". */
  regionCode: string;
  regionName: string;
  name: string;
  kind: SubnationalTaxKind;
  ratePercent?: number;
  flatAmount?: number;
  currency: string;
  base: TaxBase;
  /** Insurance lines the rule applies to; empty = all lines. */
  appliesTo: InsuranceLine[];
  portalName: string;
  portalUrl: string;
  ratesVerifiedAt: IsoDateTime;
  notes?: string;
}

/**
 * Compute subnational tax lines for a gross premium against the rules of
 * one region, filtered to the given insurance line.
 */
export function computeSubnationalTaxLines(
  grossPremium: number,
  rules: SubnationalTaxRule[],
  line: InsuranceLine
): TaxLineComputation[] {
  return rules
    .filter(
      (rule) => rule.appliesTo.length === 0 || rule.appliesTo.includes(line)
    )
    .map((rule) => {
      const isPercentage = rule.ratePercent !== undefined;
      const baseAmount = isPercentage ? grossPremium : 0;
      const amountDue = isPercentage
        ? Math.round(grossPremium * (rule.ratePercent ?? 0)) / 100
        : (rule.flatAmount ?? 0);

      return {
        componentId: rule.id,
        componentName: `${rule.regionName}: ${rule.name}`,
        kind: rule.kind as TaxComponentKind,
        ratePercent: rule.ratePercent ?? 0,
        baseAmount,
        amountDue
      };
    });
}
