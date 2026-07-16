export interface MarketingBannerProps {
  headline: string;
  body: string;
  cta: string;
  ctaHref?: string;
}

/**
 * Merit-led marketing banner rendered across policy-facing UIs. Server
 * component friendly — no client hooks.
 */
export function MarketingBanner({ headline, body, cta, ctaHref }: MarketingBannerProps) {
  return (
    <div className='mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5'>
      <p className='text-lg font-semibold text-emerald-900'>{headline}</p>
      <p className='mt-1 text-sm text-emerald-800'>{body}</p>
      {ctaHref ? (
        <a
          href={ctaHref}
          className='mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white'
        >
          {cta}
        </a>
      ) : (
        <span className='mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white'>
          {cta}
        </span>
      )}
    </div>
  );
}
