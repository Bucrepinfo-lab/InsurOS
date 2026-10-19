import type { WorkflowStatus } from "./workflow-status";

export type FinanceWorkflowStage =
  | "Invoice Review"
  | "Payment Matching"
  | "Reconciliation"
  | "Payout Approval"
  | "Closed";

export interface FinanceWorkflow {
  financeId: string;
  stage: FinanceWorkflowStage;
  workflowStatus: WorkflowStatus;
}
