import { AdminWorkspaceShell, PlatformProvider } from '@insuros/ui';
import { PrincipalService } from '@insuros/services';
import { toE164 } from '@insuros/domain';
import type { ReactNode } from 'react';
import { supabaseEnabled } from '../../lib/supabase-enabled';
import { createSupabaseServerClient } from '../../lib/supabase/server';

const principalService = new PrincipalService();

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Phone-OTP identity via Supabase. The verified phone is the login (and M-Pesa)
  // identity; principals are still resolved by email, so phone-only users map to a
  // stable synthetic address until an appointment is created for them.
  let email = 'dev@insuros.local';
  let userId: string | undefined;
  let displayName: string | undefined;

  if (supabaseEnabled) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (user) {
      const phone = user.phone ? toE164(user.phone) : null;
      email = user.email ?? (phone ? `${phone}@phone.insuros` : email);
      userId = user.id;
      displayName =
        (user.user_metadata?.full_name as string | undefined) ?? phone ?? undefined;
    }
  }

  const principal = await principalService.resolveByEmail(email, userId, displayName);

  // Unmapped users keep full access in development; in production this
  // should fall back to an access-request screen instead.
  const permissions = principal.isUnmapped
    ? ['platform.manage']
    : ['platform.manage', ...principal.permissions];

  return (
    <PlatformProvider
      user={{
        id: principal.clerkUserId ?? principal.assignments[0]?.userId,
        name: principal.name === email ? 'Admin User' : principal.name,
        email: principal.email
      }}
      tenant={{ name: 'InsurOS Internal' }}
      environment='development'
      permissions={permissions}
    >
      <AdminWorkspaceShell>{children}</AdminWorkspaceShell>
    </PlatformProvider>
  );
}
