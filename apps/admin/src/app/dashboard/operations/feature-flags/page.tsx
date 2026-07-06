import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import { FeatureFlagService } from '@insuros/services';

const featureFlagService = new FeatureFlagService();

export default async function FeatureFlagsPage() {
  const flags = await featureFlagService.getFeatureFlags();

  type FeatureFlagRow = (typeof flags)[number];

  const columns: DataTableColumn<FeatureFlagRow>[] = [
    { key: 'key', header: 'Key' },
    { key: 'name', header: 'Name' },
    { key: 'scope', header: 'Scope' },
    {
      key: 'enabled',
      header: 'Enabled',
      render: (row) => (
        <Badge tone={row.enabled ? 'success' : 'warning'}>
          {row.enabled ? 'Enabled' : 'Disabled'}
        </Badge>
      )
    },
    { key: 'updatedAt', header: 'Updated At' }
  ];

  return (
    <DomainModulePage
      title='Feature Flags'
      description='Manage platform, tenant, and module feature flags used to control runtime capabilities.'
      actions={<Button>Create Feature Flag</Button>}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <KPICard
          title='Feature Flags'
          value={String(flags.length)}
          change='Registered flags'
        />
        <KPICard
          title='Enabled'
          value={String(flags.filter((flag) => flag.enabled).length)}
          change='Active features'
        />
        <KPICard
          title='Disabled'
          value={String(flags.filter((flag) => !flag.enabled).length)}
          change='Inactive features'
        />
      </div>

      <DomainEntityList
        title='Feature Flag Registry'
        description='Central registry of runtime feature controls.'
        searchPlaceholder='Search feature flags...'
        columns={columns}
        data={flags}
        emptyTitle='No feature flags'
        emptyDescription='No feature flags have been configured.'
        emptyAction={<Button>Create Feature Flag</Button>}
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}
