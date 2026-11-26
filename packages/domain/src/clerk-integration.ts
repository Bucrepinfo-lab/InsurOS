import type { JurisdictionAssignment } from "./jurisdiction-access";

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
