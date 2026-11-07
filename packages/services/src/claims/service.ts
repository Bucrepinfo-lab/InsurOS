import { mockClaimWorkflows } from "@insuros/mocks";
import {
  canSeeClaim,
  canSeePolicy,
  isPolicyInForce,
  ownPolicyNumbers,
  type OwnedClaim,
  type OwnedPolicy,
  type RecordReach
} from "@insuros/domain";
import { getPersistence } from "../persistence";

export interface RegisterClaimInput {
  /** The user's reach over claims (who may see the new claim). */
  claimsReach: RecordReach;
  /** The user's reach over policies (which policies they may claim against). */
  policiesReach: RecordReach;
  /** Staff user id of the person registering. */
  registeredByUserId: string;
  /** The policy picked on the form — re-checked here, never trusted. */
  policyId: string;
  /** Template for the remaining claim fields (amount, number, status). */
  template: OwnedClaim;
}

export type RegisterClaimResult = { ok: true; claim: OwnedClaim } | { ok: false; error: string };

export class ClaimService {
  /** Durable when DATABASE_URL is set (tenant-scoped). */
  async getClaims() {
    return getPersistence().claims.findAll();
  }

  async getClaim(id: string) {
    return getPersistence().claims.findById(id);
  }

  private async visibility(reach: RecordReach) {
    const policies = (await getPersistence().policies.findAll()) as OwnedPolicy[];
    return ownPolicyNumbers(reach, policies);
  }

  /**
   * Claims this user may see: Claims Manager / admin all; a Claims Officer the
   * claims assigned to (or registered by) them; an Agent the claims they
   * registered or that sit on their own policies.
   */
  async getClaimsFor(reach: RecordReach): Promise<OwnedClaim[]> {
    if (reach.kind === "none") return [];
    const own = await this.visibility(reach);
    const claims = (await getPersistence().claims.findAll()) as OwnedClaim[];
    return claims.filter((claim) => canSeeClaim(reach, claim, own));
  }

  /** One claim, or undefined when it does not exist OR the user may not see it. */
  async getClaimFor(reach: RecordReach, id: string): Promise<OwnedClaim | undefined> {
    if (reach.kind === "none") return undefined;
    const claim = (await getPersistence().claims.findById(id)) as OwnedClaim | undefined;
    if (!claim) return undefined;
    return canSeeClaim(reach, claim, await this.visibility(reach)) ? claim : undefined;
  }

  /**
   * Register a claim (first notice) against a policy the user picked. The
   * server re-checks the pick: the policy must exist in this tenant, be one the
   * user may see, and be in force. No money moves here.
   */
  async registerClaim(input: RegisterClaimInput): Promise<RegisterClaimResult> {
    if (input.claimsReach.kind === "none") return { ok: false, error: "Your role cannot register claims." };
    const policy = (await getPersistence().policies.findById(input.policyId)) as OwnedPolicy | undefined;
    if (!policy || !canSeePolicy(input.policiesReach, policy)) {
      return { ok: false, error: "That policy is not one of yours." };
    }
    if (!isPolicyInForce(policy)) {
      return { ok: false, error: `Policy ${policy.policyNumber} is ${policy.status.toLowerCase()} — a claim needs a policy in force.` };
    }
    const suffix = `d${Date.now() % 1_000_000}`;
    const baseId = input.template.id.split("-d")[0];
    const claim = await getPersistence().claims.insert({
      ...input.template,
      id: `${baseId}-${suffix}`,
      claimNumber: `${input.template.claimNumber.split("-d")[0]}-${suffix}`,
      policyNumber: policy.policyNumber,
      customer: policy.customer,
      status: "Open",
      registeredByUserId: input.registeredByUserId,
      assignedToUserId: undefined
    } as OwnedClaim);
    return { ok: true, claim };
  }

  async getClaimWorkflows() {
    return mockClaimWorkflows;
  }

  async getClaimWorkflow(claimId: string) {
    return mockClaimWorkflows.find((workflow) => workflow.claimId === claimId);
  }
}
