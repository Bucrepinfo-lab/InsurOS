import type { ValueAccent, ValueMotif } from '@insuros/domain';

/** Accent gradients for the value story. Deep enough for white text (WCAG AA) in both corners. */
export const ACCENT_GRADIENT: Record<ValueAccent, string> = {
  seal: 'radial-gradient(420px 220px at 110% -20%, rgba(23,163,126,0.55), transparent 65%), linear-gradient(140deg, #0a4a3c 0%, #06382f 100%)',
  gold: 'radial-gradient(420px 220px at 110% -20%, rgba(233,180,76,0.5), transparent 65%), linear-gradient(140deg, #6b4a12 0%, #4a320a 100%)',
  ocean: 'radial-gradient(420px 220px at 110% -20%, rgba(74,144,226,0.55), transparent 65%), linear-gradient(140deg, #173a6b 0%, #0f2747 100%)',
  coral: 'radial-gradient(420px 220px at 110% -20%, rgba(240,128,96,0.55), transparent 65%), linear-gradient(140deg, #8a3324 0%, #5e2117 100%)',
  violet: 'radial-gradient(420px 220px at 110% -20%, rgba(150,120,230,0.55), transparent 65%), linear-gradient(140deg, #43307a 0%, #2c1f54 100%)',
  teal: 'radial-gradient(420px 220px at 110% -20%, rgba(60,190,200,0.5), transparent 65%), linear-gradient(140deg, #0d5560 0%, #083a42 100%)'
};

/** The accent as a solid colour, for rules, dots and link text on paper. */
export const ACCENT_SOLID: Record<ValueAccent, string> = {
  seal: '#0f6e56',
  gold: '#8a5d10',
  ocean: '#1f5596',
  coral: '#b0432e',
  violet: '#5a3fa3',
  teal: '#0f6f7a'
};

/** A small line drawing per theme. Decorative only. */
export function Motif({ motif, size = 120 }: { motif: ValueMotif; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 120 120',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true
  };
  switch (motif) {
    case 'shield':
      return (
        <svg {...common}>
          <path d='M60 14l34 12v28c0 24-14 40-34 50-20-10-34-26-34-50V26l34-12z' />
          <path d='M44 60l11 11 22-24' strokeWidth={3} />
          <circle cx='98' cy='20' r='5' opacity='.5' />
          <circle cx='18' cy='92' r='3' opacity='.5' />
        </svg>
      );
    case 'clock':
      return (
        <svg {...common}>
          <circle cx='56' cy='62' r='38' />
          <path d='M56 38v24l16 10' strokeWidth={3} />
          <path d='M92 24l10-8M98 34l12-2' opacity='.6' />
          <path d='M20 30l-8-8' opacity='.6' />
        </svg>
      );
    case 'ledger':
      return (
        <svg {...common}>
          <rect x='22' y='16' width='62' height='84' rx='8' />
          <path d='M36 38h34M36 54h34M36 70h20' />
          <path d='M78 84l8 8 18-20' strokeWidth={3} />
          <path d='M92 22h10v52' opacity='.5' />
        </svg>
      );
    case 'people':
      return (
        <svg {...common}>
          <circle cx='44' cy='40' r='14' />
          <path d='M16 96c2-18 14-28 28-28s26 10 28 28' />
          <circle cx='84' cy='48' r='10' opacity='.75' />
          <path d='M78 70c14 0 24 8 26 24' opacity='.75' />
        </svg>
      );
    case 'chart':
      return (
        <svg {...common}>
          <path d='M18 100h88' />
          <rect x='26' y='62' width='14' height='38' rx='3' />
          <rect x='52' y='44' width='14' height='56' rx='3' />
          <rect x='78' y='26' width='14' height='74' rx='3' />
          <path d='M24 44l26-18 20 8 30-22' strokeWidth={3} opacity='.7' />
        </svg>
      );
    case 'seal':
      return (
        <svg {...common}>
          <circle cx='60' cy='50' r='30' />
          <circle cx='60' cy='50' r='19' opacity='.6' />
          <path d='M50 50l7 7 14-15' strokeWidth={3} />
          <path d='M44 76l-8 30 24-12 24 12-8-30' />
        </svg>
      );
  }
}
