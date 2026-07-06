import type {
  AdminRegion,
  JurisdictionAssignment,
  ScopedAccessDecision,
  ScopedAccessRequest
} from "@insuros/domain";
import { isWithinJurisdiction } from "@insuros/domain";
import {
  mockAdminRegions,
  mockJurisdictionAssignments,
  mockRoles
} from "@insuros/mocks";

export class JurisdictionAuthorizationService {
  async getAssignments(): Promise<JurisdictionAssignment[]> {
    return mockJurisdictionAssignments;
  }

  /**
   * Decide a scoped access request. Allowed only when the user holds an
   * active assignment whose role carries the scope+action AND whose region
   * covers the target region (self or descendant).
   */
  async authorize(request: ScopedAccessRequest): Promise<ScopedAccessDecision> {
    const assignments = mockJurisdictionAssignments.filter(
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

    for (const assignment of assignments) {
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
        isWithinJurisdiction(
          assignment.regionId,
          request.targetRegionId,
          mockAdminRegions
        )
      ) {
        return {
          allowed: true,
          reason: `Granted via ${role?.name ?? assignment.roleId} scoped to ${this.regionName(assignment.regionId)}.`,
          matchedAssignmentId: assignment.id
        };
      }
    }

    return {
      allowed: false,
      reason: `Target region ${this.regionName(request.targetRegionId)} is outside the user's jurisdiction, or the role lacks ${request.scope}:${request.action}.`
    };
  }

  /** All regions the user can act in (their grants plus every descendant). */
  async getAccessibleRegions(userId: string): Promise<AdminRegion[]> {
    const grants = mockJurisdictionAssignments.filter(
      (assignment) =>
        assignment.userId === userId && assignment.status === "Active"
    );

    return mockAdminRegions.filter((region) =>
      grants.some((grant) =>
        isWithinJurisdiction(grant.regionId, region.id, mockAdminRegions)
      )
    );
  }

  private regionName(regionId: string): string {
    return (
      mockAdminRegions.find((region) => region.id === regionId)?.name ??
      regionId
    );
  }
}
