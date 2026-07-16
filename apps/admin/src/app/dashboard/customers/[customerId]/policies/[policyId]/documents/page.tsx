import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  type DataTableColumn
} from '@insuros/ui';
import { ActionButton } from '@/components/ActionButton';
import { queueDemoRequest } from '@/app/dashboard/actions';

export const metadata = { title: 'Document intelligence' };

type PolicyDocumentRow = {
  name: string;
  type: string;
  status: string;
  uploadedAt: string;
};

const documents: PolicyDocumentRow[] = [
  {
    name: 'Policy Schedule',
    type: 'Schedule',
    status: 'Generated',
    uploadedAt: '2026-06-28'
  }
];

const columns: DataTableColumn<PolicyDocumentRow>[] = [
  { key: 'name', header: 'Document' },
  { key: 'type', header: 'Type' },
  { key: 'uploadedAt', header: 'Date' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <Badge tone='success'>{row.status}</Badge>
  }
];

export default function PolicyDocumentsPage() {
  return (
    <DomainModulePage
      title='Policy Documents'
      description='Manage policy schedules, certificates, endorsements, invoices, receipts, and uploaded attachments.'
      actions={<ActionButton label='Upload Document' action={queueDemoRequest.bind(null, 'Upload Document')} />}
    >
      <DomainEntityList
        title='Documents'
        description='Documents attached to this policy.'
        searchPlaceholder='Search documents...'
        columns={columns}
        data={documents}
        emptyTitle='No documents'
        emptyDescription='Upload or generate the first document for this policy.'
        emptyAction={<Button>Upload Document</Button>}
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}