import Link from 'next/link';
import {
  Badge,
  Button,
  Card,
  CardContent,
  DomainModulePage,
  Tabs
} from '@insuros/ui';

const productId = 'motor-comprehensive';

const tabs = [
  { id: 'overview', label: 'Overview', href: `/dashboard/marketplace/${productId}` },
  { id: 'coverages', label: 'Coverages', href: `/dashboard/marketplace/${productId}/coverages` },
  { id: 'pricing', label: 'Pricing Rules', href: `/dashboard/marketplace/${productId}/pricing` },
  { id: 'publishing', label: 'Publishing', href: `/dashboard/marketplace/${productId}/publishing` }
];

export default function MarketplaceProductDetailPage() {
  return (
    <DomainModulePage
      title='Motor Comprehensive'
      description='Product detail, configuration, pricing, coverages, riders, and publishing status.'
      actions={<Button>Edit Product</Button>}
    >
      <div className='mb-6 flex flex-wrap gap-3'>
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className='rounded-md border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50'
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <Tabs items={tabs} activeId='overview'>
        <div className='grid gap-4 lg:grid-cols-3'>
          <Card>
            <CardContent>
              <p className='text-sm text-slate-500'>Status</p>
              <div className='mt-2'>
                <Badge tone='warning'>Draft</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className='text-sm text-slate-500'>Category</p>
              <p className='mt-2 font-medium text-slate-950'>Motor</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className='text-sm text-slate-500'>Carrier</p>
              <p className='mt-2 font-medium text-slate-950'>InsurOS Demo</p>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </DomainModulePage>
  );
}
