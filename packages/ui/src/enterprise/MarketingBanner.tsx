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
  const ctaClass =
    'mt-3 inline-block rounded-md bg-seal px-4 py-2 text-sm font-medium text-white transition hover:bg-sealdark';

  return (
    <div className='mb-6 rounded-xl border border-seal/25 bg-sealsoft p-6'>
      <p className='font-display text-xl leading-snug text-sealdark'>{headline}</p>
      <p className='mt-1.5 max-w-3xl text-sm leading-relaxed text-seal'>{body}</p>
      {ctaHref ? (
        <a href={ctaHref} className={ctaClass}>
          {cta}
        </a>
      ) : (
        <span className={ctaClass}>{cta}</span>
      )}
    </div>
  );
}
