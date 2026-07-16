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

type ClaimDocumentRow = {
  name: string;
  type: string;
  status: string;
  uploadedAt: string;
};

const documents: ClaimDocumentRow[] = [
  {
    name: 'Garage Estimate',
    type: 'Assessment',
    status: 'Received',
    uploadedAt: '2026-06-28'
  },
  {
    name: 'Incident Photos',
    type: 'Evidence',
    status: 'Received',
    uploadedAt: '2026-06-28'
  }
];

const columns: DataTableColumn<ClaimDocumentRow>[] = [
  { key: 'name', header: 'Document' },
  { key: 'type', header: 'Type' },
  { key: 'uploadedAt', header: 'Uploaded' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <Badge tone='success'>{row.status}</Badge>
  }
];

export default function ClaimDocumentsPage() {
  return (
    <DomainModulePage
      title='Claim Documents'
      description='Manage evidence, assessments, approvals, receipts, and settlement documents attached to this claim.'
      actions={<ActionButton label='Upload Document' action={queueDemoRequest.bind(null, 'Upload Document')} />}
    >
      <DomainEntityList
        title='Documents'
        description='Documents and evidence associated with this claim.'
        searchPlaceholder='Search claim documents...'
        columns={columns}
        data={documents}
        emptyTitle='No documents'
        emptyDescription='Upload the first document for this claim.'
        emptyAction={<Button>Upload Document</Button>}
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}