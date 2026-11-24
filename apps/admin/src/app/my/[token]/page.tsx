import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDate, InsurOSLogo, LedgerSeal } from '@insuros/ui';
import {
  DEFAULT_COUNTRY,
  PLUS_FEATURES,
  clockFor,
  estimateVehicleValue,
  expiryStatus,
  expiryWords,
  policiesOfCustomer,
  referralCodeFor,
  selectContent,
  shareMessage,
  t,
  tf,
  type ExpiryLevel
} from '@insuros/domain';
import { getPersistence } from '@insuros/services';
import { hashCustomerToken, isCustomerToken } from '@/lib/customer-link';
import { customerLanguage } from '@/lib/customer-language';
import { plusCardCheckout, plusFor, plusRails } from '@/lib/customer-plus';
import { SITE_URL } from '@/lib/site';
import { LanguageSwitch } from '@/components/language-switch';
import { ShareCover } from '@/components/share-cover';
import { PlusPay } from '@/components/plus-pay';
import { paymentsEnabled } from '@/lib/payments-gate';
import { ThemeToggle } from '@/components/theme-toggle';
import { PayPremium } from '@/components/pay-premium';
import { digitalPurchasesAllowedHere } from '@/lib/play-app-server';
import { customerReceipts, payablePolicies, premiumPaymentsEnabled } from '@/lib/premium-pay';

export const metadata = { title: 'My cover', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const TONE: Record<ExpiryLevel, string> = {
  expired: 'bg-red-50 text-red-800',
  'due-soon': 'bg-warnink/10 text-warnink',
  'in-force': 'bg-sealsoft text-seal',
  unknown: 'bg-paper text-dim'
};
const kes = (value: number) => `KES ${Math.round(value).toLocaleString('en-GB')}`;
const ddmmyy = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(2, 4)}`;

function PlusLock({ label }: { label: string }) {
  return (
    <span className='inline-flex items-center gap-1.5 rounded-full border border-[#c9a227]/50 bg-[#c9a227]/10 px-2.5 py-0.5 text-xs font-semibold text-warnink'>
      <svg viewBox='0 0 16 16' className='h-3 w-3' aria-hidden='true'>
        <rect x='3' y='7' width='10' height='7' rx='1.5' fill='currentColor' />
        <path d='M5 7V5a3 3 0 0 1 6 0v2' fill='none' stroke='currentColor' strokeWidth='1.6' />
      </svg>
      {label}
    </span>
  );
}

/**
 * The customer's own page: what they have insured, for how much, when cover
 * ends, their claims, their agency's news, and a way to show a friend.
 * Reached by a private link, no account needed. The basics are always free;
 * My Cover Plus (KES 49 a month or KES 490 a year, first month free, founding price locked)
 * adds the value today, the news and the PDF.
 */
export default async function MyCoverPage({
  params,
  searchParams
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { token } = await params;
  const lang = await customerLanguage((await searchParams).lang);
  const clock = clockFor(DEFAULT_COUNTRY);
  if (!isCustomerToken(token)) notFound();
  const hash = hashCustomerToken(token);
  const db = getPersistence();
  const [customer] = await db.customers.findWhere((candidate) => candidate.homeAccessHash === hash);
  if (!customer) notFound();
  const plus = await plusFor(customer);
  const [payable, receipts] = await Promise.all([payablePolicies(customer), customerReceipts(customer)]);
  const canPayHere = premiumPaymentsEnabled();
  // Google Play payments policy: My Cover Plus is not sold inside the Android app (premiums are unaffected).
  const plusSoldHere = await digitalPurchasesAllowedHere();
  const [allPolicies, allClaims, content, tenants] = await Promise.all([db.policies.findAll(), db.claims.findAll(), db.marketingContent.findAll(), db.tenants.findAll()]);
  const policies = policiesOfCustomer(allPolicies, customer);
  const numbers = new Set(policies.map((policy) => policy.policyNumber));
  const claims = allClaims.filter((claim) => numbers.has(claim.policyNumber));
  const now = new Date();
  const lines = policies
    .map((policy) => ({ policy, expiry: expiryStatus(policy.expiryDate, now, clock.timeZone), value: policy.registration || policy.yearOfManufacture ? estimateVehicleValue(policy, now) : null }))
    .sort((a, b) => (a.expiry.days ?? 99999) - (b.expiry.days ?? 99999));
  const invoiced = new Set(payable.map((row) => row.policy.id));
  // Policies with an invoice are shown in "Premium due" with a Pay button; the reminder keeps the rest.
  const due = lines.filter((line) => (line.expiry.level === 'due-soon' || line.expiry.level === 'expired') && !invoiced.has(line.policy.id));
  const insuredTotal = policies.reduce((sum, policy) => sum + (policy.sumInsured ?? 0), 0);
  const news = selectContent(content, 'CustomerHome', undefined, now.toISOString()).filter((item) => item.placement === 'CustomerHome').slice(0, 5);
  const firstName = customer.name.split(' ')[0] ?? customer.name;
  const code = referralCodeFor(DEFAULT_COUNTRY, customer.id);
  const joinLink = `${SITE_URL}/join/${code}`;
  const agency = tenants[0]?.name ?? 'InsurOS';
  const money = (n: number) => `${plus.price.currency} ${n.toLocaleString('en-GB', { maximumFractionDigits: 2 })}`;
  const price = money(plus.price.monthly);
  const yearPrice = money(plus.price.yearly);
  const plusLine =
    plus.state === 'open'
      ? t('plusOpen', lang)
      : plus.state === 'trial'
        ? tf('plusTrial', lang, { n: plus.daysLeft ?? 0, date: plus.trialEndsOn ? ddmmyy(plus.trialEndsOn) : '' })
        : plus.state === 'paid'
          ? t('plusPaid', lang)
          : plusSoldHere
            ? tf('plusPaused', lang, { price })
            : t('plusNotInApp', lang);

  return (
    <main className='min-h-screen bg-paper px-4 py-6 sm:py-10'>
      <div lang={lang} className='mx-auto grid max-w-3xl gap-6'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <InsurOSLogo size={30} />
          <div className='flex flex-wrap items-center gap-2'>
            <LanguageSwitch current={lang} languages={clock.languages} path={`/my/${token}`} />
            <ThemeToggle />
          </div>
        </div>

        {/* The cover card: the screen people show their friends */}
        <section
          aria-labelledby='hello'
          className='relative isolate overflow-hidden rounded-3xl p-6 text-white shadow-[0_30px_60px_-30px_rgba(6,56,47,0.8)] sm:p-8'
          style={{
            backgroundImage: [
              'radial-gradient(420px 260px at 100% 0%, rgba(201,162,39,0.35), transparent 65%)',
              'radial-gradient(520px 320px at 0% 100%, rgba(23,163,126,0.45), transparent 65%)',
              'linear-gradient(140deg, #0f6e56 0%, #0b4a3c 55%, #101c31 100%)'
            ].join(',')
          }}
        >
          <div aria-hidden='true' className='absolute -bottom-10 -right-8 -z-10 opacity-25'>
            <LedgerSeal size={190} detailed title='' />
          </div>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <p className='text-sm text-white/70'>{t('myCover', lang)}</p>
              <h1 id='hello' className='mt-1 text-[30px] leading-tight sm:text-[36px]'>
                {t('hello', lang)}, {firstName}
              </h1>
            </div>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur'>
              <span className='seal-dot inline-block h-2 w-2 rounded-full bg-[#7fe0c0]' />
              {t('covered', lang)}
            </span>
          </div>
          <dl className='mt-8 grid grid-cols-2 gap-4'>
            <div>
              <dt className='text-xs text-white/60'>{t('itemsInsured', lang)}</dt>
              <dd className='mt-1 font-display text-[28px] leading-none'>{policies.length}</dd>
            </div>
            {insuredTotal > 0 ? (
              <div>
                <dt className='text-xs text-white/60'>{t('insuredInAll', lang)}</dt>
                <dd className='mt-1 font-mono text-[19px] leading-tight sm:text-[26px]'>{kes(insuredTotal)}</dd>
              </div>
            ) : null}
          </dl>
          <p className='mt-6 text-xs text-white/60'>{t('homeScreen', lang)}</p>
        </section>

        {payable.length > 0 ? (
          <section aria-labelledby='premium-due' className='grid gap-3'>
            <h2 id='premium-due' className='font-display text-[22px] text-ink'>{t('premiumDue', lang)}</h2>
            <ul className='grid gap-3'>
              {payable.map(({ policy, invoice, state, txnId }) => (
                <li key={invoice.reference} className='grid gap-4 rounded-2xl border border-seal/30 bg-sheet p-5 shadow-sm'>
                  <div className='flex flex-wrap items-start justify-between gap-3'>
                    <div>
                      <p className='text-xs font-semibold uppercase tracking-wider text-sealink'>
                        {invoice.kind === 'Renewal' ? t('renewalFor', lang) : t('newCoverFor', lang)}
                      </p>
                      <p className='font-display text-[20px] leading-snug text-ink'>{policy.insuredItem ?? policy.product}</p>
                      <p className='text-sm text-dim'>
                        {policy.product}, {policy.policyNumber}
                      </p>
                    </div>
                    <p className='font-mono text-[22px] font-semibold text-ink'>{kes(invoice.amount)}</p>
                  </div>
                  <dl className='grid gap-1 text-sm sm:grid-cols-3'>
                    <div><dt className='text-dim'>{t('invoiceNo', lang)}</dt><dd className='font-mono text-ink'>{invoice.invoiceNumber}</dd></div>
                    <div><dt className='text-dim'>{t('coverPeriod', lang)}</dt><dd className='text-ink'>{ddmmyy(invoice.periodStart)} – {ddmmyy(invoice.periodEnd)}</dd></div>
                    <div><dt className='text-dim'>{t('dueBy', lang)}</dt><dd className='text-ink'>{ddmmyy(invoice.dueDate)}</dd></div>
                  </dl>
                  {canPayHere || state !== 'due' ? (
                    <PayPremium
                      token={token}
                      policyId={policy.id}
                      amountLabel={kes(invoice.amount)}
                      initialState={state}
                      initialTxnId={txnId}
                      words={{
                        pay: t('payNow', lang),
                        payTo: t('payPromptTo', lang),
                        change: t('changeNumber', lang),
                        phoneLabel: t('mpesaNumber', lang),
                        checkPhone: t('enterPin', lang),
                        paid: t('premiumPaid', lang),
                        receipt: t('viewReceipt', lang),
                        failed: t('payFailed', lang),
                        orCard: t('payByCard', lang),
                        noConnection: t('noConnection', lang)
                      }}
                    />
                  ) : (
                    <p className='text-sm text-dim'>
                      {t('premiumPaySoon', lang)}{' '}
                      <Link href={`/contact?topic=policy&reference=${encodeURIComponent(policy.policyNumber)}`} className='font-medium text-seal underline underline-offset-2'>
                        {t('askRenew', lang)}
                      </Link>
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* My Cover Plus */}
        <section aria-label='My Cover Plus' className='grid gap-3 rounded-2xl border border-[#c9a227]/40 bg-sheet p-5'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <p className='font-display text-[19px] text-ink'>My Cover Plus</p>
            <span className='rounded-full bg-[#c9a227]/15 px-2.5 py-0.5 font-mono text-xs font-semibold text-warnink'>{tf('priceLine', lang, { month: price, year: yearPrice })}</span>
          </div>
          <p className='text-sm text-ink'>{plusLine}</p>
          {plusSoldHere ? <p className='text-xs font-medium text-warnink'>{plus.price.locked ? t('foundingLocked', lang) : t('foundingOffer', lang)}</p> : null}
          {plusSoldHere && plus.state === 'paused' && !paymentsEnabled() ? <p className='text-sm text-dim'>{t('plusPaySoon', lang)}</p> : null}
          {plusSoldHere && plus.state === 'paused' && paymentsEnabled() ? (
            <PlusPay
              token={token}
              card={plusCardCheckout(customer, plus)}
              mpesa={plusRails().includes('MPESA')}
              words={{ label: t('mpesaPhone', lang), payMonth: tf('payPlus', lang, { price }), payYear: tf('payPlusYear', lang, { price: yearPrice }), sending: t('sending', lang), sent: t('payPrompt', lang), cardMonth: t('payCardMonth', lang), cardYear: t('payCardYear', lang), cardNote: t('payCardNote', lang) }}
            />
          ) : null}
          <ul className='grid gap-1.5 text-sm text-ink sm:grid-cols-3'>
            {PLUS_FEATURES.map((feature) => (
              <li key={feature.id} className='flex gap-2'>
                <span aria-hidden='true' className='text-[#b98a2f]'>✦</span>
                {lang === 'sw' ? feature.sw : feature.title}
              </li>
            ))}
          </ul>
          <p className='text-xs text-dim'>{t('plusAlwaysFree', lang)}</p>
        </section>

        {due.length > 0 ? (
          <section className='grid gap-2 rounded-2xl border border-warnink/40 bg-warnink/5 p-4'>
            <h2 className='font-display text-[19px] text-ink'>{t('reminders', lang)}</h2>
            {due.map(({ policy, expiry }) => (
              <p key={policy.id} className='text-sm text-ink'>
                <strong>{policy.insuredItem ?? policy.product}</strong>: {lang === 'en' ? expiry.words.toLowerCase() : expiryWords(expiry, lang)}.{' '}
                <Link href={`/contact?topic=policy&reference=${encodeURIComponent(policy.policyNumber)}`} className='font-medium text-seal underline underline-offset-2'>
                  {t('askRenew', lang)}
                </Link>
              </p>
            ))}
          </section>
        ) : null}

        <section aria-labelledby='policies' className='grid gap-3'>
          <div className='flex flex-wrap items-end justify-between gap-2'>
            <h2 id='policies' className='font-display text-[22px] text-ink'>{t('whatInsured', lang)}</h2>
            {plus.unlocked ? (
              <a href={`/my/${token}/summary`} className='rounded-lg border border-ink/15 bg-sheet px-3 py-2 text-sm font-semibold text-ink hover:border-seal/50 hover:text-seal'>
                {t('downloadCover', lang)}
              </a>
            ) : (
              <PlusLock label={t('partOfPlus', lang)} />
            )}
          </div>
          {lines.length === 0 ? (
            <p className='rounded-2xl border border-line bg-sheet p-5 text-sm text-ink'>{t('noPolicies', lang)}</p>
          ) : (
            <ul className='grid gap-3 sm:grid-cols-2'>
              {lines.map(({ policy, expiry, value }) => (
                <li key={policy.id} className='grid gap-2 rounded-2xl border border-line bg-sheet p-5'>
                  <span className={`self-start rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[expiry.level]}`}>{expiryWords(expiry, lang)}</span>
                  <p className='font-display text-[20px] leading-snug text-ink'>{policy.insuredItem ?? policy.product}</p>
                  <dl className='grid gap-1 text-sm'>
                    <div className='flex justify-between gap-3'><dt className='text-dim'>Policy</dt><dd className='text-right text-ink'>{policy.product}, {policy.policyNumber}</dd></div>
                    {policy.registration ? <div className='flex justify-between gap-3'><dt className='text-dim'>Registration</dt><dd className='font-mono text-ink'>{policy.registration}</dd></div> : null}
                    {policy.sumInsured ? <div className='flex justify-between gap-3'><dt className='text-dim'>{t('valueInsured', lang)}</dt><dd className='font-mono text-ink'>{kes(policy.sumInsured)}</dd></div> : null}
                    {value?.estimateToday ? (
                      <div className='flex justify-between gap-3'>
                        <dt className='text-dim'>{t('valueToday', lang)}</dt>
                        {plus.unlocked ? (
                          <dd className='font-mono text-ink'>
                            {kes(value.estimateToday)} <span className={value.change! < 0 ? 'text-warnink' : 'text-seal'}>({value.change! < 0 ? '' : '+'}{kes(value.change!)})</span>
                          </dd>
                        ) : (
                          <dd><PlusLock label='Plus' /></dd>
                        )}
                      </div>
                    ) : null}
                    <div className='flex justify-between gap-3'><dt className='text-dim'>{t('premium', lang)}</dt><dd className='font-mono text-ink'>{policy.premium}</dd></div>
                    {policy.startDate && policy.expiryDate ? (
                      <div className='flex justify-between gap-3'><dt className='text-dim'>{t('cover', lang)}</dt><dd className='text-right text-ink'>{formatDate(policy.startDate)} – {formatDate(policy.expiryDate)}</dd></div>
                    ) : null}
                  </dl>
                  {value?.note && plus.unlocked ? <p className='text-xs text-dim'>{value.note}</p> : null}
                  <div className='flex flex-wrap gap-2 pt-1'>
                    <Link href={`/contact?topic=claim&reference=${encodeURIComponent(policy.policyNumber)}`} className='rounded-lg bg-seal px-3 py-2 text-sm font-semibold text-white hover:bg-sealdark'>{t('reportClaim', lang)}</Link>
                    <Link href={`/contact?topic=policy&reference=${encodeURIComponent(policy.policyNumber)}`} className='rounded-lg border border-ink/15 px-3 py-2 text-sm font-medium text-ink hover:border-seal/50 hover:text-seal'>{t('askPolicy', lang)}</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {claims.length > 0 ? (
          <section aria-labelledby='claims' className='grid gap-3'>
            <h2 id='claims' className='font-display text-[22px] text-ink'>{t('yourClaims', lang)}</h2>
            <ul className='grid gap-2'>
              {claims.map((claim) => (
                <li key={claim.id} className='flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-sheet px-4 py-3 text-sm'>
                  <span className='text-ink'>{claim.claimNumber} on {claim.policyNumber}, {claim.amount}</span>
                  <span className='rounded-full bg-paper px-2.5 py-0.5 text-xs font-semibold text-ink'>{claim.status}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {receipts.length > 0 ? (
          <section aria-labelledby='receipts' className='grid gap-3'>
            <h2 id='receipts' className='font-display text-[22px] text-ink'>{t('receipts', lang)}</h2>
            <ul className='grid gap-2'>
              {receipts.map(({ txnId, receipt }) => (
                <li key={txnId}>
                  <a
                    href={`/my/${token}/receipts/${encodeURIComponent(txnId)}`}
                    className='flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-sheet px-4 py-3 text-sm hover:border-seal/50'
                  >
                    <span className='text-ink'>
                      <span className='font-mono'>{receipt.receiptNumber}</span> · {receipt.product}, {receipt.policyNumber}
                      {receipt.sample ? <span className='ml-2 rounded-full bg-warnsoft px-2 py-0.5 text-xs font-semibold text-warnink'>{t('sampleReceipt', lang)}</span> : null}
                    </span>
                    <span className='font-mono text-ink'>
                      {kes(receipt.amount)} · {ddmmyy(receipt.paidAt)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby='news' className='grid gap-3'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <h2 id='news' className='font-display text-[22px] text-ink'>{t('news', lang)}</h2>
            {!plus.unlocked ? <PlusLock label={t('partOfPlus', lang)} /> : null}
          </div>
          {plus.unlocked && news.length > 0 ? (
            <ul className='grid gap-3'>
              {news.map((item) => (
                <li key={item.id} className='rounded-2xl border border-line bg-sheet p-5'>
                  <p className='font-display text-[18px] text-ink'>{item.headline}</p>
                  <p className='mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink'>{item.body}</p>
                  {item.ctaHref && /^https:\/\//.test(item.ctaHref) ? (
                    <a href={item.ctaHref} target='_blank' rel='noopener noreferrer' className='mt-2 inline-block text-sm font-semibold text-seal underline underline-offset-2'>
                      {item.cta}
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : plus.unlocked ? (
            <p className='rounded-2xl border border-line bg-sheet p-5 text-sm text-dim'>
              {lang === 'sw' ? 'Hakuna habari mpya kwa sasa. Wakala wako akichapisha, itaonekana hapa.' : 'No news yet. When your agency posts something, it appears here.'}
            </p>
          ) : null}
        </section>

        {/* Show a friend */}
        <section aria-labelledby='share' className='grid gap-3 rounded-2xl border border-seal/30 bg-sealsoft p-5'>
          <h2 id='share' className='font-display text-[20px] text-ink'>{t('shareTitle', lang)}</h2>
          <p className='text-sm text-ink'>{t('shareBody', lang)}</p>
          <ShareCover
            text={shareMessage({ firstName, items: policies.length, agency, link: joinLink, lang })}
            link={joinLink}
            words={{ share: t('share', lang), whatsapp: t('sendWhatsApp', lang), copy: t('copyLink', lang), copied: t('copied', lang) }}
          />
        </section>

        <p className='text-xs text-dim'>{t('privatePage', lang)}</p>
      </div>
    </main>
  );
}
