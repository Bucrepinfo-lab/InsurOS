import { DomainModulePage } from '@insuros/ui';
import { expiryStatus, policiesOfCustomer } from '@insuros/domain';
import { CustomerService, PolicyService } from '@insuros/services';
import { HomeLinkButton } from '@/components/home-link-button';
import { currentReach } from '@/lib/record-scope';

export const metadata = { title: 'Customer home links' };
export const dynamic = 'force-dynamic';

/** Give each customer a private page with everything they hold: policies, items, values, expiry dates. */
export default async function HomeLinksPage() {
  const [customers, policies] = await Promise.all([
    new CustomerService().getCustomersFor(await currentReach('Customers')),
    new PolicyService().getPoliciesFor(await currentReach('Policies'))
  ]);
  const now = new Date();
  const rows = customers
    .map((customer) => {
      const own = policiesOfCustomer(policies, customer);
      const dueSoon = own.filter((policy) => expiryStatus(policy.expiryDate, now).level === 'due-soon').length;
      return { customer, count: own.length, dueSoon };
    })
    .sort((a, b) => b.dueSoon - a.dueSoon || a.customer.name.localeCompare(b.customer.name));

  return (
    <DomainModulePage
      title='Customer home links'
      description='Each customer can have a private page, with no account or password: their policies, what is insured, the value, when cover ends, and their claims. Send it by WhatsApp or SMS; they can add it to their home screen.'
    >
      {rows.length === 0 ? (
        <p className='rounded-2xl border border-line bg-sheet p-5 text-sm text-ink'>You have no customers yet.</p>
      ) : (
        <ul className='grid gap-3 sm:grid-cols-2'>
          {rows.map(({ customer, count, dueSoon }) => (
            <li key={customer.id} className='grid gap-2 rounded-2xl border border-line bg-sheet p-4 text-sm'>
              <p className='font-medium text-ink'>{customer.name}</p>
              <p className='text-dim'>
                {count} {count === 1 ? 'policy' : 'policies'}
                {dueSoon > 0 ? <span className='font-semibold text-warnink'>, {dueSoon} ending within 30 days</span> : null}
                {customer.homeAccessHash ? '. Has a home link.' : '.'}
              </p>
              <HomeLinkButton customerId={customer.id} name={customer.name} />
            </li>
          ))}
        </ul>
      )}
    </DomainModulePage>
  );
}
