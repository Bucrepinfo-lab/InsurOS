import type { EntityId, IsoDateTime } from "./base";
import type { SalesRank } from "./sales-hierarchy";
import type { InsuranceLine } from "./tax";

/**
 * Commission schedule: the rate an agent of a given rank earns on gross
 * written premium for an insurance line. Override rates reward superiors
 * on business written by their downline.
 */
export interface CommissionSchedule {
  id: EntityId;
  name: string;
  rank: SalesRank;
  insuranceLine: InsuranceLine | "All";
  /** Percentage of gross premium earned on own production. */
  directRatePercent: number;
  /** Percentage of gross premium earned on direct reports' production. */
  overrideRatePercent: number;
  effectiveFrom: IsoDateTime;
  status: "Active" | "Superseded";
}

export type CommissionAccrualStatus =
  | "Accrued"
  | "Approved"
  | "Paid"
  | "ClawedBack";

export type CommissionKind = "Direct" | "Override";

export interface CommissionAccrual {
  id: EntityId;
  agentId: EntityId;
  /** Agent whose production generated the commission (self for Direct). */
  sourceAgentId: EntityId;
  scheduleId: EntityId;
  kind: CommissionKind;
  policyReference: string;
  insuranceLine: InsuranceLine;
  grossPremium: number;
  ratePercent: number;
  amount: number;
  currency: string;
  period: string;
  accruedAt: IsoDateTime;
  status: CommissionAccrualStatus;
  /** Populated when status is ClawedBack. */
  clawbackReason?: string;
}

export interface CommissionStatement {
  agentId: EntityId;
  period: string;
  currency: string;
  directTotal: number;
  overrideTotal: number;
  clawbackTotal: number;
  netPayable: number;
  accrualIds: EntityId[];
}

export function computeCommissionAmount(
  grossPremium: number,
  ratePercent: number
): number {
  return Math.round(grossPremium * ratePercent) / 100;
}

/** Build a statement from an agent's accruals for one period. */
export function buildStatement(
  agentId: EntityId,
  period: string,
  accruals: CommissionAccrual[]
): CommissionStatement {
  const own = accruals.filter(
    (accrual) => accrual.agentId === agentId && accrual.period === period
  );

  const directTotal = own
    .filter((a) => a.kind === "Direct" && a.status !== "ClawedBack")
    .reduce((sum, a) => sum + a.amount, 0);

  const overrideTotal = own
    .filter((a) => a.kind === "Override" && a.status !== "ClawedBack")
    .reduce((sum, a) => sum + a.amount, 0);

  const clawbackTotal = own
    .filter((a) => a.status === "ClawedBack")
    .reduce((sum, a) => sum + a.amount, 0);

  return {
    agentId,
    period,
    currency: own[0]?.currency ?? "USD",
    directTotal: round2(directTotal),
    overrideTotal: round2(overrideTotal),
    clawbackTotal: round2(clawbackTotal),
    netPayable: round2(directTotal + overrideTotal - clawbackTotal),
    accrualIds: own.map((a) => a.id)
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
