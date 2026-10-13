import { Badge, Card, CardContent, DomainModulePage } from '@insuros/ui';

export const metadata = { title: 'Policy holder' };

const policyId = 'POL-2026-0001';

export default function PolicyHolderPage() {
  return (
    <DomainModulePage title={`Policy holder · ${policyId}`} description='Who this policy covers, keyed by the phone number they sign in and pay with.'>
      <div className='grid gap-4 lg:grid-cols-3'>
        <Card><CardContent><p className='text-sm text-slate-500'>Name</p><p className='mt-2 font-medium'>Amos Mutua</p></CardContent></Card>
        <Card><CardContent><p className='text-sm text-slate-500'>Phone / M-Pesa</p><p className='mt-2 font-medium'>+254 712 000 001</p></CardContent></Card>
        <Card><CardContent><p className='text-sm text-slate-500'>KYC</p><div className='mt-2'><Badge tone='success'>Verified</Badge></div></CardContent></Card>
      </div>
    </DomainModulePage>
  );
}
