import { DomainModulePage } from '@insuros/ui';
import { CreateGate } from '@/components/create-gate';
import { CustomerForm } from '@/components/record-forms';
import { requirePageAccess } from "@/lib/auth/page-access";

export const metadata = { title: 'Add customer' };

export default async function NewCustomerPage() {
  await requirePageAccess("/dashboard/customers/new");
  return (
    <DomainModulePage title='Add customer' description='The record belongs to your organisation, and you are noted as the person who captured it.'>
      <CreateGate scope='Customers'>
        <CustomerForm />
      </CreateGate>
    </DomainModulePage>
  );
}
