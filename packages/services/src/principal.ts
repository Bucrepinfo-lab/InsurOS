import type { ClerkSyncAction, SessionPrincipal } from "@insuros/domain";
import { CLERK_ORG_ROLE_BY_LEVEL } from "@insuros/domain";
import {
  mockAdminAppointments,
  mockAdminRegions,
  mockJurisdictionAssignments,
  mockRoles
} from "@insuros/mocks";
import { JurisdictionAuthorizationService } from "./jurisdiction-authorization";

const authorizationService = new JurisdictionAuthorizationService();

export class PrincipalService {
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
    const appointment = mockAdminAppointments.find(
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

    const assignments = mockJurisdictionAssignments.filter(
      (assignment) =>
        assignment.userId === appointment.userId &&
        assignment.status === "Active"
    );

    const permissions = Array.from(
      new Set(
        assignments.flatMap((assignment) => {
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
    return mockJurisdictionAssignments
      .filter((assignment) => assignment.status !== "Revoked")
      .map((assignment) => {
        const appointment = mockAdminAppointments.find(
          (item) => item.userId === assignment.userId
        );
        const region = mockAdminRegions.find(
          (item) => item.id === assignment.regionId
        );

        return {
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
        };
      });
  }
}
