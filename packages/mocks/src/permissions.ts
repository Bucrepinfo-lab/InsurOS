import type { Permission } from "@insuros/domain";

export const mockPermissions: Permission[] = [
  {
    id: "permission-claims-view",
    scope: "Claims",
    action: "View",
    description: "View claims and claim workspaces."
  },
  {
    id: "permission-claims-approve",
    scope: "Claims",
    action: "Approve",
    description: "Approve claim workflow actions."
  },
  {
    id: "permission-policies-approve",
    scope: "Policies",
    action: "Approve",
    description: "Approve policy workflow actions."
  },
  {
    id: "permission-finance-execute",
    scope: "Finance",
    action: "Execute",
    description: "Execute finance workflow actions."
  },
  {
    id: "permission-platform-export",
    scope: "Platform",
    action: "Export",
    description: "Export platform audit, notification, and event data."
  }
];
