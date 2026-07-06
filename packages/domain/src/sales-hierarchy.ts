import type { EntityId, IsoDateTime } from "./base";
import type { AdminLevel } from "./admin-hierarchy";

/**
 * Sales ranks mirror the administrative hierarchy. A superior rank names
 * and assigns subordinates one level below.
 */
export type SalesRank =
  | "Global Sales Head"
  | "Continental Director"
  | "National Manager"
  | "County Manager"
  | "Constituency Agent";

export const SALES_RANK_ORDER: Record<SalesRank, number> = {
  "Global Sales Head": 5,
  "Continental Director": 4,
  "National Manager": 3,
  "County Manager": 2,
  "Constituency Agent": 1
};

export const SALES_RANK_ADMIN_LEVEL: Record<SalesRank, AdminLevel> = {
  "Global Sales Head": "SuperAdmin",
  "Continental Director": "Continental",
  "National Manager": "National",
  "County Manager": "County",
  "Constituency Agent": "Constituency"
};

export type SalesAgentStatus = "Active" | "Onboarding" | "Suspended";

export interface SalesAgent {
  id: EntityId;
  name: string;
  email: string;
  rank: SalesRank;
  regionId: EntityId;
  supervisorId?: EntityId;
  status: SalesAgentStatus;
  joinedAt: IsoDateTime;
}

export type SalesAssignmentStatus = "Assigned" | "Accepted" | "Completed" | "Revoked";

export interface SalesAssignment {
  id: EntityId;
  agentId: EntityId;
  assignedBy: EntityId;
  regionId: EntityId;
  /** Target gross written premium for the period, in tenant currency. */
  targetPremium: number;
  currency: string;
  period: string;
  assignedAt: IsoDateTime;
  status: SalesAssignmentStatus;
  notes?: string;
}

/** A superior may name/assign only agents of strictly lower rank. */
export function canAssignSales(superior: SalesRank, subordinate: SalesRank): boolean {
  return SALES_RANK_ORDER[superior] > SALES_RANK_ORDER[subordinate];
}
