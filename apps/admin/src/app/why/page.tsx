import Link from 'next/link';
import { publicStories, publicStrengths, storyShareText, storyShareUrl } from '@insuros/domain';
import { ACCENT_GRADIENT, ACCENT_SOLID, Motif } from '@/components/value/motif';
import { ShareButton } from '@/components/value/share-button';
import { ShareRow } from '@/components/value/share-row';
import { SITE_URL } from '@/lib/site';
import { BackLink } from '@/components/back-link';

export const metadata = {
  title: 'Why InsurOS — the problems insurance teams live with, and what we do about each',
  description:
    'Claims that go silent, client books that walk out with an agent, commissions nobody can explain, levies worked out at the deadline. One workspace answers each.'
};

/** Public figures behind the case. Each one links to where it was reported. */
const FACTS: { figure: string; text: string; source: string; href: string }[] = [
  {
    figure: '532',
    text: 'complaints reached Kenya’s insurance regulator in one quarter (July to September 2025). Fewer than half were resolved in that period.',
    source: 'Capital Business, citing the IRA industry report',
    href: 'https://www.capitalfm.co.ke/business/2026/02/directline-trident-top-list-of-most-complained-about-insurers/'
  },
  {
    figure: 'Over half',
    text: 'of complaints to the regulator are about delay. The draft claims guidelines ask insurers to acknowledge a claim within 2 working days and to give reasons for a rejection in writing.',
    source: 'Techweez, on the draft claims management guidelines',
    href: 'https://techweez.com/2025/10/28/insurance-claims-guidelines-kenya-2025/'
  },
  {
    figure: '2.4%',
    text: 'of GDP is what Kenyans spend on insurance, against 7.4% worldwide. A bad claim experience travels through families and businesses, and people stay away.',
    source: 'The Star, citing the Allianz Global Insurance Report 2025',
    href: 'https://www.the-star.co.ke/business/commentary/2026-05-10-omoro-kenyas-insurance-industry-must-fix-its-trust-deficit-letters-monday-1'
  },
  {
    figure: '7 firms',
    text: 'faced fines for missing the deadline to file returns for the quarter ended March 2026. Pulling the figures together on time is the hard part.',
    source: 'Business Daily',
    href: 'https://www.businessdailyafrica.com/bd/corporate/companies/seven-insurance-firms-face-ira-fines-for-reporting-breaches-5526076'
  }
];

export default function WhyPage() {
  const stories = publicStories();
  const strengths = publicStrengths();
  const pageText = `Why InsurOS: the problems insurance teams live with, and what one workspace does about each.\n\n${SITE_URL}/why`;

  return (
    <div className='min-h-screen text-ink'>
      <header className='border-b border-line bg-sheet/80 backdrop-blur-md'>
        <div className='mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6'>
          <Link href='/' className='font-display text-[22px] tracking-tight text-ink'>
            InsurOS
          </Link>
          <Link
            href='/sign-in'
            className='rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-seal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal'
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className='mx-auto max-w-6xl px-4 pb-16 sm:px-6'>
        <div className='pt-4'>
          <BackLink home='/' />
        </div>
        <section className='py-10 sm:py-14'>
          <h1 className='max-w-3xl font-display text-[34px] leading-tight tracking-tight sm:text-[46px]'>
            Insurance loses customers in the silence between a claim and an answer.
          </h1>
          <p className='mt-4 max-w-2xl text-[17px] leading-relaxed text-dim'>
            InsurOS is a workspace for insurers, agencies and their agents. It does not sell cover. It gives the people
            who do one place for customers, policies, claims and money, so every question has an owner and an answer.
          </p>
          <div className='mt-6 flex flex-wrap items-center gap-3'>
            <a
              href='mailto:telpeninfo@gmail.com?subject=InsurOS%20for%20our%20team'
              className='rounded-lg bg-seal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sealdark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal'
            >
              Ask for access for your team
            </a>
            <ShareButton tone='dark' title='Why InsurOS' text={pageText} url={`${SITE_URL}/why`} />
          </div>
          <p className='mt-2 text-xs text-dim'>Email: telpeninfo@gmail.com</p>
        </section>

        <section aria-labelledby='facts' className='rounded-2xl border border-line bg-sheet p-5 sm:p-7'>
          <h2 id='facts' className='font-display text-[22px]'>
            What the public record says
          </h2>
          <ul className='mt-4 grid gap-5 sm:grid-cols-2'>
            {FACTS.map((fact) => (
              <li key={fact.figure} className='min-w-0'>
                <p className='font-mono text-[26px] font-semibold text-seal'>{fact.figure}</p>
                <p className='mt-1 text-sm leading-relaxed text-ink'>{fact.text}</p>
                <a
                  href={fact.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='mt-1 inline-block text-xs text-dim underline underline-offset-2 hover:text-seal'
                >
                  {fact.source}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby='answers' className='mt-12'>
          <h2 id='answers' className='font-display text-[28px]'>
            The problem, and what the workspace does about it
          </h2>
          <p className='mt-1 max-w-2xl text-sm text-dim'>
            Claim decisions are made by people, and InsurOS takes no payments in the app.
          </p>
          <ul className='mt-6 grid gap-5 md:grid-cols-2'>
            {stories.map((story) => (
              <li
                key={story.id}
                id={story.id}
                className='flex min-w-0 scroll-mt-6 flex-col overflow-hidden rounded-2xl border border-line bg-sheet shadow-[0_12px_32px_-20px_rgba(18,28,49,0.3)]'
              >
                <div className='relative overflow-hidden p-5 text-white' style={{ backgroundImage: ACCENT_GRADIENT[story.accent] }}>
                  <div aria-hidden='true' className='pointer-events-none absolute -right-3 -top-3 text-white/20'>
                    <Motif motif={story.motif} size={96} />
                  </div>
                  <h3 className='relative text-sm font-medium text-white/80'>{story.area}</h3>
                  <p className='relative mt-1.5 max-w-[34ch] font-display text-[19px] leading-snug'>{story.pain}</p>
                </div>
                <div className='flex flex-1 flex-col p-5'>
                  <p className='text-xs font-semibold' style={{ color: ACCENT_SOLID[story.accent] }}>
                    What you get
                  </p>
                  <p className='mt-1 text-[15px] leading-relaxed text-ink'>{story.answer}</p>
                  <p className='mt-3 text-xs font-semibold text-dim'>What you gain</p>
                  <p className='mt-1 flex-1 text-[15px] leading-relaxed text-ink'>{story.gain}</p>
                  <div className='mt-4'>
                    <ShareButton
                      tone='dark'
                      title={`InsurOS: ${story.area}`}
                      text={storyShareText(story, SITE_URL)}
                      url={storyShareUrl(story, SITE_URL)}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby='gains' className='mt-12'>
          <h2 id='gains' className='font-display text-[28px]'>
            What good software gives a team, and where we stand
          </h2>
          <p className='mt-1 max-w-2xl text-sm text-dim'>
            These are the things people praise most in reviews of established insurance systems. A system worth moving to
            has to give you them as well as fix what hurts. Where something is only part-way, we say what is missing.
          </p>
          <ul className='mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {strengths.map((item) => (
              <li key={item.id} id={`gain-${item.id}`} className='flex min-w-0 scroll-mt-6 flex-col rounded-2xl border border-line bg-sheet p-5'>
                <p
                  className={`self-start rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    item.status === 'here' ? 'bg-sealsoft text-seal' : 'bg-warnink/10 text-warnink'
                  }`}
                >
                  {item.status === 'here' ? 'Here today' : 'Part-way'}
                </p>
                <h3 className='mt-2.5 font-display text-[18px] leading-snug text-ink'>{item.strength}</h3>
                <p className='mt-1.5 text-[15px] leading-relaxed text-ink'>{item.gain}</p>
                <p className='mt-2.5 flex-1 border-t border-line pt-2.5 text-sm leading-relaxed text-dim'>{item.today}</p>
              </li>
            ))}
          </ul>
          <p className='mt-4 text-xs text-dim'>
            Review themes from{' '}
            <a href='https://www.g2.com/compare/applied-epic-vs-ezlynx-ezlynx-vs-hawksoft' target='_blank' rel='noopener noreferrer' className='underline underline-offset-2 hover:text-seal'>
              G2
            </a>{' '}
            and{' '}
            <a href='https://www.selecthub.com/p/insurance-agency-management-systems/ezlynx/' target='_blank' rel='noopener noreferrer' className='underline underline-offset-2 hover:text-seal'>
              SelectHub
            </a>
            , read 17/11/26.
          </p>
        </section>

        <section className='mt-12 rounded-2xl p-6 text-white sm:p-8' style={{ backgroundImage: ACCENT_GRADIENT.seal }}>
          <h2 className='max-w-2xl font-display text-[26px] leading-snug'>See it with your own team’s work.</h2>
          <p className='mt-2 max-w-2xl text-sm leading-relaxed text-white/85'>
            Your administrator gives each person access by phone number. Each person sees only the work their role
            covers.
          </p>
          <div className='mt-5 flex flex-wrap gap-3'>
            <Link
              href='/sign-in'
              className='rounded-lg bg-sheet px-5 py-2.5 text-sm font-semibold text-sealdark transition hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
            >
              Sign in with your phone
            </Link>
            <a
              href='mailto:telpeninfo@gmail.com?subject=InsurOS%20for%20our%20team'
              className='rounded-lg border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
            >
              Ask for access for your team
            </a>
          </div>
        </section>

        <section aria-label='Share InsurOS' className='mt-10 rounded-2xl border border-line bg-sheet p-5'>
          <ShareRow title='Why InsurOS' text={pageText} url={`${SITE_URL}/why?via=share`} />
        </section>
      </main>

      <footer className='border-t border-line py-6 text-center text-sm text-dim'>
        InsurOS is a product of Telpen Systems Ltd, Kenya ·{' '}
        <Link href='/privacy' className='underline'>
          Privacy
        </Link>{' '}
        ·{' '}
        <Link href='/terms' className='underline'>
          Terms
        </Link>{' '}
        ·{' '}
        <Link href='/delete-account' className='underline'>
          Delete account
        </Link>
      </footer>
    </div>
  );
}
