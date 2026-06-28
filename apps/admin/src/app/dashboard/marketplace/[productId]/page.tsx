import { Badge, Button, Card, CardContent, DomainModulePage } from '@insuros/ui';

export default function MarketplaceProductDetailPage() {
  return (
    <DomainModulePage
      title='Motor Comprehensive'
      description='Product detail, configuration, pricing, coverages, riders, and publishing status.'
      actions={<Button>Edit Product</Button>}
    >
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

      <div className='mt-6 grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardContent>
            <h2 className='text-lg font-semibold text-slate-950'>Coverages</h2>
            <p className='mt-2 text-sm text-slate-500'>
              Configure mandatory and optional product coverages.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className='text-lg font-semibold text-slate-950'>Pricing Rules</h2>
            <p className='mt-2 text-sm text-slate-500'>
              Define premiums, loadings, discounts, taxes, and rating logic.
            </p>
          </CardContent>
        </Card>
      </div>
    </DomainModulePage>
  );
}
