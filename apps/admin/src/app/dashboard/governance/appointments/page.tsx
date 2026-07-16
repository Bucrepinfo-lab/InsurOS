import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import { ActionButton } from '@/components/ActionButton';
import { appointDemoAdmin } from '@/app/dashboard/actions';
import { AdminHierarchyService } from '@insuros/services';

const adminHierarchyService = new AdminHierarchyService();

export default async function AdminAppointmentsPage() {
  const appointments = await adminHierarchyService.getAppointments();
  const regions = await adminHierarchyService.getRegions();

  type AppointmentRow = (typeof appointments)[number];

  const columns: DataTableColumn<AppointmentRow>[] = [
    { key: 'userName', header: 'Administrator' },
    { key: 'email', header: 'Email' },
    {
      key: 'level',
      header: 'Level',
      render: (row) => <Badge tone='neutral'>{row.level}</Badge>
    },
    {
      key: 'regionId',
      header: 'Jurisdiction',
      render: (row) =>
        regions.find((region) => region.id === row.regionId)?.name ?? row.regionId
    },
    { key: 'appointedBy', header: 'Appointed By' },
    { key: 'appointedAt', header: 'Appointed At' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          tone={
            row.status === 'Active'
              ? 'success'
              : row.status === 'Pending'
                ? 'warning'
                : 'danger'
          }
        >
          {row.status}
        </Badge>
      )
    }
  ];

  return (
    <DomainModulePage
      title='Admin Appointments'
      description='Administrator appointments across the hierarchy. Superiors may only appoint admins at strictly lower levels.'
      actions={<ActionButton label='Appoint administrator' action={appointDemoAdmin} />}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <KPICard
          title='Total Appointments'
          value={String(appointments.length)}
          change='All appointments'
        />
        <KPICard
          title='Active'
          value={String(appointments.filter((item) => item.status === 'Active').length)}
          change='Serving administrators'
        />
        <KPICard
          title='Pending'
          value={String(appointments.filter((item) => item.status === 'Pending').length)}
          change='Awaiting activation'
        />
      </div>

      <DomainEntityList
        title='Appointment Register'
        description='Chain-of-command record of every administrative appointment.'
        searchPlaceholder='Search appointments...'
        columns={columns}
        data={appointments}
        emptyTitle='No appointments'
        emptyDescription='No administrators have been appointed.'
        emptyAction={<Button>Appoint Administrator</Button>}
      />
    </DomainModulePage>
  );
}
