import type { ReactNode } from 'react';
import type { PermissionScope } from '@insuros/domain';
import { authorizeAction } from '@/lib/auth/session';

/**
 * Shows a form only to someone whose role may create in this area. The action
 * behind the form checks again; this only saves a person from filling in a
 * form that would be refused.
 */
export async function CreateGate({ scope, children }: { scope: PermissionScope; children: ReactNode }) {
  const auth = await authorizeAction(scope, 'Create');
  if (!auth.ok) {
    return (
      <p className='max-w-2xl rounded-2xl border border-line bg-sheet p-5 text-sm text-ink'>
        <strong>{auth.result.title}.</strong> Your role can look at this area but cannot add to it. Ask an administrator
        if you need to.
      </p>
    );
  }
  return <>{children}</>;
}
