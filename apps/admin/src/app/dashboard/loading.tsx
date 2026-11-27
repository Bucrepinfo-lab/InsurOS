/**
 * Shown the moment a menu item or link is tapped, while the next screen loads
 * (owner 27/11/26: taps felt slow on phones). The menu stays; only the page
 * area shows this light outline. No data.
 */
export default function Loading() {
  return (
    <div className='grid max-w-4xl gap-4' aria-busy='true' aria-live='polite'>
      <span className='sr-only'>Loading…</span>
      <div className='h-1 overflow-hidden rounded-full bg-sealsoft'>
        <div className='h-full w-1/3 animate-pulse rounded-full bg-seal motion-reduce:animate-none' />
      </div>
      <div className='h-8 w-1/2 rounded-xl bg-ink/5' />
      <div className='h-28 animate-pulse rounded-2xl border border-line bg-sheet motion-reduce:animate-none' />
      <div className='h-20 animate-pulse rounded-2xl border border-line bg-sheet motion-reduce:animate-none' />
      <div className='h-28 animate-pulse rounded-2xl border border-line bg-sheet motion-reduce:animate-none' />
    </div>
  );
}
