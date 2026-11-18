'use client';

import { useActionState, useState } from 'react';
import { MESSAGE_MAX } from '@insuros/domain';
import { customerReply } from '../actions';

export function CustomerReplyForm({
  token,
  words = { label: 'Write to us', send: 'Send', sending: 'Sending…' }
}: {
  token: string;
  words?: { label: string; send: string; sending: string };
}) {
  const [result, action, pending] = useActionState(customerReply, null);
  const [text, setText] = useState('');
  return (
    <form action={async (formData) => { await action(formData); setText(''); }} className='grid gap-3 rounded-2xl border border-line bg-sheet p-4'>
      <input type='hidden' name='token' value={token} />
      <label className='block text-sm font-medium text-ink'>
        {words.label}
        <textarea name='body' required rows={4} maxLength={MESSAGE_MAX} value={text} onChange={(e) => setText(e.target.value)} className='mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-[15px] text-ink outline-none focus:border-seal focus:ring-2 focus:ring-seal/20' />
      </label>
      <div className='flex flex-wrap items-center gap-3'>
        <button type='submit' disabled={pending || !text.trim()} className='rounded-lg bg-seal px-5 py-2.5 text-sm font-semibold text-white hover:bg-sealdark disabled:opacity-60'>
          {pending ? words.sending : words.send}
        </button>
        {result ? <span role='status' className={`text-sm ${result.ok ? 'text-seal' : 'text-red-800'}`}>{result.message}</span> : null}
      </div>
    </form>
  );
}
