import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  type DataTableColumn
} from '@insuros/ui';
import { ClaimService } from '@insuros/services';
import { ActionButton } from '@/components/ActionButton';
import { registerDemoClaim } from '@/app/dashboard/actions';

type ClaimRow = Awaited<ReturnType<ClaimService['getClaims']>>[number];

const columns: DataTableColumn<ClaimRow>[] = [
  { key: 'claimNumber', header: 'Claim No.' },
  { key: 'policyNumber', header: 'Policy No.' },
  { key: 'customer', header: 'Customer' },
  { key: 'amount', header: 'Claimed Amount' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <Badge tone='warning'>{row.status}</Badge>
  }
];

export default async function ClaimsPage() {
  const claims = await new ClaimService().getClaims();
  return (
    <DomainModulePage
      title='Claims Management'
      description='Manage FNOL, claim assessment, reserves, approvals, settlement, recovery, and closure.'
      actions={<ActionButton label='Register claim' action={registerDemoClaim} />}
    >
      <DomainEntityList
        title='Claims'
        description='Claims currently managed by the platform.'
        searchPlaceholder='Search claims...'
        columns={columns}
        data={claims}
        emptyTitle='No claims'
        emptyDescription='Register the first claim.'
        emptyAction={<Button>Register Claim</Button>}
      />
    </DomainModulePage>
  );
}
