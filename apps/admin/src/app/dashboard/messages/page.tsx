import Link from 'next/link';
import { DomainModulePage, formatDateTime } from '@insuros/ui';
import { TOPIC_LABELS, replyDueAt, type InboxLine, type InboxStanding } from '@insuros/domain';
import { MessagingService } from '@insuros/services';
import { getAuthState } from '@/lib/auth/session';
import { messengerFor } from '@/lib/messaging';
import { requirePageAccess } from "@/lib/auth/page-access";

export const metadata = { title: 'Messages' };
export const dynamic = 'force-dynamic';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'waiting', label: 'Waiting on you' },
  { id: 'customers', label: 'Customers' },
  { id: 'colleagues', label: 'Colleagues' }
] as const;

const STANDING: Record<InboxStanding, { label: string; tone: string }> = {
  'escalated-to-you': { label: 'Escalated to you', tone: 'bg-red-50 text-red-800' },
  'waiting-on-you': { label: 'Waiting on you', tone: 'bg-warnink/10 text-warnink' },
  'waiting-on-them': { label: 'Answered', tone: 'bg-sealsoft text-seal' },
  watching: { label: 'In your area', tone: 'bg-paper text-dim' }
};

function Row({ line }: { line: InboxLine }) {
  const c = line.conversation;
  const due = replyDueAt(c);
  const who = c.kind === 'customer' ? `${c.customerName ?? 'Customer'}${c.ownerName ? `, with ${c.ownerName}` : ', not yet assigned'}` : c.participants.map((p) => p.name).join(', ');
  return (
    <li>
      <Link href={`/dashboard/messages/${c.id}`} className='block rounded-2xl border border-line bg-sheet p-4 transition hover:border-seal/50 focus-visible:outline-2 focus-visible:outline-seal'>
        <div className='flex flex-wrap items-center gap-2'>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STANDING[line.standing].tone}`}>{STANDING[line.standing].label}</span>
          {line.late > 0 && line.standing !== 'waiting-on-them' ? <span className='rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-800'>Late</span> : null}
          <span className='text-xs text-dim'>{c.kind === 'customer' ? 'Customer' : 'Colleagues'} · {TOPIC_LABELS[c.topic]}{c.reference ? ` ${c.reference}` : ''}</span>
          {c.status === 'closed' ? <span className='text-xs text-dim'>Closed</span> : null}
        </div>
        <p className='mt-1.5 text-[15px] font-medium text-ink'>{c.subject}</p>
        <p className='mt-0.5 text-sm text-dim'>
          {who}. Last message {formatDateTime(c.lastMessageAt)}.
          {due && line.standing !== 'waiting-on-them' ? ` Reply due ${formatDateTime(due.toISOString())}.` : ''}
        </p>
      </Link>
    </li>
  );
}

export default async function MessagesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePageAccess("/dashboard/messages");
  const params = await searchParams;
  const filter = FILTERS.find((candidate) => candidate.id === params.show)?.id ?? 'all';
  const state = await getAuthState();
  const lines = state.status === 'active' ? await new MessagingService().inbox(messengerFor(state.principal).viewer) : [];
  const shown = lines.filter((line) =>
    filter === 'waiting'
      ? line.standing === 'waiting-on-you' || line.standing === 'escalated-to-you'
      : filter === 'customers'
        ? line.conversation.kind === 'customer'
        : filter === 'colleagues'
          ? line.conversation.kind === 'colleagues'
          : true
  );

  return (
    <DomainModulePage
      title='Messages'
      description='Customers and colleagues in one place. A customer writes through their private link; if nobody answers within 4 hours it goes to the supervisor, then to the administrator.'
      actions={
        <Link href='/dashboard/messages/new' className='inline-flex items-center justify-center rounded-lg bg-seal px-4 py-2 text-sm font-semibold text-white hover:bg-sealdark'>
          New message
        </Link>
      }
    >
      <nav aria-label='Show' className='mb-5 flex flex-wrap gap-2'>
        {FILTERS.map((option) =>
          option.id === filter ? (
            <span key={option.id} aria-current='page' className='rounded-full bg-seal px-3.5 py-1.5 text-sm font-medium text-white'>{option.label}</span>
          ) : (
            <Link key={option.id} href={`/dashboard/messages?show=${option.id}`} className='rounded-full border border-line bg-sheet px-3.5 py-1.5 text-sm font-medium text-dim hover:border-seal/50 hover:text-seal'>
              {option.label}
            </Link>
          )
        )}
      </nav>
      {shown.length === 0 ? (
        <p className='rounded-2xl border border-line bg-sheet p-5 text-sm text-ink'>
          Nothing here. Start a conversation with a customer or a colleague, or share the contact page so customers can reach you: <span className='font-mono text-[13px]'>/contact</span>.
        </p>
      ) : (
        <ul className='grid gap-3'>{shown.map((line) => <Row key={line.conversation.id} line={line} />)}</ul>
      )}
    </DomainModulePage>
  );
}
