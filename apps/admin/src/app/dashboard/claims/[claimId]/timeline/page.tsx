import { Badge, Card, CardContent, DomainModulePage } from '@insuros/ui';

export const metadata = { title: 'Timeline' };

const claimId = 'CLM-2026-0001';

const events = [
  { at: 'Day 0 · 14:20', label: 'FNOL submitted (mobile)' },
  { at: 'Day 0 · 14:22', label: 'Scene evidence sealed with GPS + hash' },
  { at: 'Day 0 · 14:25', label: 'Fraud triage complete — low risk' },
  { at: 'Day 1 · 09:10', label: 'Adjuster assigned' }
];

export default function ClaimTimelinePage() {
  return (
    <DomainModulePage title={`Timeline · ${claimId}`} description='An append-only record of every step — tamper-evident from the first second.'>
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
