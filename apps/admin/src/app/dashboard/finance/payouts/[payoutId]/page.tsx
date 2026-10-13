import { Badge, Card, CardContent, DomainModulePage } from '@insuros/ui';

export const metadata = { title: 'Payout' };

const payoutId = 'PO-2026-0001';

export default function PayoutDetailPage() {
  return (
    <DomainModulePage title={`Payout ${payoutId}`} description='Claim disbursement paid out to the beneficiary’s M-Pesa number.'>
      <div className='grid gap-4 lg:grid-cols-3'>
        <Card><CardContent><p className='text-sm text-slate-500'>Amount</p><p className='mt-2 font-medium'>KES 95,000</p></CardContent></Card>
        <Card><CardContent><p className='text-sm text-slate-500'>Beneficiary</p><p className='mt-2 font-medium'>+254 712 000 001</p></CardContent></Card>
        <Card><CardContent><p className='text-sm text-slate-500'>Status</p><div className='mt-2'><Badge tone='success'>Settled</Badge></div></CardContent></Card>
      </div>
    </DomainModulePage>
  );
}
