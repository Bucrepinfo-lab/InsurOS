import Link from 'next/link';
import {
  Badge,
  Button,
  Card,
  CardContent,
  DomainModulePage,
  Tabs
} from '@insuros/ui';
import { ClaimService } from '@insuros/services';

const claimId = 'CLM-2026-0001';
const claimService = new ClaimService();

const tabs = [
  { id: 'overview', label: 'Overview', href: `/dashboard/claims/${claimId}` },
  { id: 'fnol', label: 'FNOL', href: `/dashboard/claims/${claimId}/fnol` },
  { id: 'assessment', label: 'Assessment', href: `/dashboard/claims/${claimId}/assessment` },
  { id: 'settlement', label: 'Settlement', href: `/dashboard/claims/${claimId}/settlement` },
  { id: 'documents', label: 'Documents', href: `/dashboard/claims/${claimId}/documents` },
  { id: 'timeline', label: 'Timeline', href: `/dashboard/claims/${claimId}/timeline` }
];

export default async function ClaimDetailPage() {
  const workflow = await claimService.getClaimWorkflow(claimId);

  return (
    <DomainModulePage
      title='Claim CLM-2026-0001'
      description='Complete claim workspace for FNOL, assessment, reserves, settlement, documents, workflow, and audit history.'
      actions={<Button>Assign Adjuster</Button>}
    >
      <div className='mb-6 flex flex-wrap gap-3'>
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className='rounded-md border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50'
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <Tabs items={tabs} activeId='overview'>
        <div className='grid gap-4 lg:grid-cols-4'>
          <Card>
            <CardContent>
              <p className='text-sm text-slate-500'>Status</p>
              <div className='mt-2'>
                <Badge tone='warning'>Open</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className='text-sm text-slate-500'>Policy</p>
              <p className='mt-2 font-medium'>POL-2026-0001</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className='text-sm text-slate-500'>Claimed Amount</p>
              <p className='mt-2 font-medium'>KES 120,000</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className='text-sm text-slate-500'>Assigned To</p>
              <p className='mt-2 font-medium'>Unassigned</p>
            </CardContent>
          </Card>
        </div>

        <div className='mt-6 grid gap-4 lg:grid-cols-3'>
          <Card>
            <CardContent>
              <p className='text-sm text-slate-500'>Workflow Stage</p>
              <p className='mt-2 font-medium'>{workflow?.stage ?? 'Not started'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className='text-sm text-slate-500'>Workflow Status</p>
              <div className='mt-2'>
                <Badge tone={workflow?.workflowStatus === 'Approved' ? 'success' : 'warning'}>
                  {workflow?.workflowStatus ?? 'Unavailable'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className='text-sm text-slate-500'>Workflow Claim</p>
              <p className='mt-2 font-medium'>{workflow?.claimId ?? claimId}</p>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </DomainModulePage>
  );
}
