import { mockClaimWorkflows } from "@insuros/mocks";
import { getPersistence } from "../persistence";

export class ClaimService {
  /** Durable when DATABASE_URL is set (tenant-scoped). */
  async getClaims() {
    return getPersistence().claims.findAll();
  }

  async getClaim(id: string) {
    return getPersistence().claims.findById(id);
  }

  async getClaimWorkflows() {
    return mockClaimWorkflows;
  }

  async getClaimWorkflow(claimId: string) {
    return mockClaimWorkflows.find((workflow) => workflow.claimId === claimId);
  }
}
