import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  type DataTableColumn
} from '@insuros/ui';
import { ActionButton } from '@/components/ActionButton';
import { queueDemoRequest } from '@/app/dashboard/actions';

export const metadata = { title: 'Coverages' };

type PolicyCoverageRow = {
  name: string;
  limit: string;
  deductible: string;
  status: string;
};

const coverages: PolicyCoverageRow[] = [
  {
    name: 'Own Damage',
    limit: 'Market value',
    deductible: 'KES 25,000',
    status: 'Active'
  },
  {
    name: 'Third Party Liability',
    limit: 'Statutory limit',
    deductible: 'None',
    status: 'Active'
  }
];

const columns: DataTableColumn<PolicyCoverageRow>[] = [
  { key: 'name', header: 'Coverage' },
  { key: 'limit', header: 'Limit' },
  { key: 'deductible', header: 'Deductible' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <Badge tone='success'>{row.status}</Badge>
  }
];

export default function PolicyCoveragesPage() {
  return (
    <DomainModulePage
      title='Policy Coverages'
      description='View coverages, limits, deductibles, exclusions, and insured interests attached to this policy.'
      actions={<ActionButton label='Add Coverage' action={queueDemoRequest.bind(null, 'Add Coverage')} />}
    >
      <DomainEntityList
        title='Coverages'
        description='Coverage schedule for this policy.'
        searchPlaceholder='Search policy coverages...'
        columns={columns}
        data={coverages}
        emptyTitle='No coverages'
        emptyDescription='Add coverage items to this policy.'
        emptyAction={<Button>Add Coverage</Button>}
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}