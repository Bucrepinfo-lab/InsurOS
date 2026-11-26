'use client';

import { useActionState, useRef, useState, useTransition } from 'react';
import { AI_TASK_LABELS, MESSAGE_MAX, type AiTask } from '@insuros/domain';
import type { ActionResult } from '@/lib/action-result';
import { aiHelp } from '@/app/dashboard/messages/actions';
import { ReviewBeforeSend } from '@/components/review-before-send';
import { SpeakButton } from '@/components/speak-button';

const box =
  'mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-[15px] leading-relaxed text-ink outline-none transition focus:border-seal focus:ring-2 focus:ring-seal/20';

/**
 * The writing box with AI help. The helper only fills the box; the person
 * reads, edits and presses Send. A message written with help is marked so.
 */
export function AiHelpBar({
  tasks,
  getDraft,
  onText,
  conversationId,
  subject,
  audience
}: {
  tasks: AiTask[];
  getDraft: () => string;
  onText: (text: string, task: AiTask) => void;
  conversationId?: string;
  subject?: string;
  audience?: 'customer' | 'colleague';
}) {
  const [note, setNote] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const run = (task: AiTask) =>
    startTransition(async () => {
      setNote(null);
      try {
        const result = await aiHelp({ task, conversationId, draft: getDraft(), subject, audience });
        if (!result.ok) return setNote(result.error);
        onText(result.text, task);
        setNote(result.note ?? (task === 'summarise' ? 'Summary below. It is for you; it is not sent.' : 'Check it, change it if needed, then send.'));
      } catch {
        setNote('The helper is not available right now.');
      }
    });
  return (
    <div className='flex flex-wrap items-center gap-2'>
      {tasks.map((task) => (
        <button
          key={task}
          type='button'
          disabled={busy}
          onClick={() => run(task)}
          className='rounded-full border border-seal/30 bg-sealsoft px-3 py-1.5 text-xs font-semibold text-seal transition hover:border-seal disabled:opacity-60'
        >
          {busy ? 'Working…' : AI_TASK_LABELS[task]}
        </button>
      ))}
      {note ? (
        <span role='status' className='text-xs text-dim'>
          {note}
        </span>
      ) : null}
    </div>
  );
}

export function ReplyComposer({
  conversationId,
  action,
  closed
}: {
  conversationId: string;
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  closed: boolean;
}) {
  const [result, formAction, pending] = useActionState(action, null);
  const [text, setText] = useState('');
  const [assisted, setAssisted] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const form = useRef<HTMLFormElement>(null);

  if (closed) return <p className='rounded-xl border border-line bg-sheet p-4 text-sm text-dim'>This conversation is closed. Reopen it to reply.</p>;

  return (
    <ReviewBeforeSend><form
      ref={form}
      action={async (formData) => {
        await formAction(formData);
        setText('');
        setAssisted(false);
      }}
      className='grid gap-3 rounded-2xl border border-line bg-sheet p-4'
    >
      <input type='hidden' name='conversationId' value={conversationId} />
      <input type='hidden' name='aiAssisted' value={assisted ? 'yes' : 'no'} />
      <label className='block text-sm font-medium text-ink'>
        Reply
        <textarea name='body' required rows={4} maxLength={MESSAGE_MAX} value={text} onChange={(event) => setText(event.target.value)} className={box} />
      </label>
      <SpeakButton field='body' maxLength={MESSAGE_MAX} />
      <AiHelpBar
        tasks={['draft-reply', 'improve', 'translate', 'summarise']}
        conversationId={conversationId}
        getDraft={() => text}
        onText={(value, task) => {
          if (task === 'summarise') return setSummary(value);
          setText(value);
          setAssisted(true);
        }}
      />
      {summary ? <pre className='whitespace-pre-wrap rounded-xl bg-paper p-3 font-sans text-sm text-ink'>{summary}</pre> : null}
      <div className='flex flex-wrap items-center gap-3'>
        <button type='submit' disabled={pending || !text.trim()} className='rounded-lg bg-seal px-5 py-2.5 text-sm font-semibold text-white hover:bg-sealdark disabled:opacity-60'>
          {pending ? 'Sending…' : 'Send'}
        </button>
        {result && !result.ok ? <span role='status' className='text-sm text-red-800'>{result.message}</span> : null}
      </div>
    </form></ReviewBeforeSend>
  );
}
