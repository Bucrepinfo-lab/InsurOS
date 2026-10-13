import { Badge, Card, CardContent, DomainModulePage } from '@insuros/ui';

export const metadata = { title: 'FNOL' };

const claimId = 'CLM-2026-0001';

export default function ClaimFnolPage() {
  return (
    <DomainModulePage
      title={`First notice of loss · ${claimId}`}
      description='The moment the claim was reported, captured with channel, time, and initial description.'
    >
      <div className='grid gap-4 lg:grid-cols-3'>
        <Card><CardContent><p className='text-sm text-slate-500'>Channel</p><p className='mt-2 font-medium'>Mobile app</p></CardContent></Card>
        <Card><CardContent><p className='text-sm text-slate-500'>Reported</p><p className='mt-2 font-medium'>4 hours after incident</p></CardContent></Card>
        <Card><CardContent><p className='text-sm text-slate-500'>Status</p><div className='mt-2'><Badge tone='warning'>Under review</Badge></div></CardContent></Card>
      </div>
      <div className='mt-6'>
        <Card><CardContent><p className='text-sm text-slate-500'>Description</p><p className='mt-2 text-sm text-slate-700'>Rear-end collision on Waiyaki Way; no injuries reported. Photos captured live at the scene with a GPS fix.</p></CardContent></Card>
      </div>
    </DomainModulePage>
  );
}
