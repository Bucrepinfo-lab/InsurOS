import type { EntityId, IsoDateTime } from "./base";

/**
 * A tenant: one insurer/agency workspace. All tenant-owned rows carry the
 * tenant id; isolation is enforced in the query layer AND by Postgres RLS.
 * v1 runs a single production tenant ("default") plus an isolated demo
 * tenant for store reviewers ("play-review").
 */
export type TenantKind = "Platform" | "Insurer" | "Agency" | "Demo";

export interface Tenant {
  id: EntityId;
  name: string;
  kind: TenantKind;
  countryCode: string;
  status: "Active" | "Suspended";
  createdAt: IsoDateTime;
}

export const DEFAULT_TENANT_ID = "default";
export const DEMO_TENANT_ID = "play-review";
