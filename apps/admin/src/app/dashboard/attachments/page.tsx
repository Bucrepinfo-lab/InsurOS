import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import { AttachmentService } from '@insuros/services';
import { ActionButton } from '@/components/ActionButton';
import { uploadDemoAttachment } from '@/app/dashboard/actions';

export const metadata = { title: 'Attachments' };

const attachmentService = new AttachmentService();

export default async function AttachmentsPage() {
  const attachments = await attachmentService.getAttachments();

  type AttachmentRow = (typeof attachments)[number];

  const columns: DataTableColumn<AttachmentRow>[] = [
    { key: 'entityReference', header: 'Reference' },
    { key: 'module', header: 'Module' },
    { key: 'fileName', header: 'File' },
    { key: 'fileType', header: 'Type' },
    { key: 'uploadedBy', header: 'Uploaded By' },
    { key: 'uploadedAt', header: 'Uploaded At' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          tone={
            row.status === 'Verified'
              ? 'success'
              : row.status === 'Rejected'
                ? 'danger'
                : 'warning'
          }
        >
          {row.status}
        </Badge>
      )
    }
  ];

  return (
    <DomainModulePage
      title='Attachments'
      description='Review uploaded documents, files, evidence, policy schedules, and operational attachments.'
      actions={<ActionButton label='Register attachment' action={uploadDemoAttachment} />}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <KPICard title='Attachments' value={String(attachments.length)} change='Across modules' />
        <KPICard title='Verified' value={String(attachments.filter((item) => item.status === 'Verified').length)} change='Approved files' />
        <KPICard title='Rejected' value={String(attachments.filter((item) => item.status === 'Rejected').length)} change='Needs review' />
      </div>

      <DomainEntityList
        title='Uploaded Attachments'
        description='Documents and files uploaded across claims, policies, finance, operations, and platform modules.'
        searchPlaceholder='Search attachments...'
        columns={columns}
        data={attachments}
        emptyTitle='No attachments'
        emptyDescription='No attachments have been uploaded yet.'
        emptyAction={<Button>Upload Attachment</Button>}
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}