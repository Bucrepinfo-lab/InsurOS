import Link from 'next/link';
import { Badge, Button, Card, CardContent, DomainModulePage } from '@insuros/ui';
import { ActionButton } from '@/components/ActionButton';
import { queueDemoRequest } from '@/app/dashboard/actions';

export const metadata = { title: 'Assessment' };

const claimId = 'CLM-2026-0001';

const checks = [
  { label: 'Policy in force at incident', pass: true },
  { label: 'Documents complete', pass: true },
  { label: 'Incident within cover window', pass: true },
  { label: 'No duplicate claim on record', pass: true },
  { label: 'Amount within policy limit', pass: false }
];

export default function ClaimAssessmentPage() {
  const fraudScore = 18;
  const passed = checks.filter((check) => check.pass).length;

  return (
    <DomainModulePage
      title={`Assessment · ${claimId}`}
      description='Automated triage of the claim: fraud signals, cover checks, and the recommended decision. A human adjuster owns the final call.'
      actions={
        <ActionButton label='Escalate to adjuster' action={queueDemoRequest.bind(null, 'Escalate assessment')} />
      }
    >
      <div className='mb-6'>
        <Link
          href={`/dashboard/claims/${claimId}`}
          className='rounded-md border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50'
        >
          ← Back to claim
        </Link>
      </div>

      <div className='grid gap-4 lg:grid-cols-3'>
        <Card>
          <CardContent>
            <p className='text-sm text-slate-500'>Fraud score</p>
            <p className='mt-2 text-2xl font-semibold'>{fraudScore}<span className='text-base text-slate-400'>/100</span></p>
            <div className='mt-2'>
              <Badge tone={fraudScore < 40 ? 'success' : fraudScore < 70 ? 'warning' : 'danger'}>
                {fraudScore < 40 ? 'Low risk' : fraudScore < 70 ? 'Review' : 'High risk'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className='text-sm text-slate-500'>Cover checks</p>
            <p className='mt-2 text-2xl font-semibold'>{passed}<span className='text-base text-slate-400'>/{checks.length}</span></p>
            <div className='mt-2'>
              <Badge tone={passed === checks.length ? 'success' : 'warning'}>
                {passed === checks.length ? 'All clear' : 'Needs attention'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <p className='text-sm text-slate-500'>Recommended decision</p>
            <div className='mt-2'>
              <Badge tone='warning'>Manual review</Badge>
            </div>
            <p className='mt-2 text-sm text-slate-500'>Claimed amount exceeds the policy limit — route to an adjuster.</p>
          </CardContent>
        </Card>
      </div>

      <div className='mt-6'>
        <Card>
          <CardContent>
            <p className='text-sm text-slate-500'>Assessment checklist</p>
            <ul className='mt-3 space-y-2'>
              {checks.map((check) => (
                <li key={check.label} className='flex items-center justify-between border-b border-slate-100 pb-2 text-sm last:border-0'>
                  <span className='text-slate-700'>{check.label}</span>
                  <Badge tone={check.pass ? 'success' : 'danger'}>{check.pass ? 'Pass' : 'Fail'}</Badge>
                </li>
              ))}
            </ul>
            <div className='mt-4 flex gap-3'>
              <Button>Approve within limit</Button>
              <Button variant='secondary'>Request more info</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DomainModulePage>
  );
}
