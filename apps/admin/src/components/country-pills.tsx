import Link from 'next/link';
import type { CountryProfile } from '@insuros/domain';

const STATUS_WORD: Record<CountryProfile['status'], string> = {
  verified: 'checked against the law',
  indicative: 'to be confirmed',
  'not-set': 'not set'
};

/** One pill per country; the chosen one is plain text. Keeps the other query values. */
export function CountryPills({
  profiles,
  current,
  basePath,
  keep = {}
}: {
  profiles: CountryProfile[];
  current: string;
  basePath: string;
  keep?: Record<string, string>;
}) {
  return (
    <nav aria-label='Country' className='mb-5 flex flex-wrap gap-2'>
      {profiles.map((profile) => {
        const query = new URLSearchParams({ ...keep, country: profile.countryCode }).toString();
        return profile.countryCode === current ? (
          <span key={profile.countryCode} aria-current='page' className='rounded-full bg-seal px-3.5 py-1.5 text-sm font-medium text-white'>
            {profile.country}
          </span>
        ) : (
          <Link
            key={profile.countryCode}
            href={`${basePath}?${query}`}
            className='rounded-full border border-line bg-sheet px-3.5 py-1.5 text-sm font-medium text-dim transition hover:border-seal/50 hover:text-seal'
          >
            {profile.country}
          </Link>
        );
      })}
    </nav>
  );
}

/** Where a country stands: what its figures are based on, and whether selling is switched on. */
export function CountryStatus({ profile, sellReason }: { profile: CountryProfile; sellReason: string | null }) {
  return (
    <div
      className={`mb-6 rounded-2xl border px-5 py-4 text-sm ${
        profile.status === 'verified' ? 'border-seal/30 bg-sealsoft text-ink' : 'border-warnink/30 bg-warnink/5 text-ink'
      }`}
    >
      <p>
        <strong>
          {profile.country}, {profile.currency}: figures {STATUS_WORD[profile.status]}.
        </strong>{' '}
        Regulator: {profile.regulator}.{' '}
        {sellReason ? sellReason : `Approved by ${profile.approvedBy} on ${profile.approvedAt}.`}
      </p>
      {profile.sources.length > 0 ? (
        <p className='mt-1 text-dim'>
          Source:{' '}
          {profile.sources.map((source, index) => (
            <span key={source}>
              {index > 0 ? ', ' : ''}
              <a href={source} target='_blank' rel='noopener noreferrer' className='underline underline-offset-2 hover:text-seal'>
                {new URL(source).hostname}
              </a>
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}

/** "KES 60,000" */
export function money(currency: string, value: number): string {
  return `${currency} ${Math.round(value).toLocaleString('en-GB')}`;
}

export function pickCountry(raw: string | string[] | undefined, profiles: CountryProfile[]): CountryProfile {
  const code = (Array.isArray(raw) ? raw[0] : raw)?.toUpperCase();
  return profiles.find((profile) => profile.countryCode === code) ?? profiles[0]!;
}

export function numberParam(raw: string | string[] | undefined, fallback: number, max = 1_000_000_000): number {
  const text = (Array.isArray(raw) ? raw[0] : raw)?.replace(/[ ,]/g, '');
  const value = Number(text);
  return text && Number.isFinite(value) && value >= 0 && value <= max ? value : fallback;
}
