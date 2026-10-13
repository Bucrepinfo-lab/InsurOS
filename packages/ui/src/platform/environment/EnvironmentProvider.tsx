"use client";

import type { ReactNode } from 'react';
import { EnvironmentContext, type PlatformEnvironment } from './EnvironmentContext';

export interface EnvironmentProviderProps {
  children: ReactNode;
  environment?: PlatformEnvironment;
}

export function EnvironmentProvider({
  children,
  environment = 'development'
}: EnvironmentProviderProps) {
  return (
    <EnvironmentContext.Provider value={environment}>
      {children}
    </EnvironmentContext.Provider>
  );
}

