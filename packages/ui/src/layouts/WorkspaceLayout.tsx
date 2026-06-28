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
    <div className={cn('min-h-screen bg-slate-50 text-slate-950', className)}>
      <div className='flex min-h-screen'>
        <aside className='hidden w-72 border-r bg-white lg:block'>
          {sidebar}
        </aside>

        <div className='flex min-w-0 flex-1 flex-col'>
          {topbar ? (
            <header className='border-b bg-white px-6 py-4'>
              {topbar}
            </header>
          ) : null}

          <main className='flex-1 p-6'>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
