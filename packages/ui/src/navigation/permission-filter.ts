import type { NavigationSection } from './navigation-config';

export interface NavigationPermissionContext {
  permissions?: string[];
}

export function filterNavigationByPermissions(
  sections: NavigationSection[],
  context: NavigationPermissionContext
): NavigationSection[] {
  const permissions = context.permissions ?? [];

  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!item.requiredPermission) {
          return true;
        }

        return permissions.includes(item.requiredPermission);
      })
    }))
    .filter((section) => section.items.length > 0);
}
