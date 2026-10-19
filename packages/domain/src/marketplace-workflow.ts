import type { WorkflowStatus } from "./workflow-status";

export type MarketplaceWorkflowStage =
  | "Draft"
  | "Product Review"
  | "Pricing Review"
  | "Publishing Approval"
  | "Published"
  | "Retired";

export interface MarketplaceWorkflow {
  productId: string;
  stage: MarketplaceWorkflowStage;
  workflowStatus: WorkflowStatus;
}
