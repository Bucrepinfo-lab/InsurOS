import type { Permission, PermissionAction, PermissionScope } from "./permission";

/**
 * v1 access-control catalog — PURE.
 *
 * Least privilege: a staff member sees and acts only on their own area; the
 * platform owner / platform admin keeps the overall view. Permission keys are
 * `"<Scope>:<Action>"` (e.g. "Claims:Create"). Every role that holds any action
 * in a scope also holds `<Scope>:View`, so page access can key off View alone.
 *
 * Enforcement is server-side (route handlers, server actions, section layouts);
 * menus only mirror it.
 */
export const PERMISSION_SCOPES: PermissionScope[] = [
  "Claims",
  "Policies",
  "Finance",
  "Marketplace",
  "Customers",
  "Identity",
  "Operations",
  "Platform"
];

export const PERMISSION_ACTIONS: PermissionAction[] = [
  "View",
  "Create",
  "Update",
  "Delete",
  "Approve",
  "Reject",
  "Execute",
  "Export"
];

export type PermissionKey = `${PermissionScope}:${PermissionAction}`;

export function permissionKey(scope: PermissionScope, action: PermissionAction): PermissionKey {
  return `${scope}:${action}`;
}

/** Every key in the catalog (platform owner / platform admin). */
export const ALL_PERMISSION_KEYS: PermissionKey[] = PERMISSION_SCOPES.flatMap((scope) =>
  PERMISSION_ACTIONS.map((action) => permissionKey(scope, action))
);

export function hasPermission(
  permissions: readonly string[],
  scope: PermissionScope,
  action: PermissionAction
): boolean {
  return permissions.includes(permissionKey(scope, action));
}

export interface StaffRoleDefinition {
  id: string;
  name: string;
  description: string;
  grants: Partial<Record<PermissionScope, PermissionAction[]>>;
}

/**
 * The v1 staff roles. Insurer/agency staff and agents only — the app is a B2B
 * operations tool, not a public insurance shop.
 */
export const STAFF_ROLES: StaffRoleDefinition[] = [
  {
    id: "role-platform-admin",
    name: "Platform Admin",
    description: "Full platform administration access (overall view).",
    grants: Object.fromEntries(PERMISSION_SCOPES.map((scope) => [scope, PERMISSION_ACTIONS]))
  },
  {
    id: "role-claims-manager",
    name: "Claims Manager",
    description: "Runs the claims desk: register, assess, approve or reject claims.",
    grants: {
      Claims: ["View", "Create", "Update", "Approve", "Reject", "Export"],
      Policies: ["View"],
      Customers: ["View"]
    }
  },
  {
    id: "role-claims-officer",
    name: "Claims Officer",
    description: "Registers and works claims; cannot approve or reject.",
    grants: {
      Claims: ["View", "Create", "Update"],
      Policies: ["View"],
      Customers: ["View"]
    }
  },
  {
    id: "role-underwriter",
    name: "Underwriter",
    description: "Prepares and approves policies for the insurer's own customers.",
    grants: {
      Policies: ["View", "Create", "Update", "Approve", "Reject"],
      Customers: ["View", "Create", "Update"],
      Marketplace: ["View"]
    }
  },
  {
    id: "role-agent",
    name: "Agent",
    description: "Field agent: captures customers, policy proposals and claim notices.",
    grants: {
      Customers: ["View", "Create"],
      Policies: ["View", "Create"],
      Claims: ["View", "Create"],
      Marketplace: ["View"]
    }
  },
  {
    id: "role-finance-manager",
    name: "Finance Manager",
    description: "Finance desk: invoices, reconciliation, tax and commissions.",
    grants: {
      Finance: ["View", "Create", "Update", "Approve", "Execute", "Export"],
      Policies: ["View"]
    }
  },
  {
    id: "role-operations",
    name: "Operations",
    description: "Back-office operations: tasks, documents, content and notifications.",
    grants: {
      Operations: ["View", "Create", "Update", "Approve"]
    }
  }
];

/** Permission keys a role grants (View is implied for every granted scope). */
export function rolePermissionKeys(role: StaffRoleDefinition): PermissionKey[] {
  const keys = new Set<PermissionKey>();
  for (const scope of PERMISSION_SCOPES) {
    const actions = role.grants[scope];
    if (!actions || actions.length === 0) continue;
    keys.add(permissionKey(scope, "View"));
    for (const action of actions) keys.add(permissionKey(scope, action));
  }
  return Array.from(keys);
}

export function findStaffRole(roleId: string): StaffRoleDefinition | undefined {
  return STAFF_ROLES.find((role) => role.id === roleId);
}

/** Role catalog expressed as domain `Permission` rows (for role listings). */
export function rolePermissions(role: StaffRoleDefinition): Permission[] {
  return rolePermissionKeys(role).map((key) => {
    const [scope, action] = key.split(":") as [PermissionScope, PermissionAction];
    return {
      id: `permission-${scope.toLowerCase()}-${action.toLowerCase()}`,
      scope,
      action,
      description: `${action} ${scope.toLowerCase()}.`
    };
  });
}

/** Parse a comma/space separated phone allowlist (e.g. PLATFORM_OWNER_PHONES). */
export function parsePhoneAllowlist(
  raw: string | undefined,
  normalize: (input: string) => string | null
): string[] {
  if (!raw) return [];
  return Array.from(
    new Set(
      raw
        .split(/[,;\s]+/)
        .map((item) => normalize(item))
        .filter((item): item is string => Boolean(item))
    )
  );
}
