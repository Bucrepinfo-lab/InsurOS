'use client';

import { useActionState } from 'react';
import { confirmFollowUp } from '@/app/dashboard/record-actions';

/** One button that confirms a step. The server decides whether this person may. */
export function FollowUpConfirm({ id, label }: { id: string; label: string }) {
  const [result, action, pending] = useActionState(confirmFollowUp, null);
  return (
    <form action={action} className='flex flex-wrap items-center gap-2'>
      <input type='hidden' name='id' value={id} />
      <button
        type='submit'
        disabled={pending}
        className='rounded-lg bg-seal px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-sealdark disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal'
      >
        {pending ? 'Saving…' : label}
      </button>
      {result && !result.ok ? (
        <span role='status' className='text-sm text-red-800'>
          {result.message}
        </span>
      ) : null}
    </form>
  );
}
