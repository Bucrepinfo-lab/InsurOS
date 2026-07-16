import type { ReactNode } from 'react';

export interface WorkspaceHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function WorkspaceHeader({ title, description, actions }: WorkspaceHeaderProps) {
  return (
    <div className='mb-7 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between'>
      <div>
        <h1 className='font-display text-[32px] leading-tight tracking-tight text-ink'>
          {title}
        </h1>
        {description ? (
          <p className='mt-1.5 max-w-2xl text-sm leading-relaxed text-dim'>{description}</p>
        ) : null}
      </div>
      {actions ? <div className='flex shrink-0 items-center gap-2'>{actions}</div> : null}
    </div>
  );
}
