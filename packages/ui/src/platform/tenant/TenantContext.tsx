"use client";

import { createContext, useContext } from 'react';

export interface PlatformTenant {
  id?: string;
  name: string;
}

export const TenantContext = createContext<PlatformTenant>({
  name: 'InsurOS Internal'
});

export function useTenant() {
  return useContext(TenantContext);
}

