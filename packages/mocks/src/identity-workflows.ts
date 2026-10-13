import type { IdentityWorkflow } from "@insuros/domain";

export const mockIdentityWorkflows: IdentityWorkflow[] = [
  {
    identityId: "IDV-2026-0001",
    stage: "Registration",
    workflowStatus: "Submitted"
  },
  {
    identityId: "IDV-2026-0002",
    stage: "Document Verification",
    workflowStatus: "In Review"
  },
  {
    identityId: "IDV-2026-0003",
    stage: "Verified",
    workflowStatus: "Approved"
  }
];
