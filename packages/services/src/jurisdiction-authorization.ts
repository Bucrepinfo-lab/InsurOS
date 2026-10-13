import type {
  AdminRegion,
  JurisdictionAssignment,
  ScopedAccessDecision,
  ScopedAccessRequest
} from "@insuros/domain";
import { isWithinJurisdiction } from "@insuros/domain";
import { mockRoles } from "@insuros/mocks";
import { getPersistence } from "./persistence";

export class JurisdictionAuthorizationService {
  private get db() {
    return getPersistence();
  }

  async getAssignments(): Promise<JurisdictionAssignment[]> {
    return this.db.jurisdictionAssignments.findAll();
  }

  /**
   * Decide a scoped access request. Allowed only when the user holds an
   * active assignment whose role carries the scope+action AND whose region
   * covers the target region (self or descendant).
   */
  async authorize(request: ScopedAccessRequest): Promise<ScopedAccessDecision> {
    const assignments = await this.db.jurisdictionAssignments.findWhere(
      (assignment) =>
        assignment.userId === request.userId &&
        assignment.status === "Active"
    );

    if (assignments.length === 0) {
      return {
        allowed: false,
        reason: "No active jurisdiction assignment for user."
      };
    }

    const regions = await this.db.regions.findAll();

    for (const assignment of assignments) {
      // Roles remain mock-backed until a roles port lands with Clerk sync.
      const role = mockRoles.find((item) => item.id === assignment.roleId);

      const hasPermission = role?.permissions.some(
        (permission) =>
          permission.scope === request.scope &&
          permission.action === request.action
      );

      if (!hasPermission) {
        continue;
      }

      if (
        isWithinJurisdiction(assignment.regionId, request.targetRegionId, regions)
      ) {
        return {
          allowed: true,
          reason: `Granted via ${role?.name ?? assignment.roleId} scoped to ${await this.regionName(assignment.regionId)}.`,
          matchedAssignmentId: assignment.id
        };
      }
    }

    return {
      allowed: false,
      reason: `Target region ${await this.regionName(request.targetRegionId)} is outside the user's jurisdiction, or the role lacks ${request.scope}:${request.action}.`
    };
  }

  /** All regions the user can act in (their grants plus every descendant). */
  async getAccessibleRegions(userId: string): Promise<AdminRegion[]> {
    const grants = await this.db.jurisdictionAssignments.findWhere(
      (assignment) =>
        assignment.userId === userId && assignment.status === "Active"
    );

    const regions = await this.db.regions.findAll();

    return regions.filter((region) =>
      grants.some((grant) =>
        isWithinJurisdiction(grant.regionId, region.id, regions)
      )
    );
  }

  private async regionName(regionId: string): Promise<string> {
    const region = await this.db.regions.findById(regionId);
    return region?.name ?? regionId;
  }
}
