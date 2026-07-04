import type { WorkflowStatus } from "./workflow-status";

export type IdentityWorkflowStage =
  | "Registration"
  | "Document Verification"
  | "Biometric Verification"
  | "Compliance Review"
  | "Verified"
  | "Rejected";

export interface IdentityWorkflow {
  identityId: string;
  stage: IdentityWorkflowStage;
  workflowStatus: WorkflowStatus;
}
