export function GlobalSearch() {
  return (
    <div className='w-full max-w-xl'>
      <input
        className='h-10 w-full rounded-md border border-slate-300 bg-slate-50 px-3 text-sm outline-none focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-200'
        placeholder='Search customers, policies, claims, products...'
      />
    </div>
  );
}
