import { notFound } from 'next/navigation';
import { formatDateTime } from '@insuros/ui';
import { clockFor, t } from '@insuros/domain';
import { ClaimPhotoService, DocumentService, MessagingService } from '@insuros/services';
import { SignDeclaration } from '@/components/sign-declaration';
import { ClaimPhotoCapture } from '@/components/claim-photos';
import { hashCustomerToken, isCustomerToken } from '@/lib/customer-link';
import { customerLanguage } from '@/lib/customer-language';
import { LanguageSwitch } from '@/components/language-switch';
import { ThemeToggle } from '@/components/theme-toggle';
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
  const { new: isNew, lang: asked } = await searchParams;
  const lang = await customerLanguage(asked);
  const clock = clockFor(undefined);
  if (!isCustomerToken(token)) notFound();
  const found = await new MessagingService().forCustomer(hashCustomerToken(token));
  if (!found) notFound();
  const { conversation: c, messages } = found;
  const photos = c.topic === 'claim' ? await new ClaimPhotoService().show(c.reference ?? c.id) : [];
  const signatures = c.topic === 'claim' ? await new DocumentService().signaturesFor(c.id) : [];

  return (
    <main className='min-h-screen bg-paper px-4 py-8 sm:py-12'>
      <div className='mx-auto grid max-w-2xl gap-5'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <LanguageSwitch current={lang} languages={clock.languages} path={`/c/${token}`} />
          <ThemeToggle />
        </div>
        <header lang={lang}>
          <p className='text-sm text-dim'>{t('conversationTitle', lang)}</p>
          <h1 className='mt-1 font-display text-[28px] leading-tight text-ink'>{c.subject}</h1>
          <p className='mt-1 text-sm text-dim'>
            {c.ownerName ? `${c.ownerName} ${t('lookingAfter', lang)}` : t('supervisorWillReply', lang)} {t('replyPromise', lang)}
          </p>
        </header>
        {isNew ? (
          <p className='rounded-2xl border border-seal/30 bg-sealsoft p-4 text-sm text-ink'>
            {t('keepPage', lang)}
          </p>
        ) : null}
        <ol className='grid gap-3'>
          {messages.map((message) => {
            const mine = message.author.kind === 'customer';
            return (
              <li key={message.id} className={`max-w-[88%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${mine ? 'justify-self-end bg-seal text-white' : 'bg-sheet text-ink ring-1 ring-line'}`}>
                <p className={`text-xs font-semibold ${mine ? 'text-white/80' : 'text-dim'}`}>
                  {mine ? t('you', lang) : message.author.name} · {formatDateTime(message.createdAt, { timeZone: clock.timeZone })}
                </p>
                <p className='mt-1 whitespace-pre-wrap break-words'>{message.body}</p>
              </li>
            );
          })}
        </ol>
        <CustomerReplyForm token={token} words={{ label: t('writeToUs', lang), send: t('send', lang), sending: t('sending', lang) }} lang={lang} />
        {c.topic === 'claim' ? (
          <ClaimPhotoCapture
            endpoint='/api/c/photos'
            fields={{ token }}
            initialKind={photos[0]?.photo.claimKind ?? 'motor'}
            reference={c.reference ?? undefined}
            existing={photos.map((p) => ({ slot: p.photo.slot ?? '', viewUrl: p.viewUrl, onTheSpot: p.photo.liveCapture }))}
          />
        ) : null}
        {c.topic === 'claim' ? (
          <>
            <SignDeclaration token={token} signedBy={signatures.map((s) => s.signerName)} />
            <a href={`/c/${token}/claim-pack`} className='justify-self-start rounded-lg border border-ink/15 bg-sheet px-4 py-2.5 text-sm font-semibold text-ink hover:border-seal/50 hover:text-seal'>
              {t('claimPack', lang)}
            </a>
          </>
        ) : null}
        <p lang={lang} className='text-xs text-dim'>{t('doNotShare', lang)}</p>
      </div>
    </main>
  );
}
