import { currentUser } from '@clerk/nextjs/server';
import { AdminWorkspaceShell, PlatformProvider } from '@insuros/ui';
import type { ReactNode } from 'react';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();

  return (
    <PlatformProvider
      user={{
        id: user?.id,
        name: user?.fullName ?? user?.firstName ?? 'Admin User',
        email: user?.emailAddresses?.[0]?.emailAddress
      }}
      tenant={{ name: 'InsurOS Internal' }}
      environment='development'
      permissions={['platform.manage']}
    >
      <AdminWorkspaceShell>{children}</AdminWorkspaceShell>
    </PlatformProvider>
  );
}
