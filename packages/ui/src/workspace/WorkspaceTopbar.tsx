import type { ReactNode } from 'react';

export interface WorkspaceTopbarProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}

export function WorkspaceTopbar({ left, center, right }: WorkspaceTopbarProps) {
  return (
    <div className='flex h-16 items-center justify-between border-b bg-white px-6'>
      <div className='flex items-center gap-3'>{left}</div>
      <div className='hidden flex-1 justify-center px-6 md:flex'>{center}</div>
      <div className='flex items-center gap-3'>{right}</div>
    </div>
  );
}
