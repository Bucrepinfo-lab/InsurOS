'use client';

import { useActionState } from 'react';
import { replaceLink } from '@/app/dashboard/messages/actions';
import { ShareButton } from './value/share-button';

/** Make a fresh private link for the customer (the old one stops working) and hand it on. */
export function CustomerLinkPanel({ conversationId }: { conversationId: string }) {
  const [result, action, pending] = useActionState(replaceLink, null);
  return (
    <div className='rounded-2xl border border-line bg-sheet p-4'>
      <p className='text-dim'>The customer reads and replies through a private link. Lost it, or sent it to the wrong person? Make a new one; the old one stops working.</p>
      {result?.ok && result.link ? (
        <div className='mt-2 grid gap-2'>
          <p className='break-all rounded-lg bg-paper p-2 font-mono text-[12.5px] text-ink'>{result.link}</p>
          <ShareButton privateLink tone='dark' title='Your conversation with us' text='Read and reply to your insurance agent here:' url={result.link} />
        </div>
      ) : (
        <form action={action} className='mt-2'>
          <input type='hidden' name='conversationId' value={conversationId} />
          <button type='submit' disabled={pending} className='rounded-lg border border-ink/15 px-3 py-1.5 text-sm font-medium text-ink hover:border-seal/50 hover:text-seal disabled:opacity-60'>
            {pending ? 'Making…' : 'Make a new customer link'}
          </button>
          {result && !result.ok ? <p role='status' className='mt-1 text-red-800'>{result.message}</p> : null}
        </form>
      )}
    </div>
  );
}
