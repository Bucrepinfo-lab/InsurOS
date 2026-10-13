import type { EntityId, IsoDateTime } from "./base";
import type { InsuranceLine } from "./tax";

export type FnolChannel = "Web" | "Mobile" | "USSD" | "Agent" | "API";

export type FnolStatus = "Received" | "Scored" | "Adjudicated";

export interface FnolSubmission {
  id: EntityId;
  claimReference: string;
  policyReference: string;
  insuranceLine: InsuranceLine;
  channel: FnolChannel;
  description: string;
  incidentAt: IsoDateTime;
  reportedAt: IsoDateTime;
  amountClaimed: number;
  currency: string;
  documentsComplete: boolean;
  /** Days between policy inception and incident. */
  policyAgeDays: number;
  priorClaimsCount: number;
  status: FnolStatus;
}

export interface FraudSignal {
  code: string;
  description: string;
  weight: number;
}

export type FraudBand = "Low" | "Medium" | "High";

export interface FraudAssessment {
  claimReference: string;
  score: number;
  band: FraudBand;
  signals: FraudSignal[];
  assessedAt: IsoDateTime;
}

export interface AdjudicationRule {
  id: EntityId;
  name: string;
  insuranceLine: InsuranceLine | "All";
  /** Auto-approve only at or below this amount. */
  maxAutoApproveAmount: number;
  /** Auto-approve only at or below this fraud score. */
  maxFraudScore: number;
  requiresCompleteDocuments: boolean;
  /** Target SLA for payout once approved, in hours. */
  payoutSlaHours: number;
  active: boolean;
}

export type AdjudicationOutcome = "AutoApproved" | "ManualReview" | "AutoRejected";

export interface AdjudicationDecision {
  id: EntityId;
  claimReference: string;
  outcome: AdjudicationOutcome;
  ruleId?: EntityId;
  fraudScore: number;
  reasons: string[];
  decidedAt: IsoDateTime;
  slaHours?: number;
}

/**
 * Deterministic fraud scoring: sum of triggered signal weights, capped at
 * 100. Signals trigger from simple, explainable heuristics — reporting
 * lag, young policy, prior claims, missing documents, round amounts.
 */
export function assessFraud(fnol: FnolSubmission): FraudAssessment {
  const signals: FraudSignal[] = [];

  const reportingLagDays =
    (new Date(fnol.reportedAt).getTime() - new Date(fnol.incidentAt).getTime()) /
    86_400_000;

  if (reportingLagDays > 14) {
    signals.push({
      code: "LATE_REPORTING",
      description: "Incident reported more than 14 days after occurrence.",
      weight: 20
    });
  }

  if (fnol.policyAgeDays < 30) {
    signals.push({
      code: "YOUNG_POLICY",
      description: "Claim within 30 days of policy inception.",
      weight: 25
    });
  }

  if (fnol.priorClaimsCount >= 3) {
    signals.push({
      code: "FREQUENT_CLAIMANT",
      description: "Three or more prior claims on record.",
      weight: 20
    });
  }

  if (!fnol.documentsComplete) {
    signals.push({
      code: "INCOMPLETE_DOCUMENTS",
      description: "Supporting documents incomplete at submission.",
      weight: 15
    });
  }

  if (fnol.amountClaimed >= 1000 && fnol.amountClaimed % 1000 === 0) {
    signals.push({
      code: "ROUND_AMOUNT",
      description: "Claimed amount is a suspiciously round figure.",
      weight: 10
    });
  }

  const score = Math.min(
    100,
    signals.reduce((sum, signal) => sum + signal.weight, 0)
  );

  const band: FraudBand = score >= 50 ? "High" : score >= 25 ? "Medium" : "Low";

  return {
    claimReference: fnol.claimReference,
    score,
    band,
    signals,
    assessedAt: new Date().toISOString()
  };
}

/**
 * Straight-through adjudication: the first matching active rule
 * auto-approves; high fraud scores route to manual review, never silent
 * rejection — a human always owns a denial.
 */
export function adjudicate(
  fnol: FnolSubmission,
  assessment: FraudAssessment,
  rules: AdjudicationRule[]
): Omit<AdjudicationDecision, "id"> {
  const reasons: string[] = [];

  const candidateRules = rules.filter(
    (rule) =>
      rule.active &&
      (rule.insuranceLine === "All" || rule.insuranceLine === fnol.insuranceLine)
  );

  for (const rule of candidateRules) {
    if (fnol.amountClaimed > rule.maxAutoApproveAmount) {
      continue;
    }

    if (assessment.score > rule.maxFraudScore) {
      continue;
    }

    if (rule.requiresCompleteDocuments && !fnol.documentsComplete) {
      continue;
    }

    return {
      claimReference: fnol.claimReference,
      outcome: "AutoApproved",
      ruleId: rule.id,
      fraudScore: assessment.score,
      reasons: [
        `Matched rule "${rule.name}": amount within limit, fraud score ${assessment.score} (${assessment.band}).`
      ],
      decidedAt: new Date().toISOString(),
      slaHours: rule.payoutSlaHours
    };
  }

  if (assessment.band === "High") {
    reasons.push(
      `Fraud score ${assessment.score} (High): ${assessment.signals
        .map((signal) => signal.code)
        .join(", ")}.`
    );
  } else {
    reasons.push("No auto-approval rule matched; routed to adjuster queue.");
  }

  return {
    claimReference: fnol.claimReference,
    outcome: "ManualReview",
    fraudScore: assessment.score,
    reasons,
    decidedAt: new Date().toISOString()
  };
}
