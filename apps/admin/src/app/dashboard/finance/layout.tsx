import type { ReactNode } from 'react';
import { ScopeGate } from '@/components/auth/scope-gate';

// Server-enforced: only roles holding Finance:View receive this section.
export default function Layout({ children }: { children: ReactNode }) {
  return <ScopeGate scope='Finance'>{children}</ScopeGate>;
}
