export interface MarketingBannerProps {
  headline: string;
  body: string;
  cta: string;
  ctaHref?: string;
}

/**
 * Showpiece merit banner: deep seal gradient, radial glow, grain, Fraunces
 * headline. Server component friendly — no client hooks.
 */
export function MarketingBanner({ headline, body, cta, ctaHref }: MarketingBannerProps) {
  const ctaClass =
    'mt-4 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-sealdark shadow-[0_6px_18px_-8px_rgba(0,0,0,0.45)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_10px_24px_-8px_rgba(0,0,0,0.5)]';

  return (
    <div
      className='relative mb-7 overflow-hidden rounded-2xl p-7 text-white shadow-[0_18px_44px_-18px_rgba(6,56,47,0.55)]'
      style={{
        backgroundImage:
          'radial-gradient(640px 260px at 85% -30%, rgba(23,163,126,0.55), transparent 65%), radial-gradient(420px 220px at -5% 115%, rgba(185,138,47,0.25), transparent 60%), linear-gradient(135deg, #0a4a3c 0%, #06382f 55%, #052e27 100%)'
      }}
    >
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 opacity-[0.07]'
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
        }}
      />
      <div className='relative'>
        <p className='text-[10px] font-medium uppercase tracking-[0.28em] text-white/60'>
          Why InsurOS
        </p>
        <p className='mt-2 max-w-3xl font-display text-[26px] leading-snug'>
          {headline}
        </p>
        <p className='mt-2 max-w-3xl text-sm leading-relaxed text-white/75'>{body}</p>
        {ctaHref ? (
          <a href={ctaHref} className={ctaClass}>
            {cta}
          </a>
        ) : (
          <span className={ctaClass}>{cta}</span>
        )}
      </div>
    </div>
  );
}
