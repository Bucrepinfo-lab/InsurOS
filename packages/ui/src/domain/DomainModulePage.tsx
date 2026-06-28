import type { ReactNode } from 'react';
import { WorkspaceHeader } from '../enterprise/WorkspaceHeader';

export interface DomainModulePageProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function DomainModulePage({
  title,
  description,
  actions,
  children
}: DomainModulePageProps) {
  return (
    <>
      <WorkspaceHeader title={title} description={description} actions={actions} />
      {children}
    </>
  );
}
