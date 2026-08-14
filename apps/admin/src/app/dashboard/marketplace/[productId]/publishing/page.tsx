import { Badge, Card, CardContent, DomainModulePage } from '@insuros/ui';

export const metadata = { title: 'Publishing' };

const productId = 'PROD-MOTOR-001';

export default function ProductPublishingPage() {
  return (
    <DomainModulePage title={`Publishing · ${productId}`} description='Where this product is live, its pricing state, and approval status before it reaches policyholders.'>
      <div className='grid gap-4 lg:grid-cols-3'>
        <Card><CardContent><p className='text-sm text-slate-500'>Visibility</p><div className='mt-2'><Badge tone='success'>Live · Kenya</Badge></div></CardContent></Card>
        <Card><CardContent><p className='text-sm text-slate-500'>Pricing</p><p className='mt-2 font-medium'>Engineered · reviewed daily</p></CardContent></Card>
        <Card><CardContent><p className='text-sm text-slate-500'>Approval</p><div className='mt-2'><Badge tone='success'>Approved</Badge></div></CardContent></Card>
      </div>
    </DomainModulePage>
  );
}
