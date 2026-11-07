import type { AdminAppointment, ClerkSyncAction, SessionPrincipal } from "@insuros/domain";
import {
  ALL_PERMISSION_KEYS,
  CLERK_ORG_ROLE_BY_LEVEL,
  findStaffRole,
  rolePermissionKeys,
  toE164
} from "@insuros/domain";
import { getPersistence } from "./persistence";
import { JurisdictionAuthorizationService } from "./jurisdiction-authorization";

const authorizationService = new JurisdictionAuthorizationService();

export interface SessionIdentity {
  /** Auth provider user id (Supabase). */
  userId?: string;
  /** Verified login phone, any format — normalised to E.164. */
  phone?: string | null;
  email?: string | null;
  displayName?: string;
}

export interface GrantStaffAccessInput {
  phone: string;
  name: string;
  roleId: string;
  regionId: string;
  grantedBy: string;
}

export type GrantStaffAccessResult =
  | { ok: true; appointment: AdminAppointment }
  | { ok: false; error: string };

export class PrincipalService {
  private get db() {
    return getPersistence();
  }

  /**
   * Resolve a signed-in session to a least-privilege principal.
   *
   * - Phone on the platform-owner allowlist -> platform owner (all permissions).
   * - Active appointment (matched by phone, then email) with active role
   *   assignments -> exactly the permissions of those roles.
   * - Anything else -> unmapped (access pending), with NO permissions.
   */
  async resolveForSession(
    identity: SessionIdentity,
    platformOwnerPhones: readonly string[] = []
  ): Promise<SessionPrincipal> {
    const phone = identity.phone ? toE164(identity.phone) ?? undefined : undefined;
    const email = identity.email ?? (phone ? `${phone}@phone.insuros` : "unknown@insuros.local");

    if (phone && platformOwnerPhones.includes(phone)) {
      return {
        clerkUserId: identity.userId,
        email,
        phone,
        name: identity.displayName ?? "Platform owner",
        assignments: [],
        permissions: [...ALL_PERMISSION_KEYS],
        accessibleRegionIds: (await this.db.regions.findAll()).map((region) => region.id),
        isUnmapped: false,
        isPlatformOwner: true
      };
    }

    const appointments = await this.db.appointments.findWhere(
      (item) =>
        item.status !== "Revoked" &&
        ((phone !== undefined && item.phone === phone) ||
          (identity.email ? item.email.toLowerCase() === identity.email.toLowerCase() : false))
    );
    const appointment = appointments[0];

    const unmapped: SessionPrincipal = {
      clerkUserId: identity.userId,
      email,
      phone,
      name: identity.displayName ?? phone ?? email,
      assignments: [],
      permissions: [],
      accessibleRegionIds: [],
      isUnmapped: true
    };

    if (!appointment) return unmapped;

    const assignments = await this.db.jurisdictionAssignments.findWhere(
      (assignment) => assignment.userId === appointment.userId && assignment.status === "Active"
    );

    const permissions = Array.from(
      new Set(
        assignments.flatMap((assignment) => {
          const role = findStaffRole(assignment.roleId);
          return role ? rolePermissionKeys(role) : [];
        })
      )
    );

    if (permissions.length === 0) {
      return { ...unmapped, name: appointment.userName };
    }

    const accessibleRegions = await authorizationService.getAccessibleRegions(appointment.userId);

    return {
      clerkUserId: identity.userId,
      email,
      phone,
      name: appointment.userName,
      assignments,
      permissions,
      accessibleRegionIds: accessibleRegions.map((region) => region.id),
      isUnmapped: false
    };
  }

  /**
   * Grant a staff member access by login phone: one appointment + one active
   * role assignment in a region. Callers must already hold Identity:Create.
   */
  async grantStaffAccess(input: GrantStaffAccessInput): Promise<GrantStaffAccessResult> {
    const phone = toE164(input.phone);
    if (!phone) return { ok: false, error: "Enter a valid phone number, e.g. 0712 345 678." };
    const name = input.name.trim();
    if (name.length < 2 || name.length > 120) return { ok: false, error: "Enter the staff member's name." };
    const role = findStaffRole(input.roleId);
    if (!role) return { ok: false, error: "Unknown role." };
    const region = await this.db.regions.findById(input.regionId);
    if (!region) return { ok: false, error: "Unknown region." };

    const now = new Date().toISOString();
    const [existing] = await this.db.appointments.findWhere(
      (item) => item.phone === phone && item.status !== "Revoked"
    );
    const userId = existing?.userId ?? `staff-${phone.replace(/\D/g, "")}`;

    const appointment =
      existing ??
      (await this.db.appointments.insert({
        id: `appointment-${userId}-${Date.now()}`,
        userId,
        userName: name,
        email: `${phone}@phone.insuros`,
        phone,
        regionId: region.id,
        level: region.level,
        roleId: role.id,
        appointedBy: input.grantedBy,
        appointedAt: now,
        status: "Active"
      }));

    await this.db.jurisdictionAssignments.insert({
      id: `jgrant-${userId}-${Date.now()}`,
      userId,
      userName: name,
      roleId: role.id,
      regionId: region.id,
      assignedBy: input.grantedBy,
      assignedAt: now,
      status: "Active"
    });

    return { ok: true, appointment };
  }

  /** Revoke every active assignment for a login phone (access removed at once). */
  async revokeStaffAccess(phoneInput: string): Promise<number> {
    const phone = toE164(phoneInput);
    if (!phone) return 0;
    const appointments = await this.db.appointments.findWhere((item) => item.phone === phone);
    let revoked = 0;
    for (const appointment of appointments) {
      await this.db.appointments.update(appointment.id, { status: "Revoked" });
      const grants = await this.db.jurisdictionAssignments.findWhere(
        (item) => item.userId === appointment.userId && item.status === "Active"
      );
      for (const grant of grants) {
        await this.db.jurisdictionAssignments.update(grant.id, { status: "Revoked" });
        revoked += 1;
      }
    }
    return revoked;
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
          const role = findStaffRole(assignment.roleId);
          return role ? rolePermissionKeys(role) : [];
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
