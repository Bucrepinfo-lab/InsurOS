"use client";

import type { ReactNode } from 'react';
import { PermissionContext } from './PermissionContext';

export interface PermissionProviderProps {
  children: ReactNode;
  permissions?: string[];
}

export function PermissionProvider({ children, permissions = [] }: PermissionProviderProps) {
  return (
    <PermissionContext.Provider value={{ permissions }}>
      {children}
    </PermissionContext.Provider>
  );
}

