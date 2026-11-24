import { redirect } from 'next/navigation';
import { requirePageAccess } from "@/lib/auth/page-access";

// The policy's own page shows its cover, premium and claims from the record.
export default async function Page({ params }: { params: Promise<{ customerId: string; policyId: string }> }) {
  await requirePageAccess("/dashboard/customers/[customerId]/policies/[policyId]/documents");
  const { policyId } = await params;
  redirect(`/dashboard/policies/${encodeURIComponent(policyId)}`);
}
