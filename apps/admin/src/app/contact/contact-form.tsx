'use client';

import { useActionState } from 'react';
import { MESSAGE_MAX } from '@insuros/domain';
import { contactUs } from '../c/actions';

const field = 'mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-[15px] text-ink outline-none focus:border-seal focus:ring-2 focus:ring-seal/20';
const label = 'block text-sm font-medium text-ink';

export function ContactForm({ topic = 'claim', reference = '' }: { topic?: string; reference?: string }) {
  const [result, action, pending] = useActionState(contactUs, null);
  return (
    <form action={action} className='grid gap-4 rounded-2xl border border-line bg-sheet p-5'>
      <label className={label}>Your name<input name='name' required minLength={2} maxLength={120} autoComplete='name' className={field} /></label>
      <label className={label}>Phone or email<input name='contact' required minLength={5} maxLength={80} autoComplete='tel' className={field} /></label>
      <div className='grid gap-4 sm:grid-cols-2'>
        <label className={label}>
          About
          <select name='topic' defaultValue={topic} className={field}>
            <option value='claim'>A claim</option>
            <option value='policy'>A policy</option>
            <option value='general'>Something else</option>
          </select>
        </label>
        <label className={label}>Claim or policy number<input name='reference' maxLength={40} defaultValue={reference} autoComplete='off' className={field} /></label>
      </div>
      <label className={label}>Message<textarea name='body' required rows={5} maxLength={MESSAGE_MAX} className={field} /></label>
      {/* Left empty by people; robots that fill every field give themselves away. */}
      <input type='text' name='website' tabIndex={-1} autoComplete='off' aria-hidden='true' className='hidden' />
      <div className='flex flex-wrap items-center gap-3'>
        <button type='submit' disabled={pending} className='rounded-lg bg-seal px-5 py-2.5 text-sm font-semibold text-white hover:bg-sealdark disabled:opacity-60'>{pending ? 'Sending…' : 'Send'}</button>
        {result && !result.ok ? <span role='status' className='text-sm text-red-800'>{result.message}</span> : null}
      </div>
    </form>
  );
}
