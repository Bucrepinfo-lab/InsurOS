import { DomainModulePage } from '@insuros/ui';
import { PolicyService } from '@insuros/services';
import { CreateGate } from '@/components/create-gate';
import { ClaimForm } from '@/components/record-forms';
import { currentReach } from '@/lib/record-scope';
import { requirePageAccess } from "@/lib/auth/page-access";

export const metadata = { title: 'Register claim' };
export const dynamic = 'force-dynamic';

export default async function NewClaimPage() {
  await requirePageAccess("/dashboard/claims/new");
  // Only in-force policies this person may see; the service checks the pick again.
  const options = await new PolicyService().getClaimablePolicyOptions(await currentReach('Policies'));

  return (
    <DomainModulePage title='Register claim' description='The first notice of a claim. It opens with a status and waits for an owner; a person makes the decision.'>
      <CreateGate scope='Claims'>
        <ClaimForm policies={options.map((option) => ({ id: option.id, label: option.label }))} />
      </CreateGate>
    </DomainModulePage>
  );
}
