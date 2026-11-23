import { redirect } from 'next/navigation';

// The policy's own page shows its cover, premium and claims from the record.
export default async function Page({ params }: { params: Promise<{ customerId: string; policyId: string }> }) {
  const { policyId } = await params;
  redirect(`/dashboard/policies/${encodeURIComponent(policyId)}`);
}
