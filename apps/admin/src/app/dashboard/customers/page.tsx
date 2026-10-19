import { Badge, Card, CardContent, DomainModulePage } from '@insuros/ui';

export const metadata = { title: 'Customers' };

const customers = [
  { name: 'Amos Mutua', msisdn: '+254712000001', policies: 2, status: 'Active' },
  { name: 'Beatrice Wanjiku', msisdn: '+254712000002', policies: 1, status: 'Active' },
  { name: 'Collins Odhiambo', msisdn: '+254712000003', policies: 3, status: 'Lapsed' }
];

export default function CustomersPage() {
  return (
    <DomainModulePage title='Customers' description='Everyone covered, keyed by their phone number — the same number they pay premiums from.'>
      <Card>
        <CardContent>
          <ul className='space-y-2'>
            {customers.map((customer) => (
              <li key={customer.msisdn} className='flex items-center justify-between border-b border-slate-100 pb-2 text-sm last:border-0'>
                <span className='font-medium text-slate-800'>{customer.name}</span>
                <span className='text-slate-500'>{customer.msisdn} · {customer.policies} policies</span>
                <Badge tone={customer.status === 'Active' ? 'success' : 'warning'}>{customer.status}</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </DomainModulePage>
  );
}
