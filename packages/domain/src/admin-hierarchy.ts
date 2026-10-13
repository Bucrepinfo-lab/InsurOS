import type { EntityId, IsoDateTime } from "./base";

/**
 * Administrative levels of the InsurOS multi-continental control plane,
 * ordered from lowest (Constituency) to highest (SuperAdmin).
 */
export type AdminLevel =
  | "Constituency"
  | "County"
  | "National"
  | "Continental"
  | "SuperAdmin";

export const ADMIN_LEVEL_RANK: Record<AdminLevel, number> = {
  Constituency: 1,
  County: 2,
  National: 3,
  Continental: 4,
  SuperAdmin: 5
};

export const ADMIN_LEVELS: AdminLevel[] = [
  "Constituency",
  "County",
  "National",
  "Continental",
  "SuperAdmin"
];

export type ContinentCode = "AF" | "EU" | "NA" | "SA" | "AS" | "OC" | "GLOBAL";

export interface AdminRegion {
  id: EntityId;
  name: string;
  /** Short unique code, e.g. "KE", "KE-047", "AF". */
  code: string;
  level: AdminLevel;
  parentRegionId?: EntityId;
  /** ISO 3166-1 alpha-2 country code where applicable. */
  countryCode?: string;
  continentCode: ContinentCode;
  status: "Active" | "Suspended";
}

export type AdminAppointmentStatus = "Active" | "Pending" | "Revoked";

export interface AdminAppointment {
  id: EntityId;
  userId: string;
  userName: string;
  email: string;
  regionId: EntityId;
  level: AdminLevel;
  roleId: string;
  appointedBy: string;
  appointedAt: IsoDateTime;
  status: AdminAppointmentStatus;
}

/**
 * A superior may administer (appoint, suspend, reassign) only admins
 * at a strictly lower level of the hierarchy.
 */
export function canAdminister(superior: AdminLevel, subordinate: AdminLevel): boolean {
  return ADMIN_LEVEL_RANK[superior] > ADMIN_LEVEL_RANK[subordinate];
}

/** The level directly beneath the given level, if any. */
export function subordinateLevel(level: AdminLevel): AdminLevel | undefined {
  const rank = ADMIN_LEVEL_RANK[level];
  return ADMIN_LEVELS.find((item) => ADMIN_LEVEL_RANK[item] === rank - 1);
}
