import type { PermissionAction, PermissionScope } from "@insuros/domain";
import { RoleService } from "./roles";

export interface AuthorizationDecision {
  allowed: boolean;
  reason?: string;
}

export class AuthorizationService {
  private readonly roleService = new RoleService();

  async authorize(
    roleId: string,
    scope: PermissionScope,
    action: PermissionAction
  ): Promise<AuthorizationDecision> {
    const permissions = await this.roleService.getRolePermissions(roleId);

    const allowed = permissions.some(
      (permission) =>
        permission.scope === scope && permission.action === action
    );

    if (!allowed) {
      return {
        allowed: false,
        reason: "Role does not have the required permission."
      };
    }

    return {
      allowed: true
    };
  }
}
