import Link from 'next/link';
import {
  Badge,
  Button,
  Card,
  CardContent,
  DomainModulePage,
  Tabs
} from '@insuros/ui';

const claimId = 'CLM-2026-0001';

const tabs = [
  { id: 'overview', label: 'Overview', href: `/dashboard/claims/${claimId}` },
  { id: 'fnol', label: 'FNOL', href: `/dashboard/claims/${claimId}/fnol` },
  { id: 'assessment', label: 'Assessment', href: `/dashboard/claims/${claimId}/assessment` },
  { id: 'settlement', label: 'Settlement', href: `/dashboard/claims/${claimId}/settlement` },
  { id: 'documents', label: 'Documents', href: `/dashboard/claims/${claimId}/documents` },
  { id: 'timeline', label: 'Timeline', href: `/dashboard/claims/${claimId}/timeline` }
];

export default function ClaimDetailPage() {
  return (
    <DomainModulePage
      title='Claim CLM-2026-0001'
      description='Complete claim workspace for FNOL, assessment, reserves, settlement, documents, and audit history.'
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
      </Tabs>
    </DomainModulePage>
  );
}