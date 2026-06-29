import { Badge, Card, CardContent, DomainModulePage } from '@insuros/ui';

const events = [
  {
    title: 'FNOL captured',
    description: 'First notice of loss was captured through the Admin Portal.',
    type: 'FNOL',
    date: '2026-06-28'
  },
  {
    title: 'Documents uploaded',
    description: 'Garage estimate and incident photos were attached to the claim.',
    type: 'Documents',
    date: '2026-06-28'
  },
  {
    title: 'Assessment started',
    description: 'Claim assessment is currently in review.',
    type: 'Assessment',
    date: '2026-06-28'
  }
];

export default function ClaimTimelinePage() {
  return (
    <DomainModulePage
      title='Claim Timeline'
      description='Track claim lifecycle events, decisions, documents, assessments, settlement activity, and audit history.'
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