import type { PolicyWorkflow } from "@insuros/domain";

export const mockPolicyWorkflows: PolicyWorkflow[] = [
  {
    policyId: "POL-2026-0001",
    stage: "Application",
    workflowStatus: "Submitted"
  },
  {
    policyId: "POL-2026-0002",
    stage: "Underwriting",
    workflowStatus: "In Review"
  },
  {
    policyId: "POL-2026-0003",
    stage: "Issuance",
    workflowStatus: "Approved"
  }
];
