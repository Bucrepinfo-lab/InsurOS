import type { ClaimWorkflow } from "@insuros/domain";
import { sampleClaimWorkflows } from './sample-book';

export const mockClaimWorkflows: ClaimWorkflow[] = [
  {
    claimId: "CLM-2026-0001",
    stage: "FNOL",
    workflowStatus: "Submitted"
  },
  {
    claimId: "CLM-2026-0002",
    stage: "Assessment",
    workflowStatus: "In Review"
  },
  {
    claimId: "CLM-2026-0003",
    stage: "Settlement",
    workflowStatus: "Approved"
  },
  // Worked examples for every kind of cover (sample-book.ts).
  ...sampleClaimWorkflows
];
