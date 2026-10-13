import type { MarketplaceWorkflow } from "@insuros/domain";

export const mockMarketplaceWorkflows: MarketplaceWorkflow[] = [
  {
    productId: "PRD-2026-0001",
    stage: "Draft",
    workflowStatus: "Submitted"
  },
  {
    productId: "PRD-2026-0002",
    stage: "Product Review",
    workflowStatus: "In Review"
  },
  {
    productId: "PRD-2026-0003",
    stage: "Publishing Approval",
    workflowStatus: "Approved"
  }
];
