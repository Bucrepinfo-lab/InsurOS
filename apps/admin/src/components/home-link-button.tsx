'use client';

import { useActionState } from 'react';
import { makeCustomerHomeLink } from '@/app/dashboard/record-actions';
import { ShareButton } from './value/share-button';

export function HomeLinkButton({ customerId, name }: { customerId: string; name: string }) {
  const [result, action, pending] = useActionState(makeCustomerHomeLink, null);
  if (result?.ok && result.link) {
    return (
      <div className='grid gap-2'>
        <p className='break-all rounded-lg bg-paper p-2 font-mono text-[12px] text-ink'>{result.link}</p>
        <ShareButton tone='dark' title={`${name}: your policies`} text='Your policies, what is insured, values and expiry dates:' url={result.link} />
      </div>
    );
  }
  return (
    <form action={action} className='flex flex-wrap items-center gap-2'>
      <input type='hidden' name='customerId' value={customerId} />
      <button type='submit' disabled={pending} className='rounded-lg border border-ink/15 px-3 py-1.5 text-sm font-medium text-ink hover:border-seal/50 hover:text-seal disabled:opacity-60'>
        {pending ? 'Making…' : 'Make home link'}
      </button>
      {result && !result.ok ? <span role='status' className='text-xs text-red-800'>{result.message}</span> : null}
    </form>
  );
}
