import {
  Badge,
  Button,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  type DataTableColumn
} from '@insuros/ui';
import { CommentService } from '@insuros/services';
import { ActionButton } from '@/components/ActionButton';
import { addDemoComment } from '@/app/dashboard/actions';

export const metadata = { title: 'Comments' };

const commentService = new CommentService();

export default async function CommentsPage() {
  const comments = await commentService.getComments();

  type CommentRow = (typeof comments)[number];

  const columns: DataTableColumn<CommentRow>[] = [
    { key: 'entityReference', header: 'Reference' },
    { key: 'module', header: 'Module' },
    { key: 'body', header: 'Comment' },
    { key: 'author', header: 'Author' },
    { key: 'createdAt', header: 'Created At' },
    {
      key: 'module',
      header: 'Area',
      render: (row) => <Badge tone='neutral'>{row.module}</Badge>
    }
  ];

  return (
    <DomainModulePage
      title='Comments'
      description='Review collaboration notes, operational remarks, and cross-module comments.'
      actions={<ActionButton label='Add comment' action={addDemoComment} />}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <KPICard title='Comments' value={String(comments.length)} change='Across modules' />
        <KPICard title='Claims Notes' value={String(comments.filter((item) => item.module === 'Claims').length)} change='Claims activity' />
        <KPICard title='Operations Notes' value={String(comments.filter((item) => item.module === 'Operations').length)} change='Operational follow-up' />
      </div>

      <DomainEntityList
        title='Recent Comments'
        description='Comments created across claims, policies, finance, operations, and platform modules.'
        searchPlaceholder='Search comments...'
        columns={columns}
        data={comments}
        emptyTitle='No comments'
        emptyDescription='No comments have been recorded yet.'
        emptyAction={<Button>Add Comment</Button>}
        actions={<Button variant='secondary'>Export</Button>}
      />
    </DomainModulePage>
  );
}