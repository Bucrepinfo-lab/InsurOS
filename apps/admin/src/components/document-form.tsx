'use client';

import Link from 'next/link';
import { useRef, useState, useTransition, type FormEvent } from 'react';
import {
  DOCUMENT_FIELD_LABELS,
  DOCUMENT_TYPE_LABELS,
  ENTRY_DOCUMENT_TYPES,
  documentFieldKeys,
  suggestDocumentFields,
  type EntryDocumentType
} from '@insuros/domain';
import type { ActionResult } from '@/lib/action-result';
import { recordDocument } from '@/app/dashboard/record-actions';
import { ReviewBeforeSend } from '@/components/review-before-send';

const field =
  'mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-[15px] text-ink outline-none transition focus:border-seal focus:ring-2 focus:ring-seal/20';
const label = 'block text-sm font-medium text-ink';
const hint = 'mt-1 block text-xs font-normal text-dim';

type ReadState =
  | { kind: 'idle' }
  | { kind: 'reading' }
  | { kind: 'done'; filled: number }
  | { kind: 'failed' };

/**
 * Read the text on a photo in this browser. The photo is not sent anywhere.
 * Tesseract.js 7, English + Kiswahili; the engine and models are served from
 * our own site (/ocr, copied at build by scripts/copy-ocr-assets.mjs) rather
 * than a third-party CDN (owner standing rule 25/11/26).
 */
async function readPhoto(file: File): Promise<string> {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker(['eng', 'swa'], 1, {
    workerPath: '/ocr/worker.min.js',
    corePath: '/ocr',
    langPath: '/ocr/lang'
  });
  try {
    const result = await worker.recognize(file);
    return result.data.text ?? '';
  } finally {
    await worker.terminate();
  }
}

/**
 * Record a claim document. The person types the details, or takes a photo and
 * lets this phone or computer read it, then checks every value before saving.
 * Only the confirmed details are saved; the photo stays on the device.
 */
export function DocumentForm({ claims }: { claims: string[] }) {
  const [type, setType] = useState<EntryDocumentType>('RepairInvoice');
  const [values, setValues] = useState<Record<string, string>>({});
  const [suggested, setSuggested] = useState<string[]>([]);
  const [read, setRead] = useState<ReadState>({ kind: 'idle' });
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const photo = useRef<HTMLInputElement>(null);
  const keys = documentFieldKeys(type);

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    setRead({ kind: 'reading' });
    try {
      const found = suggestDocumentFields(type, await readPhoto(file));
      // Fill only the details the person has not typed already.
      const fresh = Object.keys(found).filter((key) => !(values[key] ?? '').trim());
      setValues((current) => {
        const next = { ...current };
        for (const key of fresh) next[key] = found[key] ?? '';
        return next;
      });
      setSuggested((current) => [...new Set([...current, ...fresh])]);
      setRead({ kind: 'done', filled: fresh.length });
    } catch {
      setRead({ kind: 'failed' });
    } finally {
      if (photo.current) photo.current.value = '';
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        const outcome = await recordDocument(null, formData);
        setResult(outcome);
        if (outcome.ok) {
          setValues({});
          setSuggested([]);
          setRead({ kind: 'idle' });
        }
      } catch {
        setResult({ ok: false, title: 'Not saved', message: 'Something went wrong. Check your connection and try again.' });
      }
    });
  }

  return (
    <div className='grid max-w-2xl gap-4'>
      {result ? (
        <div
          role='status'
          className={`rounded-xl border px-4 py-3 text-sm ${
            result.ok ? 'border-seal/30 bg-sealsoft text-ink' : 'border-red-300 bg-red-50 text-red-900'
          }`}
        >
          <p>
            <strong>{result.title}.</strong> {result.message}
            {result.reference ? <span className='ml-2 font-mono text-[12.5px] text-dim'>{result.reference}</span> : null}
          </p>
          {result.ok ? (
            <p className='mt-1.5'>
              <Link href='/dashboard/operations/documents' className='font-medium text-seal underline underline-offset-2'>
                See the documents
              </Link>{' '}
              or record another below.
            </p>
          ) : null}
        </div>
      ) : null}

      <ReviewBeforeSend><form onSubmit={onSubmit} className='grid gap-5 rounded-2xl border border-line bg-sheet p-5 sm:p-7'>
        <label className={label}>
          Kind of document
          <select
            name='documentType'
            value={type}
            onChange={(event) => {
              setType(event.target.value as EntryDocumentType);
              setValues({});
              setSuggested([]);
              setRead({ kind: 'idle' });
            }}
            className={field}
          >
            {ENTRY_DOCUMENT_TYPES.map((option) => (
              <option key={option} value={option}>
                {DOCUMENT_TYPE_LABELS[option]}
              </option>
            ))}
          </select>
        </label>

        {claims.length > 0 ? (
          <label className={label}>
            Claim
            <span className={hint}>Leave as “No claim yet” if the document is not for a claim.</span>
            <select name='claimReference' defaultValue='' className={field}>
              <option value=''>No claim yet</option>
              {claims.map((claim) => (
                <option key={claim} value={claim}>
                  {claim}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className='rounded-xl border border-dashed border-seal/40 bg-sealsoft/50 p-4'>
          <p className='text-sm font-medium text-ink'>Save typing: read it from a photo</p>
          <p className='mt-1 text-xs text-dim'>
            This phone or computer reads the photo. The photo is not uploaded or kept; only the details you confirm are
            saved. The first reading downloads the reader and can take a minute.
          </p>
          <input
            ref={photo}
            type='file'
            accept='image/*'
            capture='environment'
            aria-label='Photo of the document'
            disabled={read.kind === 'reading'}
            onChange={(event) => void onPhoto(event.target.files?.[0])}
            className='mt-3 block w-full text-sm text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-seal file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white'
          />
          <p role='status' className='mt-2 min-h-5 text-sm text-ink'>
            {read.kind === 'reading' ? 'Reading the photo…' : null}
            {read.kind === 'done' && read.filled > 0
              ? `Filled ${read.filled} ${read.filled === 1 ? 'detail' : 'details'} below. Check each one against the paper.`
              : null}
            {read.kind === 'done' && read.filled === 0 ? 'Nothing could be read with confidence. Type the details below.' : null}
            {read.kind === 'failed' ? 'The photo could not be read on this device. Type the details below.' : null}
          </p>
        </div>

        {keys.map((key) => (
          <label key={key} className={label}>
            {DOCUMENT_FIELD_LABELS[key] ?? key}
            {suggested.includes(key) ? <span className='ml-2 rounded bg-warnink/10 px-1.5 py-0.5 text-xs font-normal text-warnink'>read from the photo: check it</span> : null}
            <input
              name={`field.${key}`}
              value={values[key] ?? ''}
              onChange={(event) => {
                const value = event.target.value;
                setValues((current) => ({ ...current, [key]: value }));
              }}
              maxLength={120}
              autoComplete='off'
              inputMode={key === 'amount' ? 'decimal' : undefined}
              className={field}
            />
          </label>
        ))}
        <input type='hidden' name='readOnDevice' value={suggested.length > 0 ? 'yes' : 'no'} />

        <p className='text-xs text-dim'>A detail left empty sends the record to review instead of blocking you.</p>

        <div className='flex flex-wrap items-center gap-3'>
          <button
            type='submit'
            disabled={pending || read.kind === 'reading'}
            className='rounded-lg bg-seal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sealdark disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal'
          >
            {pending ? 'Saving…' : 'Save document'}
          </button>
          <Link href='/dashboard/operations/documents' className='rounded-lg px-3 py-2 text-sm font-medium text-dim hover:text-ink'>
            Cancel
          </Link>
        </div>
      </form></ReviewBeforeSend>
    </div>
  );
}
