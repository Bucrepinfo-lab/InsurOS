import { mockPolicyWorkflows } from "@insuros/mocks";
import { getPersistence } from "../persistence";

export class PolicyService {
  /** Durable when DATABASE_URL is set (tenant-scoped). */
  async getPolicies() {
    return getPersistence().policies.findAll();
  }

  async getPolicy(id: string) {
    return getPersistence().policies.findById(id);
  }

  async getPolicyWorkflows() {
    return mockPolicyWorkflows;
  }

  async getPolicyWorkflow(policyId: string) {
    return mockPolicyWorkflows.find((workflow) => workflow.policyId === policyId);
  }
}
