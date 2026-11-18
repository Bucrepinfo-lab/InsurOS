import Link from 'next/link';
import { redirect } from 'next/navigation';
import { InsurOSLogo, LedgerSeal } from '@insuros/ui';
import { ThemeToggle } from '@/components/theme-toggle';

export const metadata = {
  title: { absolute: 'InsurOS: every insurance promise on the record' },
  description:
    'The operations workspace for insurers, agencies and their agents: policies out in 24 hours, claims decided in 48, customers answered in 4, and every step on the record.'
};

/* The home page is the showpiece of "The Underwriter's Ledger" (docs/DESIGN_SYSTEM.md):
   a deep ink-to-seal hero with a gold signature, then paper sections. The hero keeps
   its own colours in both themes; everything below follows the tokens. */

const PROMISES: [string, string, string][] = [
  ['24h', 'Policy issued', 'Checked, underwritten, paid and issued, with every step timed.'],
  ['48h', 'Claim decided', 'From first photo to decision, escalated to a supervisor when late.'],
  ['4h', 'Customer answered', 'If the agent cannot reply, their supervisor gets it next.'],
  ['10', 'Guided scene photos', 'Front, rear, sides, damage, dashboard and chassis: stamped with time and place.']
];

const AUDIENCES: { title: string; line: string; points: string[]; tone: string }[] = [
  {
    title: 'Insurers',
    line: 'See every policy and claim your intermediaries handle, as it happens.',
    points: ['Claim packs with photos, GPS and signatures', 'Decisions and settlements stay with a person', 'Statutory caps per line, per country'],
    tone: 'from-[#0f6e56] to-[#0a4f3e]'
  },
  {
    title: 'Agencies',
    line: 'Run your branches by area, with each manager seeing their own.',
    points: ['Follow-ups that escalate on their own', 'Commission split and referral tokens per country', 'Break-even pricing that is fair to clients'],
    tone: 'from-[#1b2a41] to-[#101c31]'
  },
  {
    title: 'Agents',
    line: 'Everything for your customers on your phone, and a record of your work you can take with you.',
    points: ['Customers, policies and claims in a few taps', 'Messages from customers with a 4-hour clock', 'A career record PDF for your next move'],
    tone: 'from-[#8a5d12] to-[#5e3f0b]'
  },
  {
    title: 'Customers',
    line: 'No app to install: a private page from their agent, in English or Kiswahili.',
    points: ['What is insured, its value and when cover ends', 'Report a claim with photos from the scene', 'Sign the declaration on the phone'],
    tone: 'from-[#1d5f8a] to-[#123f5e]'
  }
];

const CLAIM_STEPS: [string, string][] = [
  ['Reported', 'The customer writes from their private page, or the agent registers the claim.'],
  ['Photographed', 'Ten guided shots taken at the scene, each stamped with the moment and the GPS position.'],
  ['Signed', 'The customer reads and signs the claim declaration on their phone. No printing.'],
  ['Decided', 'The claims officer decides within 48 hours. Late steps go up the chain on their own.'],
  ['Packed', 'One PDF with the details, messages, photos, map pins and signature, for the insurer.']
];

const FEATURES: { title: string; body: string; accent: string }[] = [
  { title: 'Messaging by hierarchy', body: 'Colleagues reach their supervisors and team; customers reach their agent. AI help to write clearly, off by default.', accent: '#0f6e56' },
  { title: 'Every list downloads', body: 'Export CSV or PDF from any list on a phone, exactly the rows your search shows.', accent: '#1d5f8a' },
  { title: 'Per-country economics', body: 'Rates, commission caps, levies and referral tokens set for each country and approved by a named person.', accent: '#b98a2f' },
  { title: 'Least privilege, on the server', body: 'Each person sees only their own work and area; supervisors see the area below them.', accent: '#6a4c93' },
  { title: 'Your language, your clock', body: 'Customer pages in English and Kiswahili; times on each country’s own clock; light or dark.', accent: '#c4553a' },
  { title: 'Career record', body: 'Roles held, policies placed and promptness, built from real work, with a fingerprint an employer can check.', accent: '#13806b' }
];

const TRUST: [string, string][] = [
  ['Built to Kenyan law', 'Insurance Act caps and timelines, and the Data Protection Act 2019.'],
  ['Money moves only with a person', 'InsurOS prepares and records; it never pays, charges or settles on its own.'],
  ['Evidence you can trust', 'Originals kept untouched with a SHA-256 fingerprint; the clear copy is for viewing.']
];

function Tick() {
  return (
    <svg viewBox='0 0 20 20' className='mt-0.5 h-4 w-4 flex-none' aria-hidden='true'>
      <circle cx='10' cy='10' r='9' fill='currentColor' opacity='0.18' />
      <path d='M6 10.5l2.6 2.5L14 7.5' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

/**
 * Public landing. The installed Android app (TWA) opens /?source=twa and goes
 * straight to the workspace (which sends signed-out users to sign-in).
 */
export default async function HomePage({ searchParams }: { searchParams: Promise<{ source?: string }> }) {
  const { source } = await searchParams;
  if (source === 'twa' || source === 'pwa') redirect('/dashboard');

  return (
    <div className='min-h-screen overflow-x-hidden text-ink'>
      {/* Hero: ink to seal, with a gold signature */}
      <header className='relative isolate overflow-hidden bg-[#0d1828] text-white'>
        <div
          aria-hidden='true'
          className='absolute inset-0 -z-10'
          style={{
            backgroundImage: [
              'radial-gradient(700px 420px at 85% 10%, rgba(23,163,126,0.45), transparent 65%)',
              'radial-gradient(520px 360px at 8% 95%, rgba(201,162,39,0.28), transparent 60%)',
              'radial-gradient(900px 600px at 50% 120%, rgba(15,110,86,0.55), transparent 70%)',
              'linear-gradient(160deg, #101c31 0%, #0d1f2a 45%, #0a3a30 100%)',
              'repeating-linear-gradient(to bottom, transparent 0 31px, rgba(255,255,255,0.035) 31px 32px)'
            ].join(',')
          }}
        />
        <nav aria-label='Site' className='mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-5 sm:px-6'>
          <Link href='/' aria-label='InsurOS home'>
            <InsurOSLogo tone='dark' size={38} />
          </Link>
          <div className='flex items-center gap-2 text-sm sm:gap-4'>
            <Link href='/why' className='hidden text-white/75 hover:text-white sm:inline'>Why InsurOS</Link>
            <Link href='/contact?topic=general' className='hidden text-white/75 hover:text-white sm:inline'>Contact</Link>
            <Link href='/sign-in' className='rounded-lg border border-white/25 px-3.5 py-2 font-medium text-white hover:border-white/60'>
              Sign in
            </Link>
          </div>
        </nav>

        <div className='mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:pb-28 lg:pt-16'>
          <div className='animate-rise'>
            <p className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80'>
              <span className='seal-dot inline-block h-2 w-2 rounded-full bg-sealbright' />
              Live in Kenya, built for every country
            </p>
            <h1 className='mt-6 max-w-2xl text-[40px] font-semibold leading-[1.04] tracking-tight [text-wrap:balance] sm:text-[58px]'>
              Every insurance promise, on the record.
            </h1>
            <svg viewBox='0 0 320 14' className='mt-3 h-3 w-56 text-[#c9a227]' aria-hidden='true'>
              <path d='M2 9 C 60 2, 120 13, 180 6 S 290 4, 318 8' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' />
            </svg>
            <p className='mt-6 max-w-xl text-[17px] leading-relaxed text-white/80'>
              The workspace for insurers, agencies and their agents. Policies out in a day, claims decided in two, customers answered
              within hours, and every photo, signature and decision kept where anyone can check it.
            </p>
            <div className='mt-9 flex flex-wrap gap-3'>
              <Link
                href='/sign-in'
                className='rounded-xl bg-[#c9a227] px-6 py-3.5 font-semibold text-[#101c31] shadow-[0_14px_34px_-14px_rgba(201,162,39,0.8)] transition hover:-translate-y-px hover:bg-[#d8b13a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a227]'
              >
                Sign in with your phone
              </Link>
              <Link href='/why' className='rounded-xl border border-white/25 bg-white/5 px-6 py-3.5 font-semibold text-white backdrop-blur transition hover:border-white/60'>
                See why teams switch
              </Link>
            </div>
            <p className='mt-5 max-w-lg text-xs leading-relaxed text-white/55'>
              For staff and agents of organisations using InsurOS; your administrator grants access to your phone number. InsurOS does
              not sell insurance to the public.
            </p>
          </div>

          {/* A claim as InsurOS keeps it */}
          <div className='relative mx-auto w-full max-w-md'>
            <div aria-hidden='true' className='absolute -top-14 right-2 opacity-90 drop-shadow-[0_30px_60px_rgba(0,0,0,0.45)] sm:-right-16'>
              <LedgerSeal size={150} detailed title='' />
            </div>
            <figure className='relative mt-24 rounded-2xl border border-white/12 bg-white/[0.07] p-5 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)] backdrop-blur-md'>
              <figcaption className='flex items-center justify-between text-xs text-white/60'>
                <span className='font-mono'>CLM-2026-0418</span>
                <span className='rounded-full bg-sealbright/20 px-2 py-0.5 font-semibold text-[#7fe0c0]'>On time</span>
              </figcaption>
              <p className='mt-3 font-display text-[22px] leading-snug'>Toyota Axio, rear bumper</p>
              <p className='text-sm text-white/60'>Motor private, Thika Road</p>
              <ol className='mt-4 grid gap-2.5 text-sm'>
                {[
                  ['Reported by the customer', '08:12'],
                  ['10 of 10 photos, stamped', '08:31'],
                  ['GPS −1.2194, 36.8890 ± 8 m', '08:31'],
                  ['Declaration signed on the phone', '08:40'],
                  ['Decision due', 'Fri 10:12']
                ].map(([label, time], index) => (
                  <li key={label} className='flex items-center gap-3'>
                    <span className={`grid h-5 w-5 flex-none place-items-center rounded-full text-[10px] font-bold ${index < 4 ? 'bg-sealbright text-[#062e25]' : 'border border-[#c9a227] text-[#c9a227]'}`}>
                      {index < 4 ? '✓' : ''}
                    </span>
                    <span className='flex-1 text-white/85'>{label}</span>
                    <span className='font-mono text-xs text-white/50'>{time}</span>
                  </li>
                ))}
              </ol>
              <div className='mt-4 h-1.5 overflow-hidden rounded-full bg-white/10'>
                <div className='h-full w-4/5 rounded-full bg-gradient-to-r from-sealbright to-[#c9a227]' />
              </div>
              <p className='mt-2 text-[11px] text-white/45'>An example of how a claim reads in InsurOS.</p>
            </figure>
          </div>
        </div>
      </header>

      <main>
        {/* The promises */}
        <section aria-labelledby='promises' className='relative -mt-10 px-4 sm:px-6'>
          <h2 id='promises' className='sr-only'>Service targets</h2>
          <ul className='mx-auto grid max-w-6xl gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-[0_24px_60px_-30px_rgba(27,42,65,0.35)] grid-cols-2 lg:grid-cols-4'>
            {PROMISES.map(([figure, label, note]) => (
              <li key={label} className='bg-sheet p-4 sm:p-6'>
                <p className='font-mono text-[28px] font-semibold leading-none tracking-tight text-seal sm:text-[34px]'>{figure}</p>
                <p className='mt-2 font-display text-[17px] leading-snug text-ink sm:text-[18px]'>{label}</p>
                <p className='mt-1 text-[13px] leading-relaxed text-dim sm:text-sm'>{note}</p>
              </li>
            ))}
          </ul>
          <p className='mx-auto mt-3 max-w-6xl text-xs text-faint'>The times every step is held to. A late step goes to the supervisor, then to the next level up.</p>
        </section>

        {/* Who it is for */}
        <section aria-labelledby='who' className='mx-auto max-w-6xl px-4 pt-24 sm:px-6'>
          <div className='max-w-2xl'>
            <h2 id='who' className='text-[32px] leading-tight text-ink [text-wrap:balance] sm:text-[40px]'>One ledger for everyone in the chain</h2>
            <p className='mt-3 text-[17px] leading-relaxed text-dim'>
              Insurance breaks where hand-offs happen. InsurOS keeps the insurer, the agency, the agent and the customer on the same
              record, each seeing only what is theirs.
            </p>
          </div>
          <ul className='mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4'>
            {AUDIENCES.map((audience) => (
              <li key={audience.title} className='group flex flex-col overflow-hidden rounded-2xl border border-line bg-sheet shadow-[0_18px_40px_-28px_rgba(27,42,65,0.45)] transition hover:-translate-y-1 hover:shadow-[0_28px_60px_-28px_rgba(27,42,65,0.55)]'>
                <div className={`bg-gradient-to-br ${audience.tone} px-5 pb-5 pt-6 text-white`}>
                  <p className='font-display text-[24px]'>{audience.title}</p>
                  <p className='mt-2 text-sm leading-relaxed text-white/80'>{audience.line}</p>
                </div>
                <ul className='grid gap-2.5 p-5 text-sm text-ink'>
                  {audience.points.map((point) => (
                    <li key={point} className='flex gap-2 text-seal'>
                      <Tick />
                      <span className='text-ink'>{point}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>

        {/* A claim, step by step */}
        <section aria-labelledby='claim' className='mt-24 bg-[#0f2a24] px-4 py-20 text-white sm:px-6' style={{ backgroundImage: 'radial-gradient(800px 400px at 90% 0%, rgba(23,163,126,0.35), transparent 65%), radial-gradient(600px 300px at 0% 100%, rgba(201,162,39,0.18), transparent 60%)' }}>
          <div className='mx-auto max-w-6xl'>
            <h2 id='claim' className='max-w-2xl text-[32px] leading-tight [text-wrap:balance] sm:text-[40px]'>A claim from the roadside to the decision</h2>
            <p className='mt-3 max-w-2xl text-[17px] leading-relaxed text-white/75'>
              The customer does not wait for an assessor to find the scene. The evidence is gathered while it is fresh, and nobody can
              quietly let it sit.
            </p>
            <ol className='mt-12 grid gap-6 md:grid-cols-5'>
              {CLAIM_STEPS.map(([title, body], index) => (
                <li key={title} className='relative'>
                  <div className='flex items-center gap-3'>
                    <span className='grid h-10 w-10 flex-none place-items-center rounded-full border border-[#c9a227]/60 bg-[#c9a227]/10 font-mono text-sm font-semibold text-[#e3c25a]'>
                      {index + 1}
                    </span>
                    {index < CLAIM_STEPS.length - 1 ? <span aria-hidden='true' className='hidden h-px flex-1 bg-gradient-to-r from-[#c9a227]/50 to-transparent md:block' /> : null}
                  </div>
                  <p className='mt-4 font-display text-[20px]'>{title}</p>
                  <p className='mt-1.5 text-sm leading-relaxed text-white/70'>{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section aria-labelledby='features' className='mx-auto max-w-6xl px-4 py-24 sm:px-6'>
          <div className='flex flex-wrap items-end justify-between gap-4'>
            <h2 id='features' className='max-w-xl text-[32px] leading-tight text-ink [text-wrap:balance] sm:text-[40px]'>Made for the way Kenyan insurance works</h2>
            <Link href='/why' className='font-semibold text-seal underline underline-offset-4 hover:text-sealdark'>
              Read the pains it answers
            </Link>
          </div>
          <ul className='mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
            {FEATURES.map((feature) => (
              <li key={feature.title} className='relative overflow-hidden rounded-2xl border border-line bg-sheet p-6 shadow-[0_18px_40px_-30px_rgba(27,42,65,0.45)]'>
                <span aria-hidden='true' className='absolute inset-x-0 top-0 h-1' style={{ background: `linear-gradient(90deg, ${feature.accent}, transparent)` }} />
                <span aria-hidden='true' className='absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-[0.12]' style={{ background: feature.accent }} />
                <p className='font-display text-[20px] text-ink'>{feature.title}</p>
                <p className='mt-2 text-[15px] leading-relaxed text-dim'>{feature.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Trust */}
        <section aria-labelledby='trust' className='px-4 pb-24 sm:px-6'>
          <div className='mx-auto grid max-w-6xl gap-8 rounded-3xl border border-line bg-sealsoft p-8 sm:p-10 lg:grid-cols-[auto_1fr] lg:items-center'>
            <LedgerSeal size={120} detailed title='The InsurOS Ledger Seal' className='mx-auto' />
            <div>
              <h2 id='trust' className='text-[28px] leading-tight text-ink sm:text-[34px]'>Trust is the product</h2>
              <ul className='mt-6 grid gap-5 md:grid-cols-3'>
                {TRUST.map(([title, body]) => (
                  <li key={title}>
                    <p className='font-semibold text-ink'>{title}</p>
                    <p className='mt-1 text-sm leading-relaxed text-dim'>{body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Closing call */}
        <section className='px-4 pb-24 sm:px-6'>
          <div className='relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-[#101c31] px-6 py-14 text-center text-white sm:px-10' style={{ backgroundImage: 'radial-gradient(600px 300px at 50% -20%, rgba(23,163,126,0.5), transparent 70%)' }}>
            <h2 className='mx-auto max-w-2xl text-[30px] leading-tight [text-wrap:balance] sm:text-[40px]'>Bring your agency onto the record</h2>
            <p className='mx-auto mt-3 max-w-xl text-white/75'>
              Tell us about your team and we will set up your workspace, your areas and your people. The first month is free.
            </p>
            <div className='mt-8 flex flex-wrap justify-center gap-3'>
              <Link href='/contact?topic=general' className='rounded-xl bg-[#c9a227] px-6 py-3.5 font-semibold text-[#101c31] transition hover:bg-[#d8b13a]'>
                Talk to us
              </Link>
              <Link href='/sign-in' className='rounded-xl border border-white/25 px-6 py-3.5 font-semibold text-white hover:border-white/60'>
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className='border-t border-line'>
        <div className='mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-dim sm:px-6'>
          <InsurOSLogo size={30} tagline />
          <nav aria-label='Legal' className='flex flex-wrap items-center gap-4'>
            <Link href='/privacy' className='hover:text-ink'>Privacy</Link>
            <Link href='/terms' className='hover:text-ink'>Terms</Link>
            <Link href='/delete-account' className='hover:text-ink'>Delete account</Link>
            <ThemeToggle />
          </nav>
          <p className='w-full text-xs text-faint'>InsurOS is a product of Telpen Systems Ltd, Kenya. telpeninfo@gmail.com</p>
        </div>
      </footer>
    </div>
  );
}
