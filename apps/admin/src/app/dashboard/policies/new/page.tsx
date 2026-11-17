import { DomainModulePage } from '@insuros/ui';
import { CustomerService, MarketplaceService } from '@insuros/services';
import { CreateGate } from '@/components/create-gate';
import { PolicyForm } from '@/components/record-forms';
import { currentReach } from '@/lib/record-scope';

export const metadata = { title: 'Record policy' };
export const dynamic = 'force-dynamic';

export default async function NewPolicyPage() {
  // Only customers this person may see can be picked; the action checks the pick again.
  const customers = await new CustomerService().getCustomersFor(await currentReach('Customers'));
  const products = (await new MarketplaceService().getProducts()).map((product) => product.name);
  const options = customers
    .map((customer) => ({ id: customer.id, name: customer.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <DomainModulePage title='Record policy' description='Put a policy on a customer’s record so that claims can be registered against it.'>
      <CreateGate scope='Policies'>
        <PolicyForm customers={options} products={[...new Set(products)]} />
      </CreateGate>
    </DomainModulePage>
  );
}
