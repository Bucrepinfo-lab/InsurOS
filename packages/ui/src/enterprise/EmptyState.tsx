import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className='flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed bg-white p-8 text-center'>
      <h3 className='text-base font-semibold text-slate-950'>{title}</h3>
      {description ? <p className='mt-2 max-w-md text-sm text-slate-500'>{description}</p> : null}
      {action ? <div className='mt-4'>{action}</div> : null}
    </div>
  );
}
