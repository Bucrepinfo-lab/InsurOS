"use client";

import { createContext, useContext } from 'react';

export type PlatformEnvironment = 'local' | 'development' | 'staging' | 'production';

export const EnvironmentContext = createContext<PlatformEnvironment>('development');

export function useEnvironment() {
  return useContext(EnvironmentContext);
}

