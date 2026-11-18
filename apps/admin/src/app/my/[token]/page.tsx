import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDate } from '@insuros/ui';
import { clockFor, estimateVehicleValue, expiryWords, expiryStatus, policiesOfCustomer, t, type ExpiryLevel } from '@insuros/domain';
import { getPersistence } from '@insuros/services';
import { hashCustomerToken, isCustomerToken } from '@/lib/customer-link';
import { customerLanguage } from '@/lib/customer-language';
import { LanguageSwitch } from '@/components/language-switch';
import { ThemeToggle } from '@/components/theme-toggle';

export const metadata = { title: 'My cover', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const TONE: Record<ExpiryLevel, string> = {
  expired: 'bg-red-50 text-red-800',
  'due-soon': 'bg-warnink/10 text-warnink',
  'in-force': 'bg-sealsoft text-seal',
  unknown: 'bg-paper text-dim'
};
const kes = (value: number) => `KES ${Math.round(value).toLocaleString('en-GB')}`;

/**
 * The customer's own page: what they have insured, for how much, when cover
 * ends, and their claims. Reached by a private link, no account needed.
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
  const clock = clockFor(undefined);
  if (!isCustomerToken(token)) notFound();
  const hash = hashCustomerToken(token);
  const db = getPersistence();
  const [customer] = await db.customers.findWhere((candidate) => candidate.homeAccessHash === hash);
  if (!customer) notFound();
  const policies = policiesOfCustomer(await db.policies.findAll(), customer);
  const numbers = new Set(policies.map((policy) => policy.policyNumber));
  const claims = (await db.claims.findAll()).filter((claim) => numbers.has(claim.policyNumber));
  const now = new Date();
  const lines = policies
    .map((policy) => ({ policy, expiry: expiryStatus(policy.expiryDate, now, clock.timeZone), value: policy.registration || policy.yearOfManufacture ? estimateVehicleValue(policy, now) : null }))
    .sort((a, b) => (a.expiry.days ?? 99999) - (b.expiry.days ?? 99999));
  const due = lines.filter((line) => line.expiry.level === 'due-soon' || line.expiry.level === 'expired');
  const insuredTotal = policies.reduce((sum, policy) => sum + (policy.sumInsured ?? 0), 0);

  return (
    <main className='min-h-screen bg-paper px-4 py-8 sm:py-12'>
      <div lang={lang} className='mx-auto grid max-w-3xl gap-6'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <LanguageSwitch current={lang} languages={clock.languages} path={`/my/${token}`} />
          <ThemeToggle />
        </div>
        <header>
          <p className='text-sm text-dim'>{t('myCover', lang)}</p>
          <h1 className='mt-1 font-display text-[32px] leading-tight text-ink'>{t('hello', lang)}, {customer.name.split(' ')[0]}</h1>
          <p className='mt-1 text-[15px] text-ink'>
            {lang === 'en' ? `${policies.length} ${policies.length === 1 ? 'policy' : 'policies'}` : `${t('policies', lang)}: ${policies.length}`}
            {insuredTotal > 0 ? `, ${kes(insuredTotal)} ${t('insuredInAll', lang)}` : ''}. {t('homeScreen', lang)}
          </p>
          <a href={`/my/${token}/summary`} className='mt-3 inline-block rounded-lg border border-ink/15 bg-sheet px-4 py-2 text-sm font-semibold text-ink hover:border-seal/50 hover:text-seal'>
            {t('downloadCover', lang)}
          </a>
        </header>

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
          <h2 id='policies' className='font-display text-[22px] text-ink'>{t('whatInsured', lang)}</h2>
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
                        <dd className='font-mono text-ink'>
                          {kes(value.estimateToday)} <span className={value.change! < 0 ? 'text-warnink' : 'text-seal'}>({value.change! < 0 ? '' : '+'}{kes(value.change!)})</span>
                        </dd>
                      </div>
                    ) : null}
                    <div className='flex justify-between gap-3'><dt className='text-dim'>{t('premium', lang)}</dt><dd className='font-mono text-ink'>{policy.premium}</dd></div>
                    {policy.startDate && policy.expiryDate ? (
                      <div className='flex justify-between gap-3'><dt className='text-dim'>{t('cover', lang)}</dt><dd className='text-right text-ink'>{formatDate(policy.startDate)} – {formatDate(policy.expiryDate)}</dd></div>
                    ) : null}
                  </dl>
                  {value?.note ? <p className='text-xs text-dim'>{value.note}</p> : null}
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

        <p className='text-xs text-dim'>{t('privatePage', lang)}</p>
      </div>
    </main>
  );
}
