import { mockRoles } from "@insuros/mocks";

export class RoleService {
  async getRoles() {
    return mockRoles;
  }

  async getRole(id: string) {
    return mockRoles.find((role) => role.id === id);
  }

  async getRolePermissions(roleId: string) {
    const role = mockRoles.find((item) => item.id === roleId);

    return role?.permissions ?? [];
  }
}
