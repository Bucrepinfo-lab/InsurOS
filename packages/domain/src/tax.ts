import type { EntityId, IsoDateTime } from "./base";
import type { ContinentCode } from "./admin-hierarchy";

export type TaxComponentKind =
  | "PremiumLevy"
  | "PremiumTax"
  | "VAT"
  | "GST"
  | "IPT"
  | "StampDuty"
  | "WithholdingTax"
  | "IOF"
  | "ExciseTax"
  | "DevelopmentLevy"
  | "CompensationFundLevy"
  | "SupervisoryLevy";

export type TaxBase =
  | "GrossPremium"
  | "NetPremium"
  | "AssessableProfit"
  | "Commission";

export type InsuranceLine =
  | "Life"
  | "Health"
  | "Motor"
  | "Property"
  | "Marine"
  | "General";

export interface TaxComponent {
  id: EntityId;
  name: string;
  kind: TaxComponentKind;
  /** Percentage rate, e.g. 12 means 12%. */
  ratePercent: number;
  base: TaxBase;
  /** Insurance lines the component applies to; empty = all lines. */
  appliesTo: InsuranceLine[];
  mandatory: boolean;
  notes?: string;
}

export type TaxFilingFrequency = "Monthly" | "Quarterly" | "Annually";

export interface TaxJurisdiction {
  id: EntityId;
  countryCode: string;
  countryName: string;
  continentCode: ContinentCode;
  currency: string;
  /** Statutory revenue authority, e.g. "Kenya Revenue Authority". */
  authorityName: string;
  /** Insurance regulator where distinct, e.g. "IRA", "NAICOM". */
  regulatorName?: string;
  portalName: string;
  /** Official statutory remittance / e-filing portal. */
  portalUrl: string;
  filingFrequency: TaxFilingFrequency;
  components: TaxComponent[];
  /** Date the statutory data was last verified. */
  ratesVerifiedAt: IsoDateTime;
  notes?: string;
}

export interface TaxLineComputation {
  componentId: EntityId;
  componentName: string;
  kind: TaxComponentKind;
  ratePercent: number;
  baseAmount: number;
  amountDue: number;
}

export type TaxRemittanceStatus =
  | "Draft"
  | "Computed"
  | "Filed"
  | "Paid"
  | "Overdue";

export interface TaxRemittance {
  id: EntityId;
  jurisdictionId: EntityId;
  countryCode: string;
  /** Accounting period, e.g. "2026-06". */
  period: string;
  insuranceLine: InsuranceLine;
  grossPremium: number;
  currency: string;
  lines: TaxLineComputation[];
  totalDue: number;
  status: TaxRemittanceStatus;
  dueDate: IsoDateTime;
  /** Direct link to the statutory payment portal. */
  paymentUrl: string;
  computedAt?: IsoDateTime;
  filedAt?: IsoDateTime;
  paidAt?: IsoDateTime;
}

/**
 * Compute statutory tax lines for a gross premium against a jurisdiction's
 * components, filtered to the given insurance line.
 */
export function computeTaxLines(
  grossPremium: number,
  components: TaxComponent[],
  line: InsuranceLine
): TaxLineComputation[] {
  return components
    .filter(
      (component) =>
        component.appliesTo.length === 0 || component.appliesTo.includes(line)
    )
    .map((component) => {
      const baseAmount =
        component.base === "GrossPremium" || component.base === "NetPremium"
          ? grossPremium
          : 0;
      const amountDue =
        Math.round(baseAmount * component.ratePercent) / 100;

      return {
        componentId: component.id,
        componentName: component.name,
        kind: component.kind,
        ratePercent: component.ratePercent,
        baseAmount,
        amountDue
      };
    });
}

export function totalTaxDue(lines: TaxLineComputation[]): number {
  return Math.round(lines.reduce((sum, line) => sum + line.amountDue, 0) * 100) / 100;
}
