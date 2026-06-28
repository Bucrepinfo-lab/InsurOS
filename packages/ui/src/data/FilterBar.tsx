import type { ReactNode } from 'react';

export interface FilterBarProps {
  search?: ReactNode;
  filters?: ReactNode;
  actions?: ReactNode;
}

export function FilterBar({ search, filters, actions }: FilterBarProps) {
  return (
    <div className='mb-4 flex flex-col gap-3 rounded-lg border bg-white p-4 md:flex-row md:items-center md:justify-between'>
      <div className='flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:items-center'>
        {search ? <div className='w-full md:max-w-sm'>{search}</div> : null}
        {filters ? <div className='flex flex-wrap items-center gap-2'>{filters}</div> : null}
      </div>

      {actions ? <div className='flex items-center gap-2'>{actions}</div> : null}
    </div>
  );
}
