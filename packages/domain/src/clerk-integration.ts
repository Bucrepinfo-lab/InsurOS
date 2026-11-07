import type { AdminLevel } from "./admin-hierarchy";
import type { JurisdictionAssignment } from "./jurisdiction-access";

/**
 * Clerk organization role key for each administrative level. In production
 * these are created once in the Clerk dashboard and assigned via
 * `clerkClient.organizations.createOrganizationMembership`.
 */
export const CLERK_ORG_ROLE_BY_LEVEL: Record<AdminLevel, string> = {
  SuperAdmin: "org:super_admin",
  Continental: "org:continental_admin",
  National: "org:national_admin",
  County: "org:county_admin",
  Constituency: "org:constituency_admin"
};

/**
 * The resolved identity of a signed-in user: Clerk identity joined to the
 * platform's jurisdiction assignments and effective permissions.
 */
export interface SessionPrincipal {
  clerkUserId?: string;
  email: string;
  name: string;
  assignments: JurisdictionAssignment[];
  /** Effective permission keys, e.g. "Finance:Approve". */
  permissions: string[];
  /** Region ids the principal may act in (grants + descendants). */
  accessibleRegionIds: string[];
  /** True when the user matched no active appointment/role (access pending). */
  isUnmapped: boolean;
  /** Verified login phone (E.164), when signed in by phone OTP. */
  phone?: string;
  /** Platform owner bootstrapped from the PLATFORM_OWNER_PHONES allowlist. */
  isPlatformOwner?: boolean;
}

/** One row of the plan for syncing platform grants into Clerk. */
export interface ClerkSyncAction {
  email: string;
  userName: string;
  clerkOrgRole: string;
  regionCode: string;
  regionName: string;
  assignmentId: string;
  operation: "CreateMembership" | "SuspendMembership";
}
