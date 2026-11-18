'use client';

import { useState } from 'react';

/** "Pay KES 10 with M-Pesa": the customer types their phone and confirms the prompt with their own PIN. */
export function PlusPay({ token, words }: { token: string; words: { label: string; pay: string; sending: string; sent: string } }) {
  const [phone, setPhone] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  const pay = async () => {
    setState('sending');
    setError('');
    try {
      const res = await fetch('/api/my/plus', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token, phone }) });
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
        void pay();
      }}
      className='flex flex-wrap items-end gap-2'
    >
      <label className='grid gap-1 text-sm font-medium text-ink'>
        {words.label}
        <input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode='tel' autoComplete='tel' placeholder='0712 345 678' required className='w-44 rounded-lg border border-ink/15 bg-white px-3 py-2 text-[15px] text-ink outline-none focus:border-seal focus:ring-2 focus:ring-seal/20' />
      </label>
      <button type='submit' disabled={state === 'sending'} className='rounded-lg bg-seal px-4 py-2.5 text-sm font-semibold text-white hover:bg-sealdark disabled:opacity-60'>
        {state === 'sending' ? words.sending : words.pay}
      </button>
      {error ? <p role='alert' className='w-full text-sm text-red-800'>{error}</p> : null}
    </form>
  );
}
