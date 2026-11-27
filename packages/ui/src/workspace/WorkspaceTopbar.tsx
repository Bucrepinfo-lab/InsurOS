import type { ReactNode } from 'react';

export interface WorkspaceTopbarProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}

export function WorkspaceTopbar({ left, center, right }: WorkspaceTopbarProps) {
  return (
    // Owner 27/11/26: on a phone with large text this row pushed the page wider
    // than the screen. The left side now shrinks; the buttons on the right stay.
    <div className='flex h-16 min-w-0 items-center justify-between gap-2 sm:gap-3'>
      <div className='flex min-w-0 flex-1 items-center gap-2 overflow-hidden sm:gap-3 md:flex-none'>{left}</div>
      <div className='hidden flex-1 justify-center px-6 md:flex'>{center}</div>
      <div className='flex shrink-0 items-center gap-2 sm:gap-3'>{right}</div>
    </div>
  );
}
