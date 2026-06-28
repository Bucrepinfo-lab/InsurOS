"use client";

import { createContext, useContext } from 'react';

export interface PlatformUser {
  id?: string;
  name?: string;
  email?: string;
}

export const UserContext = createContext<PlatformUser>({
  name: 'User'
});

export function useUser() {
  return useContext(UserContext);
}

