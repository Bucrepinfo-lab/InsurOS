import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface WorkspaceLayoutProps {
  sidebar: ReactNode;
  topbar?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function WorkspaceLayout({
  sidebar,
  topbar,
  children,
  className
}: WorkspaceLayoutProps) {
  return (
    <div className={cn('min-h-screen text-ink', className)}>
      <div className='flex min-h-screen'>
        <aside className='hidden w-72 lg:block' style={{ backgroundImage: 'linear-gradient(168deg, #17253f 0%, #101c31 58%, #0b1526 100%)' }}>
          {sidebar}
        </aside>

        <div className='flex min-w-0 flex-1 flex-col'>
          {topbar ? (
            <header className='sticky top-0 z-20 border-b border-line/80 bg-sheet/80 px-6 backdrop-blur-md'>
              {topbar}
            </header>
          ) : null}

          <main className='stagger flex-1 p-6 lg:px-10 lg:py-8'>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
