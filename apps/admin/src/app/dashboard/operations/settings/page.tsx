import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import { PlatformSettingService } from '@insuros/services';
import { ActionButton } from '@/components/ActionButton';
import { createDemoSetting } from '@/app/dashboard/actions';

export const metadata = { title: 'Platform settings' };

const platformSettingService = new PlatformSettingService();

export default async function PlatformSettingsPage() {
  const settings = await platformSettingService.getSettings();

  type SettingRow = (typeof settings)[number];

  const columns: DataTableColumn<SettingRow>[] = [
    { key: 'key', header: 'Key' },
    { key: 'label', header: 'Label' },
    {
      key: 'scope',
      header: 'Scope',
      render: (row) => <Badge tone='neutral'>{row.scope}</Badge>
    },
    { key: 'valueType', header: 'Type' },
    { key: 'value', header: 'Value' },
    { key: 'updatedAt', header: 'Updated At' }
  ];

  const scopes = new Set(settings.map((setting) => setting.scope));

  return (
    <DomainModulePage
      title='Platform Settings'
      description='Runtime configuration across platform, tenant, module, workflow, and security scopes.'
      actions={<ActionButton label='Create setting' action={createDemoSetting} />}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <KPICard
          title='Settings'
          value={String(settings.length)}
          change='Registered settings'
        />
        <KPICard
          title='Scopes'
          value={String(scopes.size)}
          change='Configuration scopes'
        />
        <KPICard
          title='Security Scope'
          value={String(settings.filter((setting) => setting.scope === 'Security').length)}
          change='Security-sensitive settings'
        />
      </div>

      <DomainEntityList
        title='Setting Registry'
        description='Central registry of platform runtime configuration.'
        searchPlaceholder='Search settings...'
        columns={columns}
        data={settings}
        emptyTitle='No settings'
        emptyDescription='No platform settings have been configured.'
        emptyAction={<Button>Create Setting</Button>}
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}
