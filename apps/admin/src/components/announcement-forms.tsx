'use client';

import { useActionState } from 'react';
import { archiveAnnouncement, postAnnouncement } from '@/app/dashboard/customers/announcements/actions';
import { ReviewBeforeSend } from '@/components/review-before-send';
import { SpeakButton } from '@/components/speak-button';

const field = 'mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-[15px] text-ink outline-none focus:border-seal focus:ring-2 focus:ring-seal/20';
const label = 'block text-sm font-medium text-ink';

export function AnnouncementForm() {
  const [result, action, pending] = useActionState(postAnnouncement, null);
  return (
    <ReviewBeforeSend><form action={action} className='grid max-w-2xl gap-4 rounded-2xl border border-line bg-sheet p-5'>
      <label className={label}>
        Headline
        <input name='headline' required minLength={4} maxLength={90} placeholder='Renew before 31/12 and keep your no-claim discount' className={field} />
      </label>
      <label className={label}>
        Message
        <textarea name='body' required minLength={10} maxLength={1000} rows={4} className={field} />
      </label>
      <SpeakButton field='body' maxLength={1000} />
      <div className='grid gap-4 sm:grid-cols-2'>
        <label className={label}>
          Link (optional)
          <input name='link' type='url' maxLength={300} placeholder='https://' className={field} />
        </label>
        <label className={label}>
          Show until (optional)
          <input name='until' type='date' className={field} />
        </label>
      </div>
      <div className='flex flex-wrap items-center gap-3'>
        <button type='submit' disabled={pending} className='rounded-lg bg-seal px-5 py-2.5 text-sm font-semibold text-white hover:bg-sealdark disabled:opacity-60'>
          {pending ? 'Posting…' : 'Post to customers'}
        </button>
        {result ? <span role='status' className={`text-sm ${result.ok ? 'text-seal' : 'text-red-800'}`}><strong>{result.title}.</strong> {result.message}</span> : null}
      </div>
    </form></ReviewBeforeSend>
  );
}

export function TakeDown({ id }: { id: string }) {
  const [result, action, pending] = useActionState(archiveAnnouncement, null);
  return (
    <form action={action} className='flex items-center gap-2'>
      <input type='hidden' name='id' value={id} />
      <button type='submit' disabled={pending} className='rounded-lg border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink hover:border-red-300 hover:text-red-800 disabled:opacity-60'>
        {pending ? 'Taking down…' : 'Take down'}
      </button>
      {result && !result.ok ? <span role='status' className='text-xs text-red-800'>{result.message}</span> : null}
    </form>
  );
}
