import type { EntityId, IsoDateTime } from "./base";
import type { AdminRegion } from "./admin-hierarchy";
import type { PermissionAction, PermissionScope } from "./permission";

/**
 * A role assignment bound to a jurisdiction. The holder exercises the
 * role's permissions only within the assigned region and its descendants.
 */
export interface JurisdictionAssignment {
  id: EntityId;
  userId: string;
  userName: string;
  roleId: string;
  regionId: EntityId;
  assignedBy: string;
  assignedAt: IsoDateTime;
  status: "Active" | "Suspended" | "Revoked";
}

export interface ScopedAccessRequest {
  userId: string;
  scope: PermissionScope;
  action: PermissionAction;
  targetRegionId: EntityId;
}

export interface ScopedAccessDecision {
  allowed: boolean;
  reason: string;
  matchedAssignmentId?: EntityId;
}

/**
 * True when `targetRegionId` equals `grantRegionId` or lies anywhere in
 * its descendant chain. A County grant covers its constituencies; a
 * Continental grant covers its nations, counties, and constituencies.
 */
export function isWithinJurisdiction(
  grantRegionId: EntityId,
  targetRegionId: EntityId,
  regions: AdminRegion[]
): boolean {
  let currentId: EntityId | undefined = targetRegionId;

  while (currentId) {
    if (currentId === grantRegionId) {
      return true;
    }

    currentId = regions.find((region) => region.id === currentId)
      ?.parentRegionId;
  }

  return false;
}
