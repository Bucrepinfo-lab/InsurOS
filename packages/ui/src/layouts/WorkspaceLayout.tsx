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
    <div className={cn('min-h-screen bg-paper text-ink', className)}>
      <div className='flex min-h-screen'>
        <aside className='hidden w-72 bg-ink lg:block'>
          {sidebar}
        </aside>

        <div className='flex min-w-0 flex-1 flex-col'>
          {topbar ? (
            <header className='border-b border-line bg-sheet px-6'>
              {topbar}
            </header>
          ) : null}

          <main className='animate-rise flex-1 p-6 lg:px-10 lg:py-8'>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
