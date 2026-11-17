import {
  Badge,
  DomainEntityList,
  DomainModulePage,
  KPICard,
  MarketingBanner,
  type DataTableColumn
} from '@insuros/ui';
import { ActionButton } from '@/components/ActionButton';
import { createDemoContent } from '@/app/dashboard/actions';
import { MarketingService } from '@insuros/services';

export const metadata = { title: 'CRM content' };

const marketingService = new MarketingService();

export default async function CrmContentPage() {
  const contents = await marketingService.getAllContent();
  const [preview] = await marketingService.getContentFor('All');

  type ContentRow = (typeof contents)[number];

  const columns: DataTableColumn<ContentRow>[] = [
    { key: 'title', header: 'Content' },
    { key: 'headline', header: 'Headline' },
    { key: 'placement', header: 'Placement' },
    { key: 'insuranceLine', header: 'Line' },
    { key: 'audience', header: 'Audience' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          tone={
            row.status === 'Active'
              ? 'success'
              : row.status === 'Draft'
                ? 'warning'
                : 'neutral'
          }
        >
          {row.status}
        </Badge>
      )
    }
  ];

  return (
    <DomainModulePage
      title='Customer messages'
      description='Customer messages kept in one place, by placement, line and audience. Each one states only what your team delivers today.'
      actions={<ActionButton label='Draft content' action={createDemoContent} />}
    >
      {preview ? (
        <MarketingBanner
          headline={preview.headline}
          body={preview.body}
          cta={preview.cta}
          ctaHref={preview.ctaHref}
        />
      ) : null}

      <div className='mb-6 grid gap-4 md:grid-cols-3'>
        <KPICard
          title='Content Pieces'
          value={String(contents.length)}
          change='All placements'
        />
        <KPICard
          title='Active'
          value={String(contents.filter((item) => item.status === 'Active').length)}
          change='Currently displayed'
        />
        <KPICard
          title='Placements Covered'
          value={String(new Set(contents.map((item) => item.placement)).size)}
          change='Marketplace, micro, pricing, claims, global'
        />
      </div>

      <DomainEntityList
        title='Content Registry'
        description='Placement- and line-targeted merits; most specific content wins per surface.'
        searchPlaceholder='Search content...'
        columns={columns}
        data={contents}
        emptyTitle='No content'
        emptyDescription='No marketing content configured.'
      />
    </DomainModulePage>
  );
}
