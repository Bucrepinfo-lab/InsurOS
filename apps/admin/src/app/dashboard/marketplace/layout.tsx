import type { ReactNode } from 'react';
import { ScopeGate } from '@/components/auth/scope-gate';

// Server-enforced: only roles holding Marketplace:View receive this section.
export default function Layout({ children }: { children: ReactNode }) {
  return <ScopeGate scope='Marketplace'>{children}</ScopeGate>;
}
