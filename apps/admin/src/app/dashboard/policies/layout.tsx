import type { ReactNode } from 'react';
import { ScopeGate } from '@/components/auth/scope-gate';

// Server-enforced: only roles holding Policies:View receive this section.
export default function Layout({ children }: { children: ReactNode }) {
  return <ScopeGate scope='Policies'>{children}</ScopeGate>;
}
