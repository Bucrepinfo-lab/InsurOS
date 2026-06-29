import { Badge, Button, Card, CardContent, DomainModulePage } from '@insuros/ui';

const checklist = [
  { label: 'Product information completed', status: 'Complete' },
  { label: 'Coverages configured', status: 'Complete' },
  { label: 'Pricing rules configured', status: 'In Review' },
  { label: 'Eligibility rules configured', status: 'Pending' },
  { label: 'Compliance reviewed', status: 'Pending' }
];

export default function ProductPublishingPage() {
  return (
    <DomainModulePage
      title='Publishing Readiness'
      description='Review product completeness, governance checks, compliance status, and release readiness.'
      actions={<Button>Submit for Approval</Button>}
    >
      <Card>
        <CardContent>
          <div className='grid gap-4'>
            {checklist.map((item) => (
              <div
                key={item.label}
                className='flex items-center justify-between rounded-lg border p-4'
              >
                <div>
                  <p className='font-medium text-slate-950'>{item.label}</p>
                  <p className='mt-1 text-sm text-slate-500'>
                    Required before this product can be published.
                  </p>
                </div>

                <Badge
                  tone={
                    item.status === 'Complete'
                      ? 'success'
                      : item.status === 'In Review'
                        ? 'warning'
                        : 'neutral'
                  }
                >
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DomainModulePage>
  );
}