import { Badge, Card, CardContent, DomainModulePage } from '@insuros/ui';

export const metadata = { title: 'Invoice' };

const invoiceId = 'INV-2026-0001';

export default function InvoiceDetailPage() {
  return (
    <DomainModulePage title={`Invoice ${invoiceId}`} description='Premium invoice with amount due, due date, and payment status.'>
      <div className='grid gap-4 lg:grid-cols-3'>
        <Card><CardContent><p className='text-sm text-slate-500'>Amount due</p><p className='mt-2 font-medium'>KES 3,500</p></CardContent></Card>
        <Card><CardContent><p className='text-sm text-slate-500'>Due date</p><p className='mt-2 font-medium'>In 14 days</p></CardContent></Card>
        <Card><CardContent><p className='text-sm text-slate-500'>Status</p><div className='mt-2'><Badge tone='warning'>Unpaid</Badge></div></CardContent></Card>
      </div>
    </DomainModulePage>
  );
}
