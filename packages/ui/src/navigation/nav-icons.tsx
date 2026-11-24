import type { ReactNode } from 'react';

/**
 * Line icons for the menu, drawn in the Ledger's hand: one stroke weight,
 * round ends, no fills. Each is a list of SVG path strings on a 24px grid.
 * Every menu id resolves to an icon; an unknown id falls back to the dot.
 */
const SHAPES = {
  home: ['M4 11l8-7 8 7', 'M6 10v10h12V10', 'M10 20v-5h4v5'],
  bell: ['M6 16V11a6 6 0 1112 0v5l1.5 2h-15z', 'M10 20a2 2 0 004 0'],
  chat: ['M4 5h16v11H9l-5 4z', 'M8 9h8', 'M8 12h5'],
  person: ['M12 12a4 4 0 100-8 4 4 0 000 8z', 'M5 20a7 7 0 0114 0'],
  people: ['M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7z', 'M3 20a6 6 0 0112 0', 'M16 4.5a3.5 3.5 0 010 6.5', 'M17 14a6 6 0 014 6'],
  building: ['M4 20h16', 'M6 20V5h8v15', 'M14 9h4v11', 'M9 8h2', 'M9 12h2', 'M9 16h2'],
  key: ['M14 10a4 4 0 10-3.5 4L4 20.5V20h3v-2h2v-2h2l1-1', 'M15.5 8.5h.01'],
  sync: ['M4 12a8 8 0 0114-5.3L20 9', 'M20 4v5h-5', 'M20 12a8 8 0 01-14 5.3L4 15', 'M4 20v-5h5'],
  scale: ['M12 4v16', 'M7 20h10', 'M5 8h14', 'M5 8l-3 6a3 3 0 006 0z', 'M19 8l-3 6a3 3 0 006 0z'],
  calendar: ['M4 6h16v14H4z', 'M4 10h16', 'M8 3v5', 'M16 3v5'],
  shield: ['M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z', 'M9 12l2 2 4-4'],
  doc: ['M6 3h8l4 4v14H6z', 'M14 3v4h4', 'M9 12h6', 'M9 16h6'],
  store: ['M4 9l1.5-5h13L20 9', 'M4 9h16v2a3 3 0 01-5.3 2 3 3 0 01-5.4 0A3 3 0 014 11z', 'M5 13v7h14v-7'],
  gauge: ['M4 16a8 8 0 1116 0', 'M12 16l4-5', 'M4 16h2', 'M18 16h2'],
  seed: ['M12 21v-8', 'M12 13c0-4 3-7 7-7 0 4-3 7-7 7z', 'M12 15c0-3-2.5-5.5-6-5.5 0 3 2.5 5.5 6 5.5z'],
  link: ['M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1', 'M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1'],
  news: ['M4 5h13v14a1 1 0 001 1H6a2 2 0 01-2-2z', 'M17 9h3v9a2 2 0 01-2 2', 'M7 9h7', 'M7 13h7', 'M7 16h4'],
  policy: ['M6 3h12v18l-3-2-3 2-3-2-3 2z', 'M9 8h6', 'M9 12h6'],
  claim: ['M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z', 'M12 8v5', 'M12 16h.01'],
  bolt: ['M13 3L5 13h6l-1 8 8-10h-6z'],
  camera: ['M4 8h3l2-3h6l2 3h3v11H4z', 'M12 17a3.5 3.5 0 100-7 3.5 3.5 0 000 7z'],
  coins: ['M8 8a5 2.5 0 1010 0 5 2.5 0 00-10 0', 'M8 8v4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V8', 'M6 12.5C4.2 12.9 3 13.7 3 14.5c0 1.4 2.2 2.5 5 2.5', 'M3 14.5v3c0 1.4 2.2 2.5 5 2.5 1.6 0 3-.4 4-1'],
  receipt: ['M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21z', 'M9 8h6', 'M9 12h6', 'M9 16h3'],
  globe: ['M12 21a9 9 0 100-18 9 9 0 000 18z', 'M3 12h18', 'M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9', 'M12 3c-2.5 2.5-3.5 5.5-3.5 9s1 6.5 3.5 9'],
  chart: ['M4 20h16', 'M7 16v-5', 'M12 16V7', 'M17 16v-8'],
  trend: ['M4 17l5-5 4 3 7-8', 'M15 7h5v5'],
  target: ['M12 21a9 9 0 100-18 9 9 0 000 18z', 'M12 16a4 4 0 100-8 4 4 0 000 8z', 'M12 12h.01'],
  percent: ['M19 5L5 19', 'M7 9a2 2 0 100-4 2 2 0 000 4z', 'M17 19a2 2 0 100-4 2 2 0 000 4z'],
  handshake: ['M3 11l4-4 4 2 3-2 7 5-4 4', 'M7 15l3 3', 'M10 13l3 3', 'M13 11l3 3', 'M3 11l4 5'],
  balance: ['M4 18l5-7 4 4 7-9', 'M4 6v12h16'],
  share: ['M18 8a3 3 0 100-6 3 3 0 000 6z', 'M6 15a3 3 0 100-6 3 3 0 000 6z', 'M18 22a3 3 0 100-6 3 3 0 000 6z', 'M8.6 13.5l6.8 4', 'M15.4 6.5l-6.8 4'],
  gear: ['M12 15a3 3 0 100-6 3 3 0 000 6z', 'M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z'],
  folder: ['M3 7h7l2 2h9v10H3z'],
  contacts: ['M5 3h13v18H5z', 'M3 7h2', 'M3 12h2', 'M3 17h2', 'M11.5 11a2.5 2.5 0 100-5 2.5 2.5 0 000 5z', 'M8 16a3.5 3.5 0 017 0'],
  bulb: ['M9 18h6', 'M10 21h4', 'M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z'],
  pulse: ['M3 12h4l2-6 4 12 2-6h6'],
  flag: ['M5 21V4', 'M5 4h12l-2 4 2 4H5'],
  check: ['M4 12l5 5L20 6'],
  stamp: ['M9 3h6v5l2 3H7l2-3z', 'M5 14h14v3H5z', 'M5 21h14'],
  dot: ['M12 14a2 2 0 100-4 2 2 0 000 4z']
} satisfies Record<string, string[]>;

export type NavIconName = keyof typeof SHAPES;

/** Menu id → icon. Ids that share a meaning share a shape. */
export const NAV_ICON_FOR: Record<string, NavIconName> = {
  dashboard: 'home',
  'follow-ups': 'bell',
  messages: 'chat',
  'my-record': 'person',
  tenants: 'building',
  identity: 'key',
  'clerk-sync': 'sync',
  governance: 'scale',
  appointments: 'calendar',
  access: 'shield',
  legal: 'doc',
  marketplace: 'store',
  'pricing-engine': 'gauge',
  micro: 'seed',
  customers: 'people',
  'customer-home-links': 'link',
  'customer-news': 'news',
  policies: 'policy',
  claims: 'claim',
  'claims-automation': 'bolt',
  'claims-evidence': 'camera',
  finance: 'coins',
  tax: 'receipt',
  'regional-tax': 'globe',
  analytics: 'chart',
  subscribers: 'people',
  sales: 'trend',
  'sales-assignments': 'target',
  'sales-commissions': 'percent',
  'commission-plan': 'handshake',
  'break-even': 'balance',
  referrals: 'share',
  operations: 'gear',
  documents: 'folder',
  crm: 'contacts',
  insight: 'bulb',
  activity: 'pulse',
  notifications: 'bell',
  escalations: 'flag',
  approvals: 'check',
  audit: 'stamp'
};

/** Pure: the icon name for a menu id (the dot when none is assigned). */
export function navIconName(id: string): NavIconName {
  return NAV_ICON_FOR[id] ?? 'dot';
}

/** The path list for an icon name (exposed for tests). */
export function navIconPaths(name: NavIconName): readonly string[] {
  return SHAPES[name];
}

export function NavIcon({ id, size = 18 }: { id: string; size?: number }): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.6'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      focusable='false'
    >
      {SHAPES[navIconName(id)].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
