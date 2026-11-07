'use client';

import { useActionState } from 'react';
import type { ActionResult } from '@/lib/action-result';
import { grantStaffAccess, revokeStaffAccess, revokeStaffDevices } from '@/app/dashboard/actions';

interface Option {
  id: string;
  name: string;
}

const field =
  'w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-seal';

function Receipt({ result }: { result: ActionResult | null }) {
  if (!result) return null;
  return (
    <p role='status' className={`text-sm ${result.ok ? 'text-seal' : 'text-red-700'}`}>
      <strong>{result.title}.</strong> {result.message}
    </p>
  );
}

/** Grant a role to a staff member's login phone. Authorised again on the server. */
export function GrantStaffAccessForm({ roles, regions }: { roles: Option[]; regions: Option[] }) {
  const [result, action, pending] = useActionState(grantStaffAccess, null);
  return (
    <form action={action} className='grid gap-3 rounded-2xl border border-ink/10 bg-sheet/60 p-5 md:grid-cols-2'>
      <h2 className='text-base font-semibold text-ink md:col-span-2'>Grant staff access</h2>
      <label className='text-sm text-ink/70'>
        Login phone
        <input name='phone' required inputMode='tel' placeholder='0712 345 678' className={field} />
      </label>
      <label className='text-sm text-ink/70'>
        Full name
        <input name='name' required minLength={2} maxLength={120} className={field} />
      </label>
      <label className='text-sm text-ink/70'>
        Role
        <select name='roleId' required className={field} defaultValue=''>
          <option value='' disabled>Choose a role</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>
      </label>
      <label className='text-sm text-ink/70'>
        Jurisdiction
        <select name='regionId' required className={field} defaultValue=''>
          <option value='' disabled>Choose a region</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>{region.name}</option>
          ))}
        </select>
      </label>
      <div className='flex items-center gap-3 md:col-span-2'>
        <button type='submit' disabled={pending} className='rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-60'>
          {pending ? 'Granting…' : 'Grant access'}
        </button>
        <Receipt result={result} />
      </div>
    </form>
  );
}

/** Revoke every active role for a login phone. */
export function RevokeStaffAccessForm() {
  const [result, action, pending] = useActionState(revokeStaffAccess, null);
  return (
    <form action={action} className='flex flex-wrap items-end gap-3 rounded-2xl border border-ink/10 bg-sheet/60 p-5'>
      <label className='min-w-56 flex-1 text-sm text-ink/70'>
        Revoke access for phone
        <input name='phone' required inputMode='tel' placeholder='0712 345 678' className={field} />
      </label>
      <button type='submit' disabled={pending} className='rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-60'>
        {pending ? 'Revoking…' : 'Revoke'}
      </button>
      <Receipt result={result} />
    </form>
  );
}

/** Sign a staff member out of all their trusted devices (role kept). */
export function RevokeStaffDevicesForm() {
  const [result, action, pending] = useActionState(revokeStaffDevices, null);
  return (
    <form action={action} className='flex flex-wrap items-end gap-3 rounded-2xl border border-ink/10 bg-sheet/60 p-5'>
      <label className='min-w-56 flex-1 text-sm text-ink/70'>
        Sign out all devices for phone
        <input name='phone' required inputMode='tel' placeholder='0712 345 678' className={field} />
      </label>
      <button type='submit' disabled={pending} className='rounded-lg border border-ink/20 px-4 py-2 text-sm font-medium text-ink disabled:opacity-60'>
        {pending ? 'Revoking…' : 'Revoke devices'}
      </button>
      <Receipt result={result} />
    </form>
  );
}
