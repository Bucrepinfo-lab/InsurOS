import { hasPermission } from "./access-control";
import type { Claim } from "./claim";
import type { SessionPrincipal } from "./clerk-integration";
import type { Customer } from "./customer";
import type { Policy, PolicyStatus } from "./policy";

/**
 * Record-level least privilege — PURE.
 *
 * The role catalog (access-control.ts) decides WHICH areas a staff member may
 * open. This module decides WHICH RECORDS inside an area they see and may pick
 * in a form, using the existing roles unchanged:
 *
 * - platform owner / Platform Admin keep the overall view;
 * - desk roles see their whole desk (Claims Manager: all claims; Underwriter:
 *   all policies and customers; claims staff and Finance may look up policies);
 * - an Agent sees only the customers and policies they captured, and claims
 *   they registered or that sit on their own policies;
 * - a Claims Officer sees only the claims assigned to them (or that they
 *   registered).
 *
 * Fails closed: no View permission, no active role, or no staff id -> nothing.
 * The same rules filter lists, pickers and server-side checks on writes.
 */

/** Who captured a customer or policy (staff user id, e.g. `staff-254712345678`). */
export interface RecordOwnership {
  ownerUserId?: string;
}

/** Who registered a claim and which claims officer it is assigned to. */
export interface ClaimOwnership {
  registeredByUserId?: string;
  assignedToUserId?: string;
}

export type OwnedPolicy = Policy & RecordOwnership;
export type OwnedCustomer = Customer & RecordOwnership;
export type OwnedClaim = Claim & ClaimOwnership;

export type RecordArea = "Policies" | "Customers" | "Claims";

export type RecordReach =
  | { kind: "none" }
  | { kind: "all" }
  | { kind: "own"; userIds: string[] };

/** Roles that work an area's whole book for their tenant (everyone else: own records only). */
export const TENANT_WIDE_ROLES: Record<RecordArea, readonly string[]> = {
  Policies: [
    "role-platform-admin",
    "role-underwriter",
    "role-claims-manager",
    "role-claims-officer",
    "role-finance-manager"
  ],
  Customers: ["role-platform-admin", "role-underwriter", "role-claims-manager", "role-claims-officer"],
  Claims: ["role-platform-admin", "role-claims-manager"]
};

export const NO_REACH: RecordReach = { kind: "none" };
export const ALL_REACH: RecordReach = { kind: "all" };

/** Staff user ids behind a principal's active role grants. */
export function principalStaffIds(principal: SessionPrincipal): string[] {
  return Array.from(
    new Set(
      principal.assignments
        .filter((assignment) => assignment.status === "Active")
        .map((assignment) => assignment.userId)
        .filter((id) => id.length > 0)
    )
  );
}

/** How far a principal reaches inside one area. */
export function recordReach(principal: SessionPrincipal, area: RecordArea): RecordReach {
  if (principal.isUnmapped || !hasPermission(principal.permissions, area, "View")) return NO_REACH;
  if (principal.isPlatformOwner) return ALL_REACH;
  const active = principal.assignments.filter((assignment) => assignment.status === "Active");
  if (active.some((assignment) => TENANT_WIDE_ROLES[area].includes(assignment.roleId))) return ALL_REACH;
  const userIds = principalStaffIds(principal);
  return userIds.length > 0 ? { kind: "own", userIds } : NO_REACH;
}

function owns(reach: RecordReach, userId: string | undefined): boolean {
  if (reach.kind === "all") return true;
  if (reach.kind === "none" || !userId) return false;
  return reach.userIds.includes(userId);
}

export function canSeePolicy(reach: RecordReach, policy: OwnedPolicy): boolean {
  return owns(reach, policy.ownerUserId);
}

export function canSeeCustomer(reach: RecordReach, customer: OwnedCustomer): boolean {
  return owns(reach, customer.ownerUserId);
}

/**
 * A claim is visible when the reach is tenant-wide, or the claim is assigned to
 * / registered by the user, or it sits on one of the user's own policies
 * (`ownPolicyNumbers`: policies whose ownerUserId is the user — see
 * {@link ownPolicyNumbers}).
 */
export function canSeeClaim(
  reach: RecordReach,
  claim: OwnedClaim,
  ownPolicyNumbersSet: ReadonlySet<string> = new Set()
): boolean {
  if (reach.kind === "all") return true;
  if (reach.kind === "none") return false;
  return (
    owns(reach, claim.assignedToUserId) ||
    owns(reach, claim.registeredByUserId) ||
    ownPolicyNumbersSet.has(claim.policyNumber)
  );
}

/** Policy numbers the user personally owns (never "all", even for tenant-wide roles). */
export function ownPolicyNumbers(reach: RecordReach, policies: readonly OwnedPolicy[]): Set<string> {
  if (reach.kind !== "own") return new Set();
  return new Set(
    policies
      .filter((policy) => policy.ownerUserId !== undefined && reach.userIds.includes(policy.ownerUserId))
      .map((policy) => policy.policyNumber)
  );
}

/** First occurrence wins; keeps input order. Used for every picker's options. */
export function uniqueBy<T>(items: readonly T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const k = key(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

/** Statuses a claim or endorsement may be raised against (not Pending, Expired or Cancelled). */
export const IN_FORCE_POLICY_STATUSES: readonly PolicyStatus[] = ["Active"];

export function isPolicyInForce(policy: Pick<Policy, "status">): boolean {
  return IN_FORCE_POLICY_STATUSES.includes(policy.status);
}

export interface PolicyOption {
  id: string;
  policyNumber: string;
  customer: string;
  label: string;
}

/**
 * Options for a "which policy?" picker on a claim or endorsement form: only
 * policies the user may see, only in force, optionally only one customer's,
 * each policy number once, sorted.
 */
export function claimablePolicyOptions(
  policies: readonly OwnedPolicy[],
  reach: RecordReach,
  filter: { customer?: string } = {}
): PolicyOption[] {
  const customer = filter.customer?.trim().toLowerCase();
  const eligible = policies.filter(
    (policy) =>
      canSeePolicy(reach, policy) &&
      isPolicyInForce(policy) &&
      (!customer || policy.customer.trim().toLowerCase() === customer)
  );
  return uniqueBy(eligible, (policy) => policy.policyNumber)
    .map((policy) => ({
      id: policy.id,
      policyNumber: policy.policyNumber,
      customer: policy.customer,
      label: `${policy.policyNumber} · ${policy.customer} · ${policy.product}`
    }))
    .sort((a, b) => a.policyNumber.localeCompare(b.policyNumber));
}
