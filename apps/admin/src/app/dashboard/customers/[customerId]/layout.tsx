import type { ReactNode } from 'react';
import { RecordGate } from '@/components/auth/record-gate';

// Server-enforced: own-records roles only open customers that are theirs.
export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ customerId: string }> }) {
  const { customerId } = await params;
  return <RecordGate kind='customer' id={customerId}>{children}</RecordGate>;
}
