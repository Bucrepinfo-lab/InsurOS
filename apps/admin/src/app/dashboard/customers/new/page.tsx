import { DomainModulePage } from '@insuros/ui';
import { CreateGate } from '@/components/create-gate';
import { CustomerForm } from '@/components/record-forms';

export const metadata = { title: 'Add customer' };

export default function NewCustomerPage() {
  return (
    <DomainModulePage title='Add customer' description='The record belongs to your organisation, and you are noted as the person who captured it.'>
      <CreateGate scope='Customers'>
        <CustomerForm />
      </CreateGate>
    </DomainModulePage>
  );
}
