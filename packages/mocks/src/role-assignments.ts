import type { RoleAssignment } from "@insuros/domain";

export const mockRoleAssignments: RoleAssignment[] = [
  {
    id: "assignment-platform-admin",
    userId: "user-platform-admin",
    roleId: "role-platform-admin",
    assignedAt: "2026-07-04T12:00:00Z",
    assignedBy: "system"
  },
  {
    id: "assignment-claims-manager",
    userId: "user-claims-manager",
    roleId: "role-claims-manager",
    assignedAt: "2026-07-04T12:15:00Z",
    assignedBy: "user-platform-admin"
  },
  {
    id: "assignment-finance-manager",
    userId: "user-finance-manager",
    roleId: "role-finance-manager",
    assignedAt: "2026-07-04T12:30:00Z",
    assignedBy: "user-platform-admin"
  }
];
