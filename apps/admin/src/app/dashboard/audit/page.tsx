import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import { AuditService } from '@insuros/services';

const auditService = new AuditService();

export default async function AuditCenterPage() {
  const records = await auditService.getAuditRecords();

  type AuditRow = (typeof records)[number];

  const columns: DataTableColumn<AuditRow>[] = [
    { key: 'entityReference', header: 'Reference' },
    { key: 'module', header: 'Module' },
    { key: 'action', header: 'Action' },
    { key: 'actor', header: 'Actor' },
    { key: 'timestamp', header: 'Timestamp' },
    { key: 'details', header: 'Details' },
    {
      key: 'action',
      header: 'Event',
      render: (row) => (
        <Badge
          tone={
            row.action === 'Approve'
              ? 'success'
              : row.action === 'Reject' || row.action === 'Delete'
                ? 'danger'
                : 'neutral'
          }
        >
          {row.action}
        </Badge>
      )
    }
  ];

  return (
    <DomainModulePage
      title='Audit Center'
      description='Review immutable audit records for compliance, traceability, and operational governance.'
      actions={<Button>Export Audit Log</Button>}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <KPICard title='Audit Records' value={String(records.length)} change='Tracked events' />
        <KPICard title='Modules' value={String(new Set(records.map((record) => record.module)).size)} change='Reporting actions' />
        <KPICard title='Approvals' value={String(records.filter((record) => record.action === 'Approve').length)} change='Governed decisions' />
      </div>

      <DomainEntityList
        title='Audit Log'
        description='Immutable platform audit records across claims, policies, finance, operations, and identity.'
        searchPlaceholder='Search audit records...'
        columns={columns}
        data={records}
        emptyTitle='No audit records'
        emptyDescription='No audit records have been generated yet.'
        emptyAction={<Button>Export Audit Log</Button>}
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}