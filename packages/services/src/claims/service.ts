import { mockClaims } from "@insuros/mocks";

export class ClaimService {
  async getClaims() {
    return mockClaims;
  }

  async getClaim(id: string) {
    return mockClaims.find((claim) => claim.id === id);
  }
}
