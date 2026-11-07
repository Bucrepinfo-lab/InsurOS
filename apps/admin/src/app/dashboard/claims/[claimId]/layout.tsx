import type { ReactNode } from 'react';
import { RecordGate } from '@/components/auth/record-gate';

// Server-enforced: own-records roles only open claims that are theirs.
export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ claimId: string }> }) {
  const { claimId } = await params;
  return <RecordGate kind='claim' id={claimId}>{children}</RecordGate>;
}
