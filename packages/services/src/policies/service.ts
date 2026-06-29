import { mockPolicies } from "@insuros/mocks";

export class PolicyService {
  async getPolicies() {
    return mockPolicies;
  }

  async getPolicy(id: string) {
    return mockPolicies.find((policy) => policy.id === id);
  }
}
