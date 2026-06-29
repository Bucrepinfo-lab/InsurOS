import { Button, Card, CardContent, DomainModulePage, Input } from '@insuros/ui';

export default function NewMarketplaceProductPage() {
  return (
    <DomainModulePage
      title='Create Insurance Product'
      description='Define a new insurance product for catalog, quoting, underwriting, and policy issuance.'
      actions={<Button variant='secondary'>Save Draft</Button>}
    >
      <Card>
        <CardContent>
          <form className='grid gap-5'>
            <div>
              <label className='text-sm font-medium text-slate-700'>Product Name</label>
              <Input className='mt-2' placeholder='Motor Comprehensive' />
            </div>

            <div>
              <label className='text-sm font-medium text-slate-700'>Product Code</label>
              <Input className='mt-2' placeholder='MOTOR-COMP' />
            </div>

            <div>
              <label className='text-sm font-medium text-slate-700'>Category</label>
              <Input className='mt-2' placeholder='Motor' />
            </div>

            <div>
              <label className='text-sm font-medium text-slate-700'>Carrier</label>
              <Input className='mt-2' placeholder='InsurOS Demo' />
            </div>

            <div className='flex justify-end gap-3'>
              <Button variant='secondary'>Cancel</Button>
              <Button>Create Product</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DomainModulePage>
  );
}
