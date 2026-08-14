import { Badge, Card, CardContent, DomainModulePage } from '@insuros/ui';

export const metadata = { title: 'Settlement' };

const claimId = 'CLM-2026-0001';

export default function ClaimSettlementPage() {
  return (
    <DomainModulePage
      title={`Settlement · ${claimId}`}
      description='Reserve, approved amount, and payout status — paid to the claimant’s M-Pesa number once approved.'
    >
      <div className='grid gap-4 lg:grid-cols-3'>
        <Card><CardContent><p className='text-sm text-slate-500'>Reserve</p><p className='mt-2 font-medium'>KES 120,000</p></CardContent></Card>
        <Card><CardContent><p className='text-sm text-slate-500'>Approved</p><p className='mt-2 font-medium'>KES 95,000</p></CardContent></Card>
        <Card><CardContent><p className='text-sm text-slate-500'>Payout</p><div className='mt-2'><Badge tone='warning'>Pending approval</Badge></div></CardContent></Card>
      </div>
    </DomainModulePage>
  );
}
