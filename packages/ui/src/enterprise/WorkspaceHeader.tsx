import type { ReactNode } from 'react';

export interface WorkspaceHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function WorkspaceHeader({ title, description, actions }: WorkspaceHeaderProps) {
  return (
    <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
      <div>
        <div className='flex items-center gap-3'>
          <span
            className='h-8 w-1 rounded-full'
            style={{ backgroundImage: 'linear-gradient(180deg, #17a37e, #0f6e56)' }}
            aria-hidden='true'
          />
          <h1 className='font-display text-[36px] leading-tight tracking-tight text-ink'>
            {title}
          </h1>
        </div>
        {description ? (
          <p className='mt-2 max-w-2xl pl-4 text-sm leading-relaxed text-dim'>
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className='flex shrink-0 items-center gap-2'>{actions}</div> : null}
    </div>
  );
}
