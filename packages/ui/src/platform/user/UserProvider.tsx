"use client";

import type { ReactNode } from 'react';
import { UserContext, type PlatformUser } from './UserContext';

export interface UserProviderProps {
  children: ReactNode;
  user?: PlatformUser;
}

export function UserProvider({ children, user }: UserProviderProps) {
  return (
    <UserContext.Provider value={user ?? { name: 'User' }}>
      {children}
    </UserContext.Provider>
  );
}

