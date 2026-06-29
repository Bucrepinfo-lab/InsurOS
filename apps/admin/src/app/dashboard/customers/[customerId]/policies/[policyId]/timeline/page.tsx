import { Badge, Card, CardContent, DomainModulePage } from '@insuros/ui';

const events = [
  {
    title: 'Policy issued',
    description: 'Policy POL-2026-0001 was issued from Motor Comprehensive.',
    type: 'Policy',
    date: '2026-06-28'
  },
  {
    title: 'Premium paid',
    description: 'Invoice INV-2026-0001 was paid successfully.',
    type: 'Finance',
    date: '2026-06-28'
  },
  {
    title: 'Documents generated',
    description: 'Policy schedule and certificate were generated.',
    type: 'Documents',
    date: '2026-06-28'
  }
];

export default function PolicyTimelinePage() {
  return (
    <DomainModulePage
      title='Policy Timeline'
      description='Track policy lifecycle events, endorsements, renewals, claims, payments, documents, and audit history.'
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