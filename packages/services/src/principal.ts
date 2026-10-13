import type { ClerkSyncAction, SessionPrincipal } from "@insuros/domain";
import { CLERK_ORG_ROLE_BY_LEVEL } from "@insuros/domain";
import { mockRoles } from "@insuros/mocks";
import { getPersistence } from "./persistence";
import { JurisdictionAuthorizationService } from "./jurisdiction-authorization";

const authorizationService = new JurisdictionAuthorizationService();

export class PrincipalService {
  private get db() {
    return getPersistence();
  }

  /**
   * Resolve a signed-in Clerk user (by email) to a SessionPrincipal with
   * jurisdiction assignments, effective permissions, and territory.
   * Unmatched users get an empty, clearly-flagged principal.
   */
  async resolveByEmail(
    email: string,
    clerkUserId?: string,
    displayName?: string
  ): Promise<SessionPrincipal> {
    const [appointment] = await this.db.appointments.findWhere(
      (item) => item.email.toLowerCase() === email.toLowerCase()
    );

    if (!appointment) {
      return {
        clerkUserId,
        email,
        name: displayName ?? email,
        assignments: [],
        permissions: [],
        accessibleRegionIds: [],
        isUnmapped: true
      };
    }

    const assignments = await this.db.jurisdictionAssignments.findWhere(
      (assignment) =>
        assignment.userId === appointment.userId &&
        assignment.status === "Active"
    );

    const permissions = Array.from(
      new Set(
        assignments.flatMap((assignment) => {
          // Roles remain mock-backed until a roles port lands.
          const role = mockRoles.find((item) => item.id === assignment.roleId);
          return (role?.permissions ?? []).map(
            (permission) => `${permission.scope}:${permission.action}`
          );
        })
      )
    );

    const accessibleRegions = await authorizationService.getAccessibleRegions(
      appointment.userId
    );

    return {
      clerkUserId,
      email,
      name: displayName ?? appointment.userName,
      assignments,
      permissions,
      accessibleRegionIds: accessibleRegions.map((region) => region.id),
      isUnmapped: false
    };
  }

  /**
   * The plan for syncing platform grants into Clerk organization
   * memberships: one CreateMembership per active assignment, one
   * SuspendMembership per suspended assignment. In production each action
   * maps to a `clerkClient.organizations.*` call.
   */
  async getClerkSyncPlan(): Promise<ClerkSyncAction[]> {
    const assignments = await this.db.jurisdictionAssignments.findWhere(
      (assignment) => assignment.status !== "Revoked"
    );

    const plan: ClerkSyncAction[] = [];

    for (const assignment of assignments) {
      const [appointment] = await this.db.appointments.findWhere(
        (item) => item.userId === assignment.userId
      );
      const region = await this.db.regions.findById(assignment.regionId);

      plan.push({
        email: appointment?.email ?? `${assignment.userId}@unknown`,
        userName: assignment.userName,
        clerkOrgRole: region
          ? CLERK_ORG_ROLE_BY_LEVEL[region.level]
          : "org:member",
        regionCode: region?.code ?? assignment.regionId,
        regionName: region?.name ?? assignment.regionId,
        assignmentId: assignment.id,
        operation:
          assignment.status === "Active"
            ? ("CreateMembership" as const)
            : ("SuspendMembership" as const)
      });
    }

    return plan;
  }
}
