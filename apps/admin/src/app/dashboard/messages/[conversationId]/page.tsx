import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DomainModulePage, formatDateTime } from '@insuros/ui';
import { TOPIC_LABELS, escalationPath, findStaffRole, lateness, replyDueAt } from '@insuros/domain';
import { ClaimPhotoService, MessagingService } from '@insuros/services';
import { ClaimPhotoCapture } from '@/components/claim-photos';
import { ReplyComposer } from '@/components/message-composer';
import { CustomerLinkPanel } from '@/components/customer-link-panel';
import { getAuthState } from '@/lib/auth/session';
import { directoryForPrincipal, messengerFor } from '@/lib/messaging';
import { assignConversation, replyToConversation, setConversationStatus } from '../actions';

export const metadata = { title: 'Conversation' };
export const dynamic = 'force-dynamic';

const roleName = (roleId: string) => findStaffRole(roleId)?.name ?? roleId;

export default async function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  const state = await getAuthState();
  if (state.status !== 'active') notFound();
  const { viewer, me } = messengerFor(state.principal);
  const opened = await new MessagingService().open(conversationId, viewer);
  if (!opened.ok) notFound();
  const { conversation: c, messages } = opened.value;
  const due = replyDueAt(c);
  const late = lateness(c, new Date());
  const directory = c.kind === 'customer' ? await directoryForPrincipal(state.principal) : [];
  const photos = c.kind === 'customer' && c.topic === 'claim' ? await new ClaimPhotoService().show(c.reference ?? c.id) : [];

  return (
    <DomainModulePage
      title={c.subject}
      description={`${c.kind === 'customer' ? `With ${c.customerName ?? 'a customer'}` : `With ${c.participants.map((p) => p.name).join(', ')}`} · ${TOPIC_LABELS[c.topic]}${c.reference ? ` ${c.reference}` : ''}`}
      actions={<Link href='/dashboard/messages' className='rounded-lg px-3 py-2 text-sm font-medium text-dim hover:text-ink'>All messages</Link>}
    >
      <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]'>
        <div className='grid content-start gap-4'>
          <ol className='grid gap-3'>
            {messages.map((message) => {
              const mine = message.author.kind === 'staff' && message.author.id === me.userId;
              const customer = message.author.kind === 'customer';
              return (
                <li key={message.id} className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${mine ? 'justify-self-end bg-seal text-white' : customer ? 'bg-sheet text-ink ring-1 ring-warnink/30' : 'bg-sheet text-ink ring-1 ring-line'}`}>
                  <p className={`text-xs font-semibold ${mine ? 'text-white/80' : 'text-dim'}`}>
                    {mine ? 'You' : customer ? `${message.author.name} (customer)` : message.author.name} · {formatDateTime(message.createdAt)}
                    {message.aiAssisted ? ' · written with AI help' : ''}
                  </p>
                  <p className='mt-1 whitespace-pre-wrap break-words'>{message.body}</p>
                </li>
              );
            })}
          </ol>
          <ReplyComposer conversationId={c.id} action={replyToConversation} closed={c.status === 'closed'} />
          {photos.length > 0 ? (
            <section aria-labelledby='evidence' className='grid gap-3 rounded-2xl border border-line bg-sheet p-4'>
              <h2 id='evidence' className='font-display text-[20px] text-ink'>Photo evidence ({photos.length})</h2>
              <ul className='grid gap-3 sm:grid-cols-2'>
                {photos.map(({ photo, viewUrl, originalUrl, integrity }) => (
                  <li key={photo.id} className='grid gap-1.5 rounded-xl border border-line bg-white p-3 text-sm'>
                    {viewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={viewUrl} alt={photo.slot ?? 'Claim photo'} className='aspect-[4/3] w-full rounded-lg bg-paper object-cover' />
                    ) : null}
                    <p className='font-medium text-ink'>{photo.slot} · {integrity.verdict} evidence ({integrity.score}%)</p>
                    <p className='text-xs text-dim'>
                      Taken {formatDateTime(photo.capturedAt)}, received {formatDateTime(photo.receivedAt)} from {photo.uploadedBy?.name ?? 'unknown'}.
                      {photo.latitude !== undefined ? ` Location within ${photo.geoAccuracyMeters} m.` : ' No location.'} Fingerprint {photo.sha256.slice(0, 12)}…
                    </p>
                    {originalUrl ? <a href={originalUrl} target='_blank' rel='noopener noreferrer' className='text-xs font-medium text-seal underline underline-offset-2'>Open the original (evidence)</a> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {c.kind === 'customer' && c.topic === 'claim' && c.status === 'open' ? (
            <ClaimPhotoCapture
              endpoint='/api/photos'
              fields={{ conversationId: c.id }}
              initialKind={photos[0]?.photo.claimKind ?? 'motor'}
              existing={photos.map((p) => ({ slot: p.photo.slot ?? '', viewUrl: p.viewUrl, onTheSpot: p.photo.liveCapture }))}
            />
          ) : null}
        </div>

        <aside className='grid content-start gap-3 text-sm'>
          {due ? (
            <div className={`rounded-2xl border p-4 ${late > 0 ? 'border-red-300 bg-red-50 text-red-900' : 'border-warnink/30 bg-warnink/5 text-ink'}`}>
              <strong>{late > 0 ? 'Late. ' : ''}Reply due {formatDateTime(due.toISOString())}.</strong>
              {c.kind === 'customer' ? <p className='mt-1'>If nobody answers: {escalationPath(c.topic, roleName)}.</p> : null}
            </div>
          ) : null}

          {c.kind === 'customer' ? (
            <>
              <div className='rounded-2xl border border-line bg-sheet p-4'>
                <p className='font-medium text-ink'>{c.customerName}</p>
                {c.customerContact ? <p className='mt-0.5 text-dim'>Call back on {c.customerContact}</p> : null}
                <p className='mt-2 text-dim'>Answered by {c.ownerName ?? 'nobody yet: assign someone'}.</p>
                <form action={assignConversation} className='mt-2 flex flex-wrap gap-2'>
                  <input type='hidden' name='conversationId' value={c.id} />
                  <select name='ownerUserId' defaultValue={c.ownerUserId ?? me.userId} className='min-w-0 flex-1 rounded-lg border border-ink/15 bg-white px-2 py-1.5 text-sm'>
                    <option value={me.userId}>Me ({me.name})</option>
                    {directory.map((entry) => (
                      <option key={entry.appointment.userId} value={entry.appointment.userId}>{entry.appointment.userName}</option>
                    ))}
                  </select>
                  <button type='submit' className='rounded-lg border border-ink/15 px-3 py-1.5 text-sm font-medium text-ink hover:border-seal/50 hover:text-seal'>Assign</button>
                </form>
              </div>
              <CustomerLinkPanel conversationId={c.id} />
            </>
          ) : null}

          <form action={setConversationStatus} className='rounded-2xl border border-line bg-sheet p-4'>
            <input type='hidden' name='conversationId' value={c.id} />
            <input type='hidden' name='status' value={c.status === 'open' ? 'closed' : 'open'} />
            <p className='text-dim'>{c.status === 'open' ? 'Done? Close it. A customer who writes again reopens it.' : 'This conversation is closed.'}</p>
            <button type='submit' className='mt-2 rounded-lg border border-ink/15 px-3 py-1.5 text-sm font-medium text-ink hover:border-seal/50 hover:text-seal'>
              {c.status === 'open' ? 'Close conversation' : 'Reopen'}
            </button>
          </form>
        </aside>
      </div>
    </DomainModulePage>
  );
}
