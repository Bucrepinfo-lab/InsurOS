import { mockPolicies, mockPolicyWorkflows } from "@insuros/mocks";

export class PolicyService {
  async getPolicies() {
    return mockPolicies;
  }

  async getPolicy(id: string) {
    return mockPolicies.find((policy) => policy.id === id);
  }

  async getPolicyWorkflows() {
    return mockPolicyWorkflows;
  }

  async getPolicyWorkflow(policyId: string) {
    return mockPolicyWorkflows.find((workflow) => workflow.policyId === policyId);
  }
}
