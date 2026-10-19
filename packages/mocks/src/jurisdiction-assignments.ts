import type { JurisdictionAssignment } from "@insuros/domain";

export const mockJurisdictionAssignments: JurisdictionAssignment[] = [
  {
    id: "jgrant-super",
    userId: "user-super-admin",
    userName: "Jacob Bucrep",
    roleId: "role-platform-admin",
    regionId: "region-global",
    assignedBy: "system",
    assignedAt: "2026-01-01T00:00:00Z",
    status: "Active"
  },
  {
    id: "jgrant-af",
    userId: "user-af-director",
    userName: "Amina Okonkwo",
    roleId: "role-platform-admin",
    regionId: "region-af",
    assignedBy: "user-super-admin",
    assignedAt: "2026-01-15T09:00:00Z",
    status: "Active"
  },
  {
    id: "jgrant-ke",
    userId: "user-ke-admin",
    userName: "Daniel Mwangi",
    roleId: "role-claims-manager",
    regionId: "region-ke",
    assignedBy: "user-af-director",
    assignedAt: "2026-02-01T08:00:00Z",
    status: "Active"
  },
  {
    id: "jgrant-nairobi",
    userId: "user-nairobi-admin",
    userName: "Grace Wanjiru",
    roleId: "role-finance-manager",
    regionId: "region-ke-047",
    assignedBy: "user-ke-admin",
    assignedAt: "2026-02-10T11:00:00Z",
    status: "Active"
  },
  {
    id: "jgrant-westlands",
    userId: "user-westlands-admin",
    userName: "Peter Otieno",
    roleId: "role-finance-manager",
    regionId: "region-ke-047-westlands",
    assignedBy: "user-nairobi-admin",
    assignedAt: "2026-02-20T14:00:00Z",
    status: "Active"
  },
  {
    id: "jgrant-ng-suspended",
    userId: "user-ng-admin",
    userName: "Chidi Adeyemi",
    roleId: "role-claims-manager",
    regionId: "region-ng",
    assignedBy: "user-af-director",
    assignedAt: "2026-02-03T10:00:00Z",
    status: "Suspended"
  }
];
