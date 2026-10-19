"use client";

import { createContext, useContext } from 'react';

export interface PermissionContextValue {
  permissions: string[];
}

export const PermissionContext = createContext<PermissionContextValue>({
  permissions: []
});

export function usePermissions() {
  return useContext(PermissionContext);
}

export function hasPermission(permissions: string[], permission: string) {
  return permissions.includes(permission);
}

