import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AdminWorkspaceShell, PlatformProvider } from '@insuros/ui';
import { ServiceUnavailable } from '@/components/auth/service-unavailable';
import { SignOutButton } from '@/components/sign-out-button';
import { getAuthMode, isProductionRuntime } from '@/lib/auth/config';
import { getAuthState } from '@/lib/auth/session';

// Per-request: the principal comes from the session cookie on every render.
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const state = await getAuthState();

  if (state.status === 'misconfigured') return <ServiceUnavailable />;
  if (state.status === 'signed-out') redirect('/sign-in?next=/dashboard');
  // No role yet -> no data. Least privilege: unmapped users get nothing.
  if (state.status === 'needs-pin') redirect('/set-pin');
  if (state.status === 'pending') redirect('/access-pending');

  const { principal } = state;

  return (
    <PlatformProvider
      user={{
        id: principal.clerkUserId,
        name: principal.name,
        email: principal.phone ?? principal.email
      }}
      tenant={{ name: 'InsurOS' }}
      environment={isProductionRuntime ? 'production' : 'development'}
      permissions={principal.permissions}
    >
      <AdminWorkspaceShell
        userActions={
          getAuthMode() === 'supabase' ? (
            <div className='flex items-center gap-2'>
              <Link href='/account/delete' className='hidden text-xs text-slate-500 underline sm:inline'>
                Delete account
              </Link>
              <SignOutButton />
            </div>
          ) : null
        }
      >
        {children}
      </AdminWorkspaceShell>
    </PlatformProvider>
  );
}
