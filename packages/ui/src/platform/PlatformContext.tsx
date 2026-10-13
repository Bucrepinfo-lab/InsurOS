import { createContext, useContext } from 'react';

export interface PlatformUser {
  id?: string;
  name?: string;
  email?: string;
}

export interface PlatformTenant {
  id?: string;
  name: string;
}

export interface PlatformContextValue {
  user: PlatformUser;
  tenant: PlatformTenant;
  permissions: string[];
  environment: 'local' | 'development' | 'staging' | 'production';
  notificationCount: number;
}

export const defaultPlatformContext: PlatformContextValue = {
  user: {
    name: 'User'
  },
  tenant: {
    name: 'InsurOS Internal'
  },
  permissions: [],
  environment: 'development',
  notificationCount: 0
};

export const PlatformContext = createContext<PlatformContextValue>(defaultPlatformContext);

export function usePlatform() {
  return useContext(PlatformContext);
}
