import { mockPermissions } from "@insuros/mocks";

export class PermissionService {
  async getPermissions() {
    return mockPermissions;
  }

  async getPermissionsByScope(scope: string) {
    return mockPermissions.filter((permission) => permission.scope === scope);
  }

  async hasPermission(scope: string, action: string) {
    return mockPermissions.some(
      (permission) => permission.scope === scope && permission.action === action
    );
  }
}
