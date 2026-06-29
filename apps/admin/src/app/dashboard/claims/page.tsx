import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  type DataTableColumn
} from '@insuros/ui';

type ClaimRow = {
  claimNumber: string;
  policyNumber: string;
  customer: string;
  status: string;
  amount: string;
};

const claims: ClaimRow[] = [
  {
    claimNumber: 'CLM-2026-0001',
    policyNumber: 'POL-2026-0001',
    customer: 'Demo Customer',
    status: 'Open',
    amount: 'KES 120,000'
  }
];

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

export default function ClaimsPage() {
  return (
    <DomainModulePage
      title='Claims Management'
      description='Manage FNOL, claim assessment, reserves, approvals, settlement, recovery, and closure.'
      actions={<Button>Register Claim</Button>}
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
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}