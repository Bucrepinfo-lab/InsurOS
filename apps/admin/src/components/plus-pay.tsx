'use client';

import { useState } from 'react';

/** "Pay with M-Pesa" for a month or a year: the customer types their phone and confirms the prompt with their own PIN. */
export function PlusPay({ token, words }: { token: string; words: { label: string; payMonth: string; payYear: string; sending: string; sent: string } }) {
  const [phone, setPhone] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  const pay = async (plan: 'MONTH' | 'YEAR') => {
    setState('sending');
    setError('');
    try {
      const res = await fetch('/api/my/plus', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token, phone, plan }) });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        setState('idle');
        return;
      }
      setState('sent');
    } catch {
      setError('No connection. Please try again.');
      setState('idle');
    }
  };
  if (state === 'sent') return <p role='status' className='rounded-lg bg-sealsoft px-3 py-2 text-sm text-ink'>{words.sent}</p>;
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        void pay(submitter?.value === 'YEAR' ? 'YEAR' : 'MONTH');
      }}
      className='flex flex-wrap items-end gap-2'
    >
      <label className='grid gap-1 text-sm font-medium text-ink'>
        {words.label}
        <input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode='tel' autoComplete='tel' placeholder='0712 345 678' required className='w-44 rounded-lg border border-ink/15 bg-white px-3 py-2 text-[15px] text-ink outline-none focus:border-seal focus:ring-2 focus:ring-seal/20' />
      </label>
      <button type='submit' value='MONTH' disabled={state === 'sending'} className='rounded-lg bg-seal px-4 py-2.5 text-sm font-semibold text-white hover:bg-sealdark disabled:opacity-60'>
        {state === 'sending' ? words.sending : words.payMonth}
      </button>
      <button type='submit' value='YEAR' disabled={state === 'sending'} className='rounded-lg bg-[#c9a227] px-4 py-2.5 text-sm font-semibold text-[#101c31] hover:bg-[#d8b13a] disabled:opacity-60'>
        {state === 'sending' ? words.sending : words.payYear}
      </button>
      {error ? <p role='alert' className='w-full text-sm text-red-800'>{error}</p> : null}
    </form>
  );
}
