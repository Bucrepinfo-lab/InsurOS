import type { TaxRemittance } from "@insuros/domain";
import { computeTaxLines, totalTaxDue } from "@insuros/domain";
import { mockTaxJurisdictions } from "./tax-jurisdictions";

function buildRemittance(
  id: string,
  jurisdictionId: string,
  period: string,
  insuranceLine: TaxRemittance["insuranceLine"],
  grossPremium: number,
  status: TaxRemittance["status"],
  dueDate: string
): TaxRemittance {
  const jurisdiction = mockTaxJurisdictions.find(
    (item) => item.id === jurisdictionId
  );

  if (!jurisdiction) {
    throw new Error(`Unknown jurisdiction: ${jurisdictionId}`);
  }

  const lines = computeTaxLines(
    grossPremium,
    jurisdiction.components.filter((component) => component.mandatory),
    insuranceLine
  );

  return {
    id,
    jurisdictionId,
    countryCode: jurisdiction.countryCode,
    period,
    insuranceLine,
    grossPremium,
    currency: jurisdiction.currency,
    lines,
    totalDue: totalTaxDue(lines),
    status,
    dueDate,
    paymentUrl: jurisdiction.portalUrl,
    computedAt: "2026-07-01T08:00:00Z"
  };
}

export const mockTaxRemittances: TaxRemittance[] = [
  buildRemittance(
    "remit-ke-2026-06",
    "tax-ke",
    "2026-06",
    "Motor",
    48_500_000,
    "Computed",
    "2026-07-20T00:00:00Z"
  ),
  buildRemittance(
    "remit-ng-2026-06",
    "tax-ng",
    "2026-06",
    "General",
    120_000_000,
    "Filed",
    "2026-07-21T00:00:00Z"
  ),
  buildRemittance(
    "remit-gb-2026-q2",
    "tax-gb",
    "2026-Q2",
    "Property",
    2_400_000,
    "Paid",
    "2026-07-31T00:00:00Z"
  ),
  buildRemittance(
    "remit-us-2026-q2",
    "tax-us",
    "2026-Q2",
    "General",
    5_600_000,
    "Computed",
    "2026-07-15T00:00:00Z"
  ),
  buildRemittance(
    "remit-in-2026-06",
    "tax-in",
    "2026-06",
    "Motor",
    95_000_000,
    "Draft",
    "2026-07-20T00:00:00Z"
  ),
  buildRemittance(
    "remit-br-2026-06",
    "tax-br",
    "2026-06",
    "Motor",
    8_200_000,
    "Overdue",
    "2026-06-25T00:00:00Z"
  ),
  buildRemittance(
    "remit-au-2026-q2",
    "tax-au",
    "2026-Q2",
    "Property",
    3_100_000,
    "Computed",
    "2026-07-28T00:00:00Z"
  )
];
