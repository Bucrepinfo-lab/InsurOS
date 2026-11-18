/**
 * The InsurOS mark: the Ledger Seal (docs/brand/BRAND.md). A wax seal on ruled
 * ledger lines, the Fraunces "In" monogram over a gold signature rule.
 * `detailed` adds the coin-edge ticks, the arc inscription and MMXXVI — use it
 * from 96 px up; below that the simple seal reads better.
 */
export function LedgerSeal({
  size = 40,
  detailed = false,
  className = '',
  title = 'InsurOS'
}: {
  size?: number;
  detailed?: boolean;
  className?: string;
  title?: string;
}) {
  const id = detailed ? 'ledger-seal-d' : 'ledger-seal';
  return (
    <svg width={size} height={size} viewBox='0 0 240 240' role='img' aria-label={title} className={className}>
      <defs>
        <radialGradient id={`${id}-g`} cx='35%' cy='28%' r='90%'>
          <stop offset='0%' stopColor='#1cb389' />
          <stop offset='55%' stopColor='#0f6e56' />
          <stop offset='100%' stopColor='#0a4f3e' />
        </radialGradient>
        <clipPath id={`${id}-c`}>
          <circle cx='120' cy='120' r='88' />
        </clipPath>
        <path id={`${id}-arc`} d='M 42 120 A 78 78 0 0 1 198 120' fill='none' />
      </defs>
      <circle cx='120' cy='120' r='112' fill={`url(#${id}-g)`} />
      <circle cx='120' cy='120' r='112' fill='none' stroke='#083d30' strokeWidth='2' />
      {detailed ? (
        <circle cx='120' cy='120' r='104' fill='none' stroke='#f6f3ec' strokeOpacity='0.5' strokeWidth='6' strokeDasharray='1.6 5.13' />
      ) : null}
      <circle cx='120' cy='120' r='94' fill='none' stroke='#f6f3ec' strokeOpacity='0.9' strokeWidth={detailed ? 1.6 : 4} />
      {detailed ? <circle cx='120' cy='120' r='90' fill='none' stroke='#f6f3ec' strokeOpacity='0.45' strokeWidth='0.8' /> : null}
      <g clipPath={`url(#${id}-c)`} stroke='#f6f3ec' strokeOpacity='0.16' strokeWidth={detailed ? 1 : 3}>
        <line x1='20' y1='152' x2='220' y2='152' />
        <line x1='20' y1='176' x2='220' y2='176' />
        {detailed ? <line x1='20' y1='200' x2='220' y2='200' /> : null}
      </g>
      {detailed ? (
        <text fontFamily='var(--font-onest), system-ui, sans-serif' fontSize='12' fontWeight='600' letterSpacing='3.2' fill='#f6f3ec' fillOpacity='0.92'>
          <textPath href={`#${id}-arc`} startOffset='50%' textAnchor='middle'>
            THE UNDERWRITER&#8217;S LEDGER
          </textPath>
        </text>
      ) : null}
      <text x='120' y={detailed ? 148 : 150} fontFamily='var(--font-fraunces), Georgia, serif' fontSize={detailed ? 76 : 96} fontWeight='600' textAnchor='middle' fill='#f6f3ec'>
        In
      </text>
      <line x1={detailed ? 86 : 74} y1={detailed ? 163 : 172} x2={detailed ? 154 : 166} y2={detailed ? 163 : 172} stroke='#c9a227' strokeWidth={detailed ? 3 : 7} strokeLinecap='round' />
      {detailed ? (
        <text x='120' y='196' fontFamily='var(--font-onest), system-ui, sans-serif' fontSize='11' fontWeight='600' letterSpacing='3' textAnchor='middle' fill='#f6f3ec' fillOpacity='0.75'>
          MMXXVI
        </text>
      ) : null}
    </svg>
  );
}

/** Seal plus the "InsurOS" wordmark ("OS" in seal green). `tone` is the ground it sits on. */
export function InsurOSLogo({ tone = 'light', size = 36, tagline = false }: { tone?: 'light' | 'dark'; size?: number; tagline?: boolean }) {
  return (
    <span className='inline-flex items-center gap-2.5'>
      <LedgerSeal size={size} title='' />
      <span className='grid leading-none'>
        <span className={`font-display font-semibold tracking-tight ${tone === 'dark' ? 'text-white' : 'text-ink'}`} style={{ fontSize: size * 0.62 }}>
          Insur<span className={tone === 'dark' ? 'text-sealbright' : 'text-seal'}>OS</span>
        </span>
        {tagline ? (
          <span className={`mt-1 text-[9.5px] font-semibold tracking-[0.22em] ${tone === 'dark' ? 'text-white/60' : 'text-dim'}`}>THE UNDERWRITER&#8217;S LEDGER</span>
        ) : null}
      </span>
    </span>
  );
}
