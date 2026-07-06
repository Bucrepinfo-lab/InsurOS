import { currentUser } from '@clerk/nextjs/server';
import { AdminWorkspaceShell, PlatformProvider } from '@insuros/ui';
import { PrincipalService } from '@insuros/services';
import type { ReactNode } from 'react';

const principalService = new PrincipalService();

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();

  const email = user?.emailAddresses?.[0]?.emailAddress ?? 'dev@insuros.local';

  const principal = await principalService.resolveByEmail(
    email,
    user?.id,
    user?.fullName ?? user?.firstName ?? undefined
  );

  // Unmapped users keep full access in development; in production this
  // should fa