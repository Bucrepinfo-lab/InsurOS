export type PermissionScope =
  | "Claims"
  | "Policies"
  | "Finance"
  | "Marketplace"
  | "Customers"
  | "Identity"
  | "Operations"
  | "Platform";

export type PermissionAction =
  | "View"
  | "Create"
  | "Update"
  | "Delete"
  | "Approve"
  | "Reject"
  | "Execute"
  | "Export";

export interface Permission {
  id: string;
  scope: PermissionScope;
  action: PermissionAction;
  description: string;
}
