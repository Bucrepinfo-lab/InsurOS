import type { AdjudicationDecision, AdjudicationRule, FnolSubmission } from "@insuros/domain";

export const mockAdjudicationRules: AdjudicationRule[] = [
  {
    id: "adj-rule-micro",
    name: "Micro claims fast lane",
    insuranceLine: "All",
    maxAutoApproveAmount: 50_000,
    maxFraudScore: 20,
    requiresCompleteDocuments: true,
    payoutSlaHours: 3,
    active: true
  },
  {
    id: "adj-rule-motor-small",
    name: "Motor small-damage lane",
    insuranceLine: "Motor",
    maxAutoApproveAmount: 250_000,
    maxFraudScore: 15,
    requiresCompleteDocuments: true,
    payoutSlaHours: 24,
    active: true
  },
  {
    id: "adj-rule-health-outpatient",
    name: "Health outpatient lane",
    insuranceLine: "Health",
    maxAutoApproveAmount: 100_000,
    maxFraudScore: 25,
    requiresCompleteDocuments: true,
    payoutSlaHours: 12,
    active: true
  }
];

export const mockFnolSubmissions: FnolSubmission[] = [
  {
    id: "fnol-1",
    claimReference: "CLM-KE-2026-0801",
    policyReference: "POL-KE-2026-00311",
    insuranceLine: "Motor",
    channel: "Mobile",
    description: "Windscreen shattered by road debris on Thika Road.",
    incidentAt: "2026-07-10T07:30:00Z",
    reportedAt: "2026-07-10T08:05:00Z",
    amountClaimed: 38_500,
    currency: "KES",
    documentsComplete: true,
    policyAgeDays: 190,
    priorClaimsCount: 0,
    status: "Adjudicated"
  },
  {
    id: "fnol-2",
    claimReference: "CLM-KE-2026-0802",
    policyReference: "POL-KE-2026-00340",
    insuranceLine: "Health",
    channel: "USSD",
    description: "Outpatient treatment, malaria.",
    incidentAt: "2026-07-12T10:00:00Z",
    reportedAt: "2026-07-12T14:20:00Z",
    amountClaimed: 8_200,
    currency: "KES",
    documentsComplete: true,
    policyAgeDays: 95,
    priorClaimsCount: 1,
    status: "Adjudicated"
  },
  {
    id: "fnol-3",
    claimReference: "CLM-KE-2026-0803",
    policyReference: "POL-KE-2026-00355",
    insuranceLine: "Property",
    channel: "Web",
    description: "Warehouse fire damage, Industrial Area.",
    incidentAt: "2026-06-20T22:00:00Z",
    reportedAt: "2026-07-08T09:00:00Z",
    amountClaimed: 4_000_000,
    currency: "KES",
    documentsComplete: false,
    policyAgeDays: 21,
    priorClaimsCount: 3,
    status: "Adjudicated"
  }
];

export const mockAdjudicationDecisions: AdjudicationDecision[] = [
  {
    id: "adj-dec-1",
    claimReference: "CLM-KE-2026-0801",
    outcome: "AutoApproved",
    ruleId: "adj-rule-micro",
    fraudScore: 0,
    reasons: ['Matched rule "Micro claims fast lane": amount within limit, fraud score 0 (Low).'],
    decidedAt: "2026-07-10T08:05:04Z",
    slaHours: 3
  },
  {
    id: "adj-dec-2",
    claimReference: "CLM-KE-2026-0802",
    outcome: "AutoApproved",
    ruleId: "adj-rule-micro",
    fraudScore: 0,
    reasons: ['Matched rule "Micro claims fast lane": amount within limit, fraud score 0 (Low).'],
    decidedAt: "2026-07-12T14:20:03Z",
    slaHours: 3
  },
  {
    id: "adj-dec-3",
    claimReference: "CLM-KE-2026-0803",
    outcome: "ManualReview",
    fraudScore: 80,
    reasons: ["Fraud score 80 (High): LATE_REPORTING, YOUNG_POLICY, FREQUENT_CLAIMANT, INCOMPLETE_DOCUMENTS."],
    decidedAt: "2026-07-08T09:00:06Z"
  }
];
