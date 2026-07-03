import type { FinanceWorkflow } from "@insuros/domain";

export const mockFinanceWorkflows: FinanceWorkflow[] = [
  {
    financeId: "INV-2026-0001",
    stage: "Invoice Review",
    workflowStatus: "Submitted"
  },
  {
    financeId: "REC-2026-0001",
    stage: "Reconciliation",
    workflowStatus: "In Review"
  },
  {
    financeId: "PAY-2026-0001",
    stage: "Payout Approval",
    workflowStatus: "Approved"
  }
];
