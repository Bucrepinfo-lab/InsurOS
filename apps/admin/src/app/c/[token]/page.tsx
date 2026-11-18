import { notFound } from 'next/navigation';
import { formatDateTime } from '@insuros/ui';
import { CUSTOMER_REPLY_HOURS } from '@insuros/domain';
import { MessagingService } from '@insuros/services';
import { hashCustomerToken, isCustomerToken } from '@/lib/customer-link';
import { CustomerReplyForm } from './reply-form';

export const metadata = { title: 'Your conversation', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

/**
 * The customer's own page: their conversation with the agency, reached by a
 * private link, no account needed. Staff names are shown so they know who is
 * helping them; nothing else from the workspace is visible.
 */
export default async function CustomerConversationPage({
  params,
  searchParams
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { token } = await params;
  const { new: isNew } = await searchParams;
  if (!isCustomerToken(token)) notFound();
  const found = await new MessagingService().forCustomer(hashCustomerToken(token));
  if (!found) notFound();
  const { conversation: c, messages } = found;

  return (
    <main className='min-h-screen bg-paper px-4 py-8 sm:py-12'>
      <div className='mx-auto grid max-w-2xl gap-5'>
        <header>
          <p className='text-sm text-dim'>Your conversation with us</p>
          <h1 className='mt-1 font-display text-[28px] leading-tight text-ink'>{c.subject}</h1>
          <p className='mt-1 text-sm text-dim'>
            {c.ownerName ? `${c.ownerName} is looking after you.` : 'A supervisor will pick this up and reply.'} We reply within {CUSTOMER_REPLY_HOURS} hours;
            if your agent cannot, their supervisor will.
          </p>
        </header>
        {isNew ? (
          <p className='rounded-2xl border border-seal/30 bg-sealsoft p-4 text-sm text-ink'>
            <strong>We have your message.</strong> Keep this page: bookmark it or add it to your home screen. It is private to you, and the reply will appear here.
          </p>
        ) : null}
        <ol className='grid gap-3'>
          {messages.map((message) => {
            const mine = message.author.kind === 'customer';
            return (
              <li key={message.id} className={`max-w-[88%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${mine ? 'justify-self-end bg-seal text-white' : 'bg-sheet text-ink ring-1 ring-line'}`}>
                <p className={`text-xs font-semibold ${mine ? 'text-white/80' : 'text-dim'}`}>
                  {mine ? 'You' : message.author.name} · {formatDateTime(message.createdAt)}
                </p>
                <p className='mt-1 whitespace-pre-wrap break-words'>{message.body}</p>
              </li>
            );
          })}
        </ol>
        <CustomerReplyForm token={token} />
        <p className='text-xs text-dim'>Do not share this link: anyone who has it can read this conversation. If you think someone else has it, ask your agent for a new one.</p>
      </div>
    </main>
  );
}
