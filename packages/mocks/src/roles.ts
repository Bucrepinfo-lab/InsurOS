import type { Role } from "@insuros/domain";
import { mockPermissions } from "./permissions";

export const mockRoles: Role[] = [
  {
    id: "role-platform-admin",
    name: "Platform Admin",
    description: "Full platform administration access.",
    permissions: mockPermissions
  },
  {
    id: "role-claims-manager",
    name: "Claims Manager",
    description: "Can view and approve claim workflows.",
    permissions: mockPermissions.filter(
      (permission) => permission.scope === "Claims"
    )
  },
  {
    id: "role-finance-manager",
    name: "Finance Manager",
    description: "Can execute finance workflow actions.",
    permissions: mockPermissions.filter(
      (permission) => permission.scope === "Finance"
    )
  }
];
