import { mockPolicyWorkflows } from "@insuros/mocks";
import {
  canSeePolicy,
  claimablePolicyOptions,
  type OwnedPolicy,
  type PolicyOption,
  type RecordReach
} from "@insuros/domain";
import { getPersistence } from "../persistence";

export class PolicyService {
  /** Durable when DATABASE_URL is set (tenant-scoped). */
  async getPolicies() {
    return getPersistence().policies.findAll();
  }

  async getPolicy(id: string) {
    return getPersistence().policies.findById(id);
  }

  /** Policies this user may see (record-level least privilege; see record-scope.ts). */
  async getPoliciesFor(reach: RecordReach): Promise<OwnedPolicy[]> {
    if (reach.kind === "none") return [];
    const policies = (await getPersistence().policies.findAll()) as OwnedPolicy[];
    return policies.filter((policy) => canSeePolicy(reach, policy));
  }

  /** One policy, or undefined when it does not exist OR the user may not see it. */
  async getPolicyFor(reach: RecordReach, id: string): Promise<OwnedPolicy | undefined> {
    if (reach.kind === "none") return undefined;
    const policy = (await getPersistence().policies.findById(id)) as OwnedPolicy | undefined;
    return policy && canSeePolicy(reach, policy) ? policy : undefined;
  }

  /** Picker options for a claim/endorsement form: visible, in force, unique. */
  async getClaimablePolicyOptions(reach: RecordReach, filter: { customer?: string } = {}): Promise<PolicyOption[]> {
    if (reach.kind === "none") return [];
    const policies = (await getPersistence().policies.findAll()) as OwnedPolicy[];
    return claimablePolicyOptions(policies, reach, filter);
  }

  async getPolicyWorkflows() {
    return mockPolicyWorkflows;
  }

  async getPolicyWorkflow(policyId: string) {
    return mockPolicyWorkflows.find((workflow) => workflow.policyId === policyId);
  }
}
