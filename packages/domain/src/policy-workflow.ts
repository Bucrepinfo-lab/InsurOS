import type { WorkflowStatus } from "./workflow-status";

export type PolicyWorkflowStage =
  | "Application"
  | "Underwriting"
  | "Issuance"
  | "Endorsement"
  | "Renewal"
  | "Cancellation";

export interface PolicyWorkflow {
  policyId: string;
  stage: PolicyWorkflowStage;
  workflowStatus: WorkflowStatus;
}
