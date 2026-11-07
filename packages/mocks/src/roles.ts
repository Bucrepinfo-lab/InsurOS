import type { Role } from "@insuros/domain";
import { STAFF_ROLES, rolePermissions } from "@insuros/domain";

/** Staff roles — generated from the v1 least-privilege catalog in the domain. */
export const mockRoles: Role[] = STAFF_ROLES.map((role) => ({
  id: role.id,
  name: role.name,
  description: role.description,
  permissions: rolePermissions(role)
}));
