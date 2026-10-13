import type { WorkflowStatus } from "./workflow-status";

export type CustomerWorkflowStage =
  | "Lead"
  | "Onboarding"
  | "KYC Review"
  | "Policy Activation"
  | "Servicing"
  | "Retention";

export interface CustomerWorkflow {
  customerId: string;
  stage: CustomerWorkflowStage;
  workflowStatus: WorkflowStatus;
}
