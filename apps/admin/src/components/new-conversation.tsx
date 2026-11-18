'use client';

import { useActionState, useState } from 'react';
import { DIRECTORY_LABELS, MESSAGE_MAX, type DirectoryGroup } from '@insuros/domain';
import type { ActionResult } from '@/lib/action-result';
import { startColleagueConversation, startCustomerConversation } from '@/app/dashboard/messages/actions';
import { AiHelpBar } from './message-composer';
import { ShareButton } from './value/share-button';

const field = 'mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-[15px] text-ink outline-none focus:border-seal focus:ring-2 focus:ring-seal/20';
const label = 'block text-sm font-medium text-ink';
const hint = 'mt-0.5 block text-xs font-normal text-dim';

function Body({ audience, subject, onAssisted }: { audience: 'customer' | 'colleague'; subject: string; onAssisted: () => void }) {
  const [text, setText] = useState('');
  return (
    <div className='grid gap-2'>
      <label className={label}>
        Message
        <textarea name='body' required rows={5} maxLength={MESSAGE_MAX} value={text} onChange={(e) => setText(e.target.value)} className={field} />
      </label>
      <AiHelpBar tasks={['draft-reply', 'improve', 'translate']} audience={audience} subject={subject} getDraft={() => text} onText={(value) => (setText(value), onAssisted())} />
    </div>
  );
}

function Topic() {
  return (
    <div className='grid gap-4 sm:grid-cols-2'>
      <label className={label}>
        About
        <select name='topic' defaultValue='general' className={field}>
          <option value='claim'>A claim</option>
          <option value='policy'>A policy</option>
          <option value='general'>Something else</option>
        </select>
      </label>
      <label className={label}>
        Claim or policy number
        <span className={hint}>Optional</span>
        <input name='reference' maxLength={40} autoComplete='off' className={field} />
      </label>
    </div>
  );
}

export function NewCustomerConversation() {
  const [result, action, pending] = useActionState(startCustomerConversation, null);
  const [subject, setSubject] = useState('');
  const [assisted, setAssisted] = useState(false);
  if (result?.ok && result.link) {
    return (
      <div className='grid max-w-2xl gap-3 rounded-2xl border border-seal/30 bg-sealsoft p-5 text-sm text-ink'>
        <p><strong>{result.title}.</strong> {result.message}</p>
        <p className='break-all rounded-lg bg-white p-3 font-mono text-[13px]'>{result.link}</p>
        <div className='flex flex-wrap gap-3'>
          <ShareButton tone='dark' title='Your conversation with us' text='Read and reply to your insurance agent here:' url={result.link} />
          <a href={`/dashboard/messages/${result.reference}`} className='rounded-lg px-3 py-2 font-medium text-seal underline underline-offset-2'>Open the conversation</a>
        </div>
      </div>
    );
  }
  return (
    <form action={action} className='grid max-w-2xl gap-4 rounded-2xl border border-line bg-sheet p-5'>
      <input type='hidden' name='aiAssisted' value={assisted ? 'yes' : 'no'} />
      <div className='grid gap-4 sm:grid-cols-2'>
        <label className={label}>
          Customer&apos;s name
          <input name='customerName' required minLength={2} maxLength={120} autoComplete='off' className={field} />
        </label>
        <label className={label}>
          Phone or email to call back
          <span className={hint}>Optional; seen only by staff on this conversation</span>
          <input name='customerContact' maxLength={80} autoComplete='off' className={field} />
        </label>
      </div>
      <label className={label}>
        Subject
        <input name='subject' required minLength={3} maxLength={120} value={subject} onChange={(e) => setSubject(e.target.value)} className={field} />
      </label>
      <Topic />
      <Body audience='customer' subject={subject} onAssisted={() => setAssisted(true)} />
      <div className='flex flex-wrap items-center gap-3'>
        <button type='submit' disabled={pending} className='rounded-lg bg-seal px-5 py-2.5 text-sm font-semibold text-white hover:bg-sealdark disabled:opacity-60'>{pending ? 'Starting…' : 'Start and get the customer link'}</button>
        {result && !result.ok ? <span role='status' className='text-sm text-red-800'>{result.message}</span> : null}
      </div>
    </form>
  );
}

export function NewColleagueConversation({ people }: { people: { userId: string; name: string; group: DirectoryGroup; detail: string }[] }) {
  const [result, action, pending] = useActionState<ActionResult | null, FormData>(startColleagueConversation, null);
  const [subject, setSubject] = useState('');
  const [assisted, setAssisted] = useState(false);
  if (people.length === 0) {
    return <p className='max-w-2xl rounded-2xl border border-line bg-sheet p-5 text-sm text-ink'>Nobody is listed in your line of the hierarchy yet. An administrator can appoint you to a region and level under Governance.</p>;
  }
  const groups = [...new Set(people.map((person) => person.group))];
  return (
    <form action={action} className='grid max-w-2xl gap-4 rounded-2xl border border-line bg-sheet p-5'>
      <input type='hidden' name='aiAssisted' value={assisted ? 'yes' : 'no'} />
      <fieldset>
        <legend className={label}>To</legend>
        <div className='mt-2 grid gap-3'>
          {groups.map((group) => (
            <div key={group}>
              <p className='text-xs font-semibold text-dim'>{DIRECTORY_LABELS[group]}</p>
              <div className='mt-1 grid gap-1.5 sm:grid-cols-2'>
                {people.filter((person) => person.group === group).map((person) => (
                  <label key={person.userId} className='flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink'>
                    <input type='checkbox' name='to' value={person.userId} className='accent-[#0f6e56]' />
                    <span className='min-w-0'>
                      {person.name}
                      <span className='block text-xs text-dim'>{person.detail}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </fieldset>
      <label className={label}>
        Subject
        <input name='subject' required minLength={3} maxLength={120} value={subject} onChange={(e) => setSubject(e.target.value)} className={field} />
      </label>
      <Topic />
      <Body audience='colleague' subject={subject} onAssisted={() => setAssisted(true)} />
      <div className='flex flex-wrap items-center gap-3'>
        <button type='submit' disabled={pending} className='rounded-lg bg-seal px-5 py-2.5 text-sm font-semibold text-white hover:bg-sealdark disabled:opacity-60'>{pending ? 'Sending…' : 'Send'}</button>
        {result && !result.ok ? <span role='status' className='text-sm text-red-800'>{result.message}</span> : null}
      </div>
    </form>
  );
}
