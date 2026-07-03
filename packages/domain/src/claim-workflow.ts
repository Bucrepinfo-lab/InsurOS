import type { WorkflowStatus } from "./workflow-status";

export type ClaimWorkflowStage =
  | "FNOL"
  | "Assessment"
  | "Investigation"
  | "Settlement"
  | "Closed";

export interface ClaimWorkflow {
  claimId: string;
  stage: ClaimWorkflowStage;
  workflowStatus: WorkflowStatus;
}
