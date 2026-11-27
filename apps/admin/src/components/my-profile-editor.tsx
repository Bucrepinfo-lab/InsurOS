'use client';

import { useActionState, useRef, useState, useTransition } from 'react';
import type { ProfileChangeRequest } from '@insuros/domain';
import type { ActionResult } from '@/lib/action-result';
import { askToCorrect, decideCorrection, removeMyPhoto, saveMyPhoto, saveMyWorkEmail } from '@/app/dashboard/my-record/actions';
import { HiddenNumber } from '@/components/hidden-number';
import { ReviewBeforeSend } from '@/components/review-before-send';

const field =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-[15px] text-ink outline-none transition focus:border-seal focus-visible:ring-2 focus-visible:ring-seal/30';
const primary =
  'rounded-lg bg-seal px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-px hover:bg-sealdark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal disabled:opacity-60 motion-reduce:transform-none';
const quiet =
  'rounded-lg border border-line bg-sheet px-3 py-1.5 text-sm font-medium text-ink transition hover:-translate-y-px hover:border-seal/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal disabled:opacity-60 motion-reduce:transform-none';

function Receipt({ result }: { result: ActionResult | null }) {
  if (!result) return null;
  return (
    <p role='status' className={`text-sm ${result.ok ? 'text-seal' : 'text-red-700'}`}>
      <strong>{result.title}.</strong> {result.message}
    </p>
  );
}

/** Shrink a chosen photo on the phone to a 512 px square JPEG (a few dozen KB). */
async function squareJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no canvas');
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, 512, 512);
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('no photo'))), 'image/jpeg', 0.86));
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('') || '?';
}

const STATUS_WORDS: Record<ProfileChangeRequest['status'], string> = { Pending: 'Waiting', Approved: 'Approved', Declined: 'Declined' };

export function MyProfileEditor({
  name,
  phone,
  email,
  photoUrl,
  requests,
  canRequest
}: {
  name: string;
  phone: string | null;
  email: string | null;
  photoUrl: string | null;
  requests: ProfileChangeRequest[];
  canRequest: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoResult, setPhotoResult] = useState<ActionResult | null>(null);
  const [photoBusy, startPhoto] = useTransition();
  const [emailResult, emailAction, emailBusy] = useActionState(saveMyWorkEmail, null);
  const [askResult, askAction, askBusy] = useActionState(askToCorrect, null);
  const [asking, setAsking] = useState<'name' | 'phone' | null>(null);
  const waiting = (f: 'name' | 'phone') => requests.some((r) => r.field === f && r.status === 'Pending');

  function choose(list: FileList | null) {
    const file = list?.[0];
    if (!file) return;
    startPhoto(async () => {
      try {
        const body = new FormData();
        body.set('photo', await squareJpeg(file), 'photo.jpg');
        setPhotoResult(await saveMyPhoto(body));
      } catch {
        setPhotoResult({ ok: false, title: 'Photo not saved', message: 'That photo could not be read. Try another one.' });
      }
      if (fileRef.current) fileRef.current.value = '';
    });
  }

  return (
    <div className='grid gap-5'>
      <div className='flex flex-wrap items-center gap-4'>
        <button
          type='button'
          onClick={() => fileRef.current?.click()}
          disabled={photoBusy}
          aria-label='Change my photo'
          className='group relative grid h-24 w-24 place-items-center overflow-hidden rounded-full border-2 border-line bg-sealsoft text-[28px] font-semibold text-seal transition hover:border-seal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal'
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {photoUrl ? <img src={photoUrl} alt='' className='h-full w-full object-cover' /> : <span>{initials(name)}</span>}
          <span className='absolute inset-x-0 bottom-0 bg-ink/60 py-1 text-center text-xs font-medium text-white opacity-90 group-hover:opacity-100'>
            {photoBusy ? 'Saving…' : 'Change'}
          </span>
        </button>
        <input ref={fileRef} type='file' accept='image/*' className='hidden' onChange={(e) => choose(e.target.files)} />
        <div className='grid gap-1'>
          <p className='text-sm text-dim'>A clear photo of your face, like on a staff card. It is kept privately and shows on your record.</p>
          {photoUrl ? (
            <button type='button' className='justify-self-start text-sm text-red-700 underline' disabled={photoBusy} onClick={() => startPhoto(async () => setPhotoResult(await removeMyPhoto()))}>
              Remove photo
            </button>
          ) : null}
          <Receipt result={photoResult} />
        </div>
      </div>

      <dl className='grid gap-4 text-[15px] text-ink sm:grid-cols-2'>
        <div className='grid gap-1'>
          <dt className='text-sm text-dim'>Name (as on your ID or licence)</dt>
          <dd>{name}</dd>
          {canRequest && !waiting('name') ? (
            <button type='button' className={`${quiet} justify-self-start`} onClick={() => setAsking(asking === 'name' ? null : 'name')}>
              Ask to correct my name
            </button>
          ) : null}
        </div>
        <div className='grid gap-1'>
          <dt className='text-sm text-dim'>Phone number you sign in with</dt>
          <dd className='font-mono'><HiddenNumber value={phone} /></dd>
          {canRequest && !waiting('phone') ? (
            <button type='button' className={`${quiet} justify-self-start`} onClick={() => setAsking(asking === 'phone' ? null : 'phone')}>
              Ask to change my number
            </button>
          ) : null}
        </div>
      </dl>

      {asking ? (
        <ReviewBeforeSend><form action={askAction} className='grid gap-3 rounded-xl border border-seal/30 bg-sealsoft/60 p-4'>
          <input type='hidden' name='field' value={asking} />
          <p className='text-sm text-ink'>
            {asking === 'name'
              ? 'Your name is on your licence, policies and documents, so the person who manages access checks it against your ID first.'
              : 'Your number is how you sign in. Once approved, you sign in with the new number and your same PIN; your phones are signed out.'}
          </p>
          <label className='grid gap-1 text-sm text-dim'>
            {asking === 'name' ? 'Name as on your ID or licence' : 'New phone number'}
            <input name='to' required className={field} inputMode={asking === 'phone' ? 'tel' : 'text'} placeholder={asking === 'phone' ? '0712 345 678' : ''} maxLength={120} />
          </label>
          <label className='grid gap-1 text-sm text-dim'>
            Why it should change
            <input name='reason' required minLength={5} maxLength={300} className={field} placeholder={asking === 'name' ? 'e.g. Married, new ID issued' : 'e.g. My old line was lost'} />
          </label>
          <div className='flex flex-wrap items-center gap-3'>
            <button type='submit' disabled={askBusy} className={primary}>{askBusy ? 'Sending…' : 'Send the request'}</button>
            <button type='button' className={quiet} onClick={() => setAsking(null)}>Cancel</button>
          </div>
        </form></ReviewBeforeSend>
      ) : null}
      <Receipt result={askResult} />

      {requests.length ? (
        <ul className='grid gap-2'>
          {requests.map((r) => (
            <li key={r.id} className='flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink'>
              <span>
                {r.field === 'name' ? 'Name' : 'Number'} to <strong className={r.field === 'phone' ? 'font-mono' : ''}>{r.to}</strong>
                {r.note ? <span className='text-dim'> · {r.note}</span> : null}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.status === 'Approved' ? 'bg-sealsoft text-seal' : r.status === 'Declined' ? 'bg-red-50 text-red-700' : 'bg-ink/5 text-ink'}`}>
                {STATUS_WORDS[r.status]}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <ReviewBeforeSend><form action={emailAction} className='grid gap-2 sm:max-w-md'>
        <label className='grid gap-1 text-sm text-dim'>
          Work email (optional, for documents and replies; you never sign in with it)
          <input name='email' type='email' defaultValue={email ?? ''} className={field} placeholder='name@agency.co.ke' autoComplete='email' />
        </label>
        <div className='flex flex-wrap items-center gap-3'>
          {/* Only changes the person's own record: nothing goes to anyone, so no review step. */}
          <button type='submit' data-no-review disabled={emailBusy} className={primary}>{emailBusy ? 'Saving…' : 'Save email'}</button>
          <Receipt result={emailResult} />
        </div>
      </form></ReviewBeforeSend>
    </div>
  );
}

/** Governance: correction requests waiting in this person's regions. */
export function CorrectionRequests({ requests }: { requests: ProfileChangeRequest[] }) {
  const [result, action, pending] = useActionState(decideCorrection, null);
  return (
    <section aria-labelledby='corrections' className='grid gap-3 rounded-2xl border border-ink/10 bg-sheet/60 p-5'>
      <h2 id='corrections' className='text-base font-semibold text-ink'>Name and number corrections</h2>
      <p className='text-sm text-ink/70'>
        Check a name against the person’s ID or licence before approving. A number change keeps their record and PIN and signs out their phones.
        You cannot decide your own request.
      </p>
      {requests.length === 0 ? <p className='text-sm text-ink/70'>No requests waiting.</p> : null}
      <ul className='grid gap-3'>
        {requests.map((r) => (
          <li key={r.id} className='rounded-xl border border-line bg-white p-4'>
            <p className='text-[15px] text-ink'>
              <strong>{r.userName}</strong> asks to change their {r.field === 'name' ? 'name' : 'sign-in number'} from{' '}
              <span className={r.field === 'phone' ? 'font-mono' : ''}>{r.from}</span> to{' '}
              <strong className={r.field === 'phone' ? 'font-mono' : ''}>{r.to}</strong>.
            </p>
            <p className='mt-1 text-sm text-dim'>Reason: {r.reason}</p>
            <ReviewBeforeSend><form action={action} className='mt-3 flex flex-wrap items-end gap-2'>
              <input type='hidden' name='id' value={r.id} />
              <label className='grid min-w-[220px] flex-1 gap-1 text-sm text-dim'>
                Note if you decline (shown to them)
                <input name='note' maxLength={300} className={field} placeholder='e.g. Bring your new ID to the office' />
              </label>
              <button type='submit' name='decision' value='approve' disabled={pending} className={primary}>Approve</button>
              <button type='submit' name='decision' value='decline' disabled={pending} className={quiet}>Decline</button>
            </form></ReviewBeforeSend>
          </li>
        ))}
      </ul>
      <Receipt result={result} />
    </section>
  );
}
