'use server';

import { revalidatePath } from 'next/cache';
import {
  canSeeCustomer,
  checkClaimForm,
  checkCustomerForm,
  checkPolicyForm,
  formatKes,
  newRecordNumber,
  type OwnedClaim,
  type OwnedCustomer,
  type OwnedPolicy
} from '@insuros/domain';
import { ClaimService, getPersistence } from '@insuros/services';
import { fail, ok, type ActionResult } from '@/lib/action-result';
import { authorizeAction } from '@/lib/auth/session';
import { actorIdFor, reachFor } from '@/lib/record-scope';

/**
 * Data-entry actions for the three core records. Each one is authorised on
 * the server, checks every field again (the browser's checks are a
 * convenience), and stamps the record with the person who captured it. No
 * money moves in any of them.
 */

/** A number not yet used in this collection (six digits from the clock, then the next free one). */
async function freeNumber(
  prefix: 'POL' | 'CLM' | 'CUS',
  taken: (id: string) => Promise<unknown>
): Promise<string> {
  const now = new Date();
  const sequence = now.getTime() % 1_000_000;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = newRecordNumber(prefix, now, sequence + attempt * 7919);
    if (!(await taken(candidate))) return candidate;
  }
  return newRecordNumber(prefix, now, Math.floor(Math.random() * 1_000_000));
}

export async function addCustomer(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const auth = await authorizeAction('Customers', 'Create');
  if (!auth.ok) return auth.result;

  const checked = checkCustomerForm({
    name: formData.get('name'),
    type: formData.get('type'),
    email: formData.get('email')
  });
  if (!checked.ok) return fail('Check the form', checked.error);

  const customers = getPersistence().customers;
  const id = await freeNumber('CUS', (candidate) => customers.findById(candidate));
  const row: OwnedCustomer = {
    id,
    name: checked.value.name,
    type: checked.value.type,
    email: checked.value.email,
    status: 'Pending',
    ownerUserId: actorIdFor(auth.principal)
  };
  await customers.insert(row);
  revalidatePath('/dashboard/customers');
  return ok('Customer added', `${row.name} is on your list as Pending until their details are confirmed.`, { reference: id });
}

export async function recordPolicy(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const auth = await authorizeAction('Policies', 'Create');
  if (!auth.ok) return auth.result;

  const checked = checkPolicyForm({
    customerId: formData.get('customerId'),
    product: formData.get('product'),
    premium: formData.get('premium'),
    status: formData.get('status')
  });
  if (!checked.ok) return fail('Check the form', checked.error);

  // The customer picked on the form is re-checked: it must be one this person may see.
  const db = getPersistence();
  const customer = (await db.customers.findById(checked.value.customerId)) as OwnedCustomer | undefined;
  if (!customer || !canSeeCustomer(reachFor(auth.principal, 'Customers'), customer)) {
    return fail('Policy not recorded', 'That customer is not one of yours.');
  }

  const id = await freeNumber('POL', (candidate) => db.policies.findById(candidate));
  const row: OwnedPolicy = {
    id,
    policyNumber: id,
    customer: customer.name,
    product: checked.value.product,
    premium: formatKes(checked.value.premium),
    status: checked.value.status,
    ownerUserId: actorIdFor(auth.principal)
  };
  await db.policies.insert(row);
  revalidatePath('/dashboard/policies');
  return ok('Policy recorded', `${row.product} for ${row.customer}, ${row.premium}, ${row.status === 'Active' ? 'in force' : 'pending'}.`, {
    reference: id
  });
}

export async function registerClaim(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const auth = await authorizeAction('Claims', 'Create');
  if (!auth.ok) return auth.result;

  const checked = checkClaimForm({ policyId: formData.get('policyId'), amount: formData.get('amount') });
  if (!checked.ok) return fail('Check the form', checked.error);

  // The service re-checks the policy: it must exist, be visible to this person and be in force.
  const number = newRecordNumber('CLM', new Date(), 0).slice(0, -7);
  const template: OwnedClaim = {
    id: number,
    claimNumber: number,
    policyNumber: '',
    customer: '',
    amount: formatKes(checked.value.amount),
    status: 'Open'
  };
  const result = await new ClaimService().registerClaim({
    claimsReach: reachFor(auth.principal, 'Claims'),
    policiesReach: reachFor(auth.principal, 'Policies'),
    registeredByUserId: actorIdFor(auth.principal),
    policyId: checked.value.policyId,
    template
  });
  if (!result.ok) return fail('Claim not registered', result.error);
  revalidatePath('/dashboard/claims');
  return ok(
    'Claim registered',
    `${result.claim.amount} claimed on ${result.claim.policyNumber} for ${result.claim.customer}. It is open and waiting for an owner.`,
    { reference: result.claim.claimNumber }
  );
}
