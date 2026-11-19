'use client';

import { useState } from 'react';

type CardCheckout = {
  environment: 'sandbox' | 'production';
  clientToken: string;
  priceIds: Record<'MONTH' | 'YEAR', string>;
  references: Record<'MONTH' | 'YEAR', string>;
};

type PaddleJs = {
  Environment: { set: (environment: string) => void };
  Initialize: (options: { token: string }) => void;
  Checkout: { open: (options: { items: { priceId: string; quantity: number }[]; customData: Record<string, string> }) => void };
};

let paddleReady: Promise<PaddleJs> | null = null;

/** Loads Paddle.js once. Card details are typed into Paddle, never into InsurOS. */
function loadPaddle(card: CardCheckout): Promise<PaddleJs> {
  if (!paddleReady) {
    paddleReady = new Promise<PaddleJs>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
      script.async = true;
      script.onload = () => {
        const paddle = (window as unknown as { Paddle?: PaddleJs }).Paddle;
        if (!paddle) return reject(new Error('The card checkout did not load.'));
        if (card.environment === 'sandbox') paddle.Environment.set('sandbox');
        paddle.Initialize({ token: card.clientToken });
        resolve(paddle);
      };
      script.onerror = () => {
        paddleReady = null;
        reject(new Error('The card checkout did not load.'));
      };
      document.head.appendChild(script);
    });
  }
  return paddleReady;
}

/**
 * "Pay with M-Pesa" for a month or a year: the customer types their phone and
 * confirms the prompt with their own PIN. With Paddle on, "Pay by card" opens
 * Paddle's checkout (Paddle is the seller for cards and handles the tax).
 */
export function PlusPay({
  token,
  words,
  card = null,
  mpesa = true
}: {
  token: string;
  words: { label: string; payMonth: string; payYear: string; sending: string; sent: string; cardMonth?: string; cardYear?: string; cardNote?: string };
  card?: CardCheckout | null;
  /** M-Pesa is a way to pay here (it leads where it is). */
  mpesa?: boolean;
}) {
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
  const payByCard = async (plan: 'MONTH' | 'YEAR') => {
    if (!card) return;
    setError('');
    try {
      const paddle = await loadPaddle(card);
      paddle.Checkout.open({ items: [{ priceId: card.priceIds[plan], quantity: 1 }], customData: { plusReference: card.references[plan] } });
    } catch {
      setError('The card checkout did not load. Please try again.');
    }
  };
  if (state === 'sent') return <p role='status' className='rounded-lg bg-sealsoft px-3 py-2 text-sm text-ink'>{words.sent}</p>;
  const cardButtons = card ? (
    <div className='flex w-full flex-wrap gap-2'>
      <button type='button' onClick={() => void payByCard('MONTH')} className={mpesa ? 'rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:border-seal' : 'rounded-lg bg-seal px-4 py-2.5 text-sm font-semibold text-white hover:bg-sealdark'}>
        {words.cardMonth ?? 'Pay a month by card'}
      </button>
      <button type='button' onClick={() => void payByCard('YEAR')} className={mpesa ? 'rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:border-seal' : 'rounded-lg bg-[#c9a227] px-4 py-2.5 text-sm font-semibold text-[#101c31] hover:bg-[#d8b13a]'}>
        {words.cardYear ?? 'Pay a year by card'}
      </button>
      <p className='w-full text-xs text-dim'>{words.cardNote ?? 'Card payments are processed by Paddle, our online reseller, which handles any tax due. The card price is shown at checkout.'}</p>
    </div>
  ) : null;
  // Owner rules 19/11/26: M-Pesa leads where it is the way most people pay
  // (Kenya), with "pay by card" second; card only where M-Pesa is not a way.
  if (!mpesa) {
    return (
      <div className='grid w-full gap-2'>
        {cardButtons}
        {error ? <p role='alert' className='w-full text-sm text-red-800'>{error}</p> : null}
      </div>
    );
  }
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
      {cardButtons}
      {error ? <p role='alert' className='w-full text-sm text-red-800'>{error}</p> : null}
    </form>
  );
}
