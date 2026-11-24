import { cleanReferralCode, clockFor, t } from '@insuros/domain';
import { customerLanguage } from '@/lib/customer-language';
import { LanguageSwitch } from '@/components/language-switch';
import { ThemeToggle } from '@/components/theme-toggle';
import { ContactForm } from './contact-form';
import { BackLink } from '@/components/back-link';

export const metadata = { title: 'Contact your agent' };

/** Public: a customer with no link reaches the agent or claims officer who owns their matter. */
export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const pick = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? '';
  const topic = ['claim', 'policy', 'general'].includes(pick(params.topic)) ? pick(params.topic) : 'claim';
  const reference = /^[A-Za-z0-9-]{3,40}$/.test(pick(params.reference)) ? pick(params.reference) : '';
  const lang = await customerLanguage(params.lang);
  const ref = cleanReferralCode(pick(params.ref)) ?? '';
  const query = new URLSearchParams({ topic, ...(reference ? { reference } : {}), ...(ref ? { ref } : {}) }).toString();
  return (
    <main className='min-h-screen bg-paper px-4 py-8 sm:py-12'>
      <div className='mx-auto grid max-w-xl gap-5'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div className='flex flex-wrap items-center gap-2'>
            <BackLink label={t('back', lang)} home='/' />
            <LanguageSwitch current={lang} languages={clockFor(undefined).languages} path={`/contact?${query}`} />
          </div>
          <ThemeToggle />
        </div>
        <header lang={lang}>
          <h1 className='font-display text-[30px] leading-tight text-ink'>{t('contactTitle', lang)}</h1>
          {ref ? <p className='mt-2 inline-block rounded-full bg-sealsoft px-3 py-1 text-xs font-semibold text-seal'>{t('referredBy', lang)}</p> : null}
          <p className='mt-2 text-[15px] text-ink'>{t('contactIntro', lang)}</p>
        </header>
        <ContactForm topic={topic} reference={reference} referral={ref} lang={lang} />
      </div>
    </main>
  );
}
