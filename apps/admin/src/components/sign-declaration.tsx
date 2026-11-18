'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { CLAIM_DECLARATION } from '@insuros/domain';

/** Sign the claim declaration with a finger. The drawing is sent as a JPEG with the typed name. */
export function SignDeclaration({ token, signedBy }: { token: string; signedBy: string[] }) {
  const router = useRouter();
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [drawn, setDrawn] = useState(false);
  const [name, setName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const c = canvas.current;
    const context = c?.getContext('2d');
    if (!c || !context) return;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, c.width, c.height);
    context.lineWidth = 3;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = '#121c31';
  }, []);

  const point = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * event.currentTarget.width, y: ((event.clientY - rect.top) / rect.height) * event.currentTarget.height };
  };

  const clear = () => {
    const c = canvas.current;
    const context = c?.getContext('2d');
    if (!c || !context) return;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, c.width, c.height);
    setDrawn(false);
  };

  async function submit() {
    const c = canvas.current;
    if (!c || !drawn) return setNote('Sign in the box with your finger first.');
    setBusy(true);
    setNote(null);
    try {
      const blob = await new Promise<Blob | null>((resolve) => c.toBlob(resolve, 'image/jpeg', 0.9));
      if (!blob) throw new Error('The signature could not be read. Try again.');
      const form = new FormData();
      form.set('token', token);
      form.set('name', name);
      form.set('agreed', agreed ? 'yes' : 'no');
      form.set('signature', blob, 'signature.jpg');
      const response = await fetch('/api/c/sign', { method: 'POST', body: form });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? 'Not signed. Try again.');
      setNote('Signed. Your agent has been told, and the signed declaration is in your claim pack.');
      clear();
      router.refresh();
    } catch (error) {
      setNote(error instanceof Error ? error.message : 'Not signed. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby='declaration' className='grid gap-3 rounded-2xl border border-line bg-sheet p-4 sm:p-5'>
      <h2 id='declaration' className='font-display text-[20px] text-ink'>Sign the claim declaration</h2>
      {signedBy.length > 0 ? <p className='rounded-lg bg-sealsoft px-3 py-2 text-sm text-ink'>Signed by {signedBy.join(', ')}. You can sign again if something changed.</p> : null}
      <p className='rounded-lg bg-paper p-3 text-sm leading-relaxed text-ink'>{CLAIM_DECLARATION}</p>
      <label className='block text-sm font-medium text-ink'>
        Your full name
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete='name' className='mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-[15px] text-ink outline-none focus:border-seal focus:ring-2 focus:ring-seal/20' />
      </label>
      <div>
        <p className='text-sm font-medium text-ink'>Sign here with your finger</p>
        <canvas
          ref={canvas}
          width={900}
          height={300}
          aria-label='Signature box'
          className='mt-1 aspect-[3/1] w-full touch-none rounded-lg border border-dashed border-ink/30 bg-white'
          onPointerDown={(event) => {
            drawing.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            const context = event.currentTarget.getContext('2d');
            const p = point(event);
            context?.beginPath();
            context?.moveTo(p.x, p.y);
          }}
          onPointerMove={(event) => {
            if (!drawing.current) return;
            const context = event.currentTarget.getContext('2d');
            const p = point(event);
            context?.lineTo(p.x, p.y);
            context?.stroke();
            setDrawn(true);
          }}
          onPointerUp={() => (drawing.current = false)}
          onPointerCancel={() => (drawing.current = false)}
        />
        <button type='button' onClick={clear} className='mt-1 text-xs font-medium text-seal underline underline-offset-2'>Clear and sign again</button>
      </div>
      <label className='flex items-start gap-2 text-sm text-ink'>
        <input type='checkbox' checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className='mt-0.5 accent-[#0f6e56]' />
        I have read the declaration and I agree to it.
      </label>
      <div className='flex flex-wrap items-center gap-3'>
        <button type='button' disabled={busy} onClick={() => void submit()} className='rounded-lg bg-seal px-5 py-2.5 text-sm font-semibold text-white hover:bg-sealdark disabled:opacity-60'>
          {busy ? 'Signing…' : 'Sign and send'}
        </button>
        {note ? <span role='status' className='text-sm text-dim'>{note}</span> : null}
      </div>
    </section>
  );
}
