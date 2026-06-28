import type { ReactNode } from 'react';

export interface TableToolbarProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
}

export function TableToolbar({ title, description, actions }: TableToolbarProps) {
  return (
    <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
      <div>
        {title ? <h2 className='text-lg font-semibold text-slate-950'>{title}</h2> : null}
        {description ? <p className='mt-1 text-sm text-slate-500'>{description}</p> : null}
      </div>

      {actions ? <div className='flex items-center gap-2'>{actions}</div> : null}
    </div>
  );
}
