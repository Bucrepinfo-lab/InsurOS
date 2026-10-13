import { Badge, Card, CardContent, DomainModulePage } from '@insuros/ui';

export const metadata = { title: 'Templates' };

const templates = [
  { name: 'Premium receipt (SMS)', channel: 'SMS', status: 'Active' },
  { name: 'Renewal reminder (SMS)', channel: 'SMS', status: 'Active' },
  { name: 'Claim approved (SMS)', channel: 'SMS', status: 'Draft' }
];

export default function TemplatesPage() {
  return (
    <DomainModulePage title='Message templates' description='Reusable, versioned copy for the notifications policyholders receive.'>
      <Card>
        <CardContent>
          <ul className='space-y-2'>
            {templates.map((template) => (
              <li key={template.name} className='flex items-center justify-between border-b border-slate-100 pb-2 text-sm last:border-0'>
                <span className='font-medium text-slate-800'>{template.name}</span>
                <span className='text-slate-500'>{template.channel}</span>
                <Badge tone={template.status === 'Active' ? 'success' : 'warning'}>{template.status}</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </DomainModulePage>
  );
}
