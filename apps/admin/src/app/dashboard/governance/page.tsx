import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import { AdminHierarchyService } from '@insuros/services';

const adminHierarchyService = new AdminHierarchyService();

export default async function GovernancePage() {
  const regions = await adminHierarchyService.getRegions();
  const appointments = await adminHierarchyService.getAppointments();

  type RegionRow = (typeof regions)[number];

  const columns: DataTableColumn<RegionRow>[] = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Region' },
    {
      key: 'level',
      header: 'Level',
      render: (row) => <Badge tone='neutral'>{row.level}</Badge>
    },
    {
      key: 'parentRegionId',
      header: 'Parent',
      render: (row) =>
        regions.find((region) => region.id === row.parentRegionId)?.name ?? '—'
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge tone={row.status === 'Active' ? 'success' : 'warning'}>
          {row.status}
        </Badge>
      )
    }
  ];

  const continents = regions.filter((region) => region.level === 'Continental');
  const nations = regions.filter((region) => region.level === 'National');
  const counties = regions.filter((region) => region.level === 'County');
  const constituencies = regions.filter(
    (region) => region.level === 'Constituency'
  );

  return (
    <DomainModulePage
      title='Governance'
      description='Multi-continental administrative hierarchy: Super Admin → Continental → National → County → Constituency.'
      actions={<Button>Create Region</Button>}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-5'>
        <KPICard
          title='Continents'
          value={String(continents.length)}
          change='Continental jurisdictions'
        />
        <KPICard
          title='Nations'
          value={String(nations.length)}
          change='National jurisdictions'
        />
        <KPICard
          title='Counties'
          value={String(counties.length)}
          change='County jurisdictions'
        />
        <KPICard
          title='Constituencies'
          value={String(constituencies.length)}
          change='Constituency jurisdictions'
        />
        <KPICard
          title='Administrators'
          value={String(appointments.filter((item) => item.status === 'Active').length)}
          change='Active appointments'
        />
      </div>

      <DomainEntityList
        title='Administrative Regions'
        description='All jurisdictions in the InsurOS control plane.'
        searchPlaceholder='Search regions...'
        columns={columns}
        data={regions}
        emptyTitle='No regions'
        emptyDescription='No administrative regions have been configured.'
        emptyAction={<Button>Create Region</Button>}
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}
