import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  type DataTableColumn
} from '@insuros/ui';

type CoverageRow = {
  name: string;
  type: string;
  limit: string;
  status: string;
};

const coverages: CoverageRow[] = [
  {
    name: 'Own Damage',
    type: 'Mandatory',
    limit: 'Market value',
    status: 'Active'
  },
  {
    name: 'Third Party Liability',
    type: 'Mandatory',
    limit: 'Statutory limit',
    status: 'Active'
  }
];

const columns: DataTableColumn<CoverageRow>[] = [
  { key: 'name', header: 'Coverage' },
  { key: 'type', header: 'Type' },
  { key: 'limit', header: 'Limit' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <Badge tone='success'>{row.status}</Badge>
  }
];

export default function ProductCoveragesPage() {
  return (
    <DomainModulePage
      title='Coverage Builder'
      description='Configure mandatory and optional product coverages, limits, deductibles, and exclusions.'
      actions={<Button>Add Coverage</Button>}
    >
      <DomainEntityList
        title='Coverages'
        description='Coverage definitions attached to this product version.'
        searchPlaceholder='Search coverages...'
        columns={columns}
        data={coverages}
        emptyTitle='No coverages'
        emptyDescription='Add the first coverage definition for this product.'
        emptyAction={<Button>Add Coverage</Button>}
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}