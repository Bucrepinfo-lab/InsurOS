import { DomainModulePage } from '@insuros/ui';
import { ClaimService } from '@insuros/services';
import { CreateGate } from '@/components/create-gate';
import { DocumentForm } from '@/components/document-form';
import { currentReach } from '@/lib/record-scope';
import { requirePageAccess } from "@/lib/auth/page-access";

export const metadata = { title: 'Record a document' };
export const dynamic = 'force-dynamic';

export default async function NewDocumentPage() {
  await requirePageAccess("/dashboard/operations/documents/new");
  // Only claims this person may see can be picked; the action checks the pick again.
  const claims = await new ClaimService().getClaimsFor(await currentReach('Claims'));

  return (
    <DomainModulePage
      title='Record a document'
      description='Put a claim document’s details on record: a repair invoice, medical receipt, police abstract or log book.'
    >
      <CreateGate scope='Operations'>
        <DocumentForm claims={[...new Set(claims.map((claim) => claim.claimNumber))].sort()} />
      </CreateGate>
    </DomainModulePage>
  );
}
