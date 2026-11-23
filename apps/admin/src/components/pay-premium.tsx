'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';

/*
  One tap to pay a premium. The invoice is already filled in by the server;
  the customer taps "Pay", gets the M-Pesa prompt on their phone and enters
  their own PIN. The phone is remembered on this device after the first time.
  Card is the second choice, shown only where a card provider is set up.
*/

export interface PayPremiumWords {
  pay: string;
  payTo: string;
  change: string;
  phoneLabel: string;
  checkPhone: string;
  paid: string;
  receipt: string;
  failed: string;
  orCard: string;
  noConnection: string;
}

const PHONE_KEY = 'insuros.mpesaPhone';
const POLL_MS = 4000;
const GIVE_UP_MS = 3 * 60_000;

function readPhone(): string {
  try {
    return localStorage.getItem(PHONE_KEY) ?? '';
  } catch {
    return '';
  }
}

const noSubscribe = () => () => {};

function keepPhone(phone: string) {
  try {
    localStorage.setItem(PHONE_KEY, phone);
  } catch {
    /* private browsing: the customer types it next time */
  }
}

export function PayPremium({
  token,
  policyId,
  amountLabel,
  initialState,
  initialTxnId,
  cardHref,
  words
}: {
  token: string;
  policyId: string;
  amountLabel: string;
  initialState: 'due' | 'waiting' | 'paid';
  initialTxnId?: string;
  cardHref?: string | null;
  words: PayPremiumWords;
}) {
  const router = useRouter();
  // The number saved on this device last time (empty on the server and on first use).
  const saved = useSyncExternalStore(noSubscribe, readPhone, () => '');
  const [typed, setPhone] = useState<string | null>(null);
  const phone = typed ?? saved;
  const [editingWanted, setEditing] = useState(false);
  const editing = editingWanted || !saved;
  const [state, setState] = useState<'due' | 'sending' | 'waiting' | 'paid' | 'failed'>(initialState);
  const [txnId, setTxnId] = useState(initialTxnId);
  const [error, setError] = useState('');
  const started = useRef<number>(0);

  // While waiting for the PIN, ask the server how the payment is going.
  useEffect(() => {
    if (state !== 'waiting' || !txnId) return;
    if (!started.current) started.current = Date.now();
    const timer = setInterval(async () => {
      if (Date.now() - started.current > GIVE_UP_MS) {
        clearInterval(timer);
        setState('failed');
        return;
      }
      try {
        const res = await fetch(`/api/my/premium?token=${encodeURIComponent(token)}&txn=${encodeURIComponent(txnId)}`, { cache: 'no-store' });
        const data = (await res.json().catch(() => ({}))) as { state?: string };
        if (data.state === 'paid') {
          clearInterval(timer);
          setState('paid');
          router.refresh();
        } else if (data.state === 'failed') {
          clearInterval(timer);
          setState('failed');
        }
      } catch {
        /* keep waiting; the next try may get through */
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [state, txnId, token, router]);

  const pay = async () => {
    setError('');
    setState('sending');
    started.current = 0;
    try {
      const res = await fetch('/api/my/premium', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, policyId, phone })
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; state?: string; txnId?: string };
      if (data.state === 'paid' && data.txnId) {
        setTxnId(data.txnId);
        setState('paid');
        return;
      }
      if (!res.ok || !data.txnId) {
        setError(data.error ?? words.noConnection);
        setState('due');
        return;
      }
      keepPhone(phone);
      setEditing(false);
      setTxnId(data.txnId);
      setState('waiting');
    } catch {
      setError(words.noConnection);
      setState('due');
    }
  };

  if (state === 'paid') {
    return (
      <div role='status' className='flex flex-wrap items-center justify-between gap-2 rounded-xl border border-seal/30 bg-sealsoft px-4 py-3 text-sm text-ink'>
        <span>
          <strong>{words.paid}</strong>
        </span>
        {txnId ? (
          <a href={`/my/${token}/receipts/${encodeURIComponent(txnId)}`} className='font-semibold text-seal underline underline-offset-2'>
            {words.receipt}
          </a>
        ) : null}
      </div>
    );
  }

  if (state === 'waiting') {
    return (
      <div role='status' aria-live='polite' className='flex items-center gap-3 rounded-xl border border-warnink/30 bg-warnsoft px-4 py-3 text-sm text-ink'>
        <span aria-hidden='true' className='inline-block h-3 w-3 animate-pulse rounded-full bg-warnink' />
        {words.checkPhone}
      </div>
    );
  }

  const ready = /^(\+?254|0)?[17]\d{8}$/.test(phone.replace(/\s/g, ''));

  return (
    <div className='grid gap-2'>
      {editing ? (
        <label className='grid gap-1 text-sm font-medium text-ink'>
          {words.phoneLabel}
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            inputMode='tel'
            autoComplete='tel'
            placeholder='0712 345 678'
            className='w-full rounded-lg border border-ink/15 bg-sheet px-3 py-2.5 text-[15px] text-ink outline-none focus:border-seal focus:ring-2 focus:ring-seal/20'
          />
        </label>
      ) : null}
      <button
        type='button'
        onClick={pay}
        disabled={state === 'sending' || !ready}
        className='w-full rounded-xl bg-seal px-5 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-sealdark disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal'
      >
        {state === 'sending' ? '…' : `${words.pay} ${amountLabel}`}
      </button>
      {!editing && phone ? (
        <p className='text-xs text-dim'>
          {words.payTo} {phone}.{' '}
          <button type='button' onClick={() => setEditing(true)} className='font-medium text-seal underline underline-offset-2'>
            {words.change}
          </button>
        </p>
      ) : null}
      {state === 'failed' ? <p className='text-sm text-dangerink'>{words.failed}</p> : null}
      {error ? <p className='text-sm text-dangerink'>{error}</p> : null}
      {cardHref ? (
        <a href={cardHref} className='text-center text-sm font-medium text-seal underline underline-offset-2'>
          {words.orCard}
        </a>
      ) : null}
    </div>
  );
}
