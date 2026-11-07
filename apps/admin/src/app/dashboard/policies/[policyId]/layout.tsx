import type { ReactNode } from 'react';
import { RecordGate } from '@/components/auth/record-gate';

// Server-enforced: own-records roles only open policies that are theirs.
export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ policyId: string }> }) {
  const { policyId } = await params;
  return <RecordGate kind='policy' id={policyId}>{children}</RecordGate>;
}
