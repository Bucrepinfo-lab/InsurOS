import { Badge, Card, CardContent, DomainModulePage } from '@insuros/ui';

const events = [
  {
    title: 'Customer profile created',
    description: 'Initial customer record was created in InsurOS.',
    type: 'Customer',
    date: '2026-06-28'
  },
  {
    title: 'Policy issued',
    description: 'Motor Comprehensive policy POL-2026-0001 was issued.',
    type: 'Policy',
    date: '2026-06-28'
  },
  {
    title: 'Payment received',
    description: 'Premium payment PAY-2026-0001 was recorded.',
    type: 'Payment',
    date: '2026-06-28'
  }
];

export default function CustomerTimelinePage() {
  return (
    <DomainModulePage
      title='Customer Timeline'
      description='View customer lifecycle events, notes, policy changes, claims activity, payments, and audit history.'
    >
      <Card>
        <CardContent>
          <div className='grid gap-4'>
            {events.map((event) => (
              <div key={event.title} className='rounded-lg border p-4'>
                <div className='flex items-start justify-between gap-4'>
                  <div>
                    <p className='font-medium text-slate-950'>{event.title}</p>
                    <p className='mt-1 text-sm text-slate-500'>{event.description}</p>
                    <p className='mt-2 text-xs text-slate-400'>{event.date}</p>
                  </div>

                  <Badge tone='neutral'>{event.type}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DomainModulePage>
  );
}