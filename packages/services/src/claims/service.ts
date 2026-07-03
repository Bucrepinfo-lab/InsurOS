import { mockClaimWorkflows, mockClaims } from "@insuros/mocks";

export class ClaimService {
  async getClaims() {
    return mockClaims;
  }

  async getClaim(id: string) {
    return mockClaims.find((claim) => claim.id === id);
  }

  async getClaimWorkflows() {
    return mockClaimWorkflows;
  }

  async getClaimWorkflow(claimId: string) {
    return mockClaimWorkflows.find((workflow) => workflow.claimId === claimId);
  }
}
