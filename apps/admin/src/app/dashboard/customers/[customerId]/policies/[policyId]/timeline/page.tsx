import { Badge, Card, CardContent, DomainModulePage } from '@insuros/ui';

export const metadata = { title: 'Timeline' };

const policyId = 'POL-2026-0001';

const events = [
  { at: 'Day 0', label: 'Policy issued' },
  { at: 'Day 1', label: 'First premium paid via M-Pesa — cover activated' },
  { at: 'Day 30', label: 'Renewal reminder sent' }
];

export default function PolicyTimelinePage() {
  return (
    <DomainModulePage title={`Policy timeline · ${policyId}`} description='The full lifecycle of this policy, from issue to renewal.'>
      <Card>
        <CardContent>
          <ul className='space-y-3'>
            {events.map((event) => (
              <li key={event.at} className='flex items-center justify-between border-b border-slate-100 pb-2 text-sm last:border-0'>
                <span className='text-slate-700'>{event.label}</span>
                <Badge tone='neutral'>{event.at}</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </DomainModulePage>
  );
}
