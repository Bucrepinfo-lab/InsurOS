import type { CustomerWorkflow } from "@insuros/domain";

export const mockCustomerWorkflows: CustomerWorkflow[] = [
  {
    customerId: "CUS-2026-0001",
    stage: "Lead",
    workflowStatus: "Submitted"
  },
  {
    customerId: "CUS-2026-0002",
    stage: "KYC Review",
    workflowStatus: "In Review"
  },
  {
    customerId: "CUS-2026-0003",
    stage: "Policy Activation",
    workflowStatus: "Approved"
  }
];
