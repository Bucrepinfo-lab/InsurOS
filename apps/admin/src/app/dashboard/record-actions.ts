'use server';

import { revalidatePath } from 'next/cache';
import {
  DOCUMENT_TYPE_LABELS,
  canSeeCustomer,
  checkClaimForm,
  checkCustomerForm,
  checkDocumentForm,
  checkPolicyForm,
  formatKes,
  newRecordNumber,
  type FlowArea,
  type OwnedClaim,
  type OwnedCustomer,
  type OwnedPolicy,
  type SessionPrincipal
} from '@insuros/domain';
import { ClaimService, DocumentIntelligenceService, FollowUpService, getPersistence } from '@insuros/services';
import { fail, ok, type ActionResult } from '@/lib/action-result';
import { authorizeAction } from '@/lib/auth/session';
import { customerHomeUrl, newCustomerLink } from '@/lib/customer-link';
import { followUpViewerFor } from '@/lib/follow-up-viewer';
import { actorIdFor, reachFor } from '@/lib/record-scope';

/**
 * Data-entry actions for the three core records. Each one is authorised on
 * the server, checks every field again (the browser's checks are a
 * convenience), and stamps the record with the person who captured it. No
 * money moves in any of them.
 */

/**
 * Open the first step of the area's flow for a new record, owned by the person
 * who captured it. Best effort: a record is never lost because its follow-up
 * could not be opened.
 */
async function openFollowUp(area: FlowArea, reference: string, subject: string, principal: SessionPrincipal): Promise<void> {
  try {
    await new FollowUpService().open({
      area,
      reference,
      subject,
      ownerUserId: actorIdFor(principal),
      ownerName: principal.name || 'Staff member'
    });
  } catch {
    // The record stands; the follow-up can be opened by hand later.
  }
}

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
    email: formData.get('email'),
    referredBy: formData.get('referredBy')
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
    ownerUserId: actorIdFor(auth.principal),
    ...(checked.value.referredBy ? { referredBy: checked.value.referredBy } : {})
  };
  await customers.insert(row);
  await openFollowUp('customers', id, row.name, auth.principal);
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
    status: formData.get('status'),
    insuredItem: formData.get('insuredItem'),
    sumInsured: formData.get('sumInsured'),
    registration: formData.get('registration'),
    yearOfManufacture: formData.get('yearOfManufacture'),
    startDate: formData.get('startDate'),
    expiryDate: formData.get('expiryDate'),
    today: new Date(Date.now() + 3 * 3_600_000).toISOString().slice(0, 10)
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
    ownerUserId: actorIdFor(auth.principal),
    customerId: customer.id,
    ...(checked.value.insuredItem ? { insuredItem: checked.value.insuredItem } : {}),
    ...(checked.value.sumInsured !== undefined ? { sumInsured: checked.value.sumInsured } : {}),
    ...(checked.value.registration ? { registration: checked.value.registration } : {}),
    ...(checked.value.yearOfManufacture !== undefined ? { yearOfManufacture: checked.value.yearOfManufacture } : {}),
    startDate: checked.value.startDate,
    expiryDate: checked.value.expiryDate
  };
  await db.policies.insert(row);
  if (row.status === 'Pending') await openFollowUp('policies', id, `${row.customer}, ${row.product}`, auth.principal);
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
  await openFollowUp('claims', result.claim.claimNumber, result.claim.customer, auth.principal);
  revalidatePath('/dashboard/claims');
  return ok(
    'Claim registered',
    `${result.claim.amount} claimed on ${result.claim.policyNumber} for ${result.claim.customer}. It is open, and acknowledging it to the customer is now on your follow-ups.`,
    { reference: result.claim.claimNumber }
  );
}

/**
 * Record a claim document's details. The photo, if one was used, was read on
 * the person's own device and is not sent here: only the details they typed
 * or confirmed arrive. A missing required detail sends the record to review.
 */
export async function recordDocument(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const auth = await authorizeAction('Operations', 'Create');
  if (!auth.ok) return auth.result;

  const values: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('field.')) values[key.slice('field.'.length)] = value;
  }
  const checked = checkDocumentForm({
    documentType: formData.get('documentType'),
    claimReference: formData.get('claimReference'),
    values
  });
  if (!checked.ok) return fail('Check the form', checked.error);

  // A claim number, when given, must be a claim this person may see.
  if (checked.claimReference) {
    const claims = await new ClaimService().getClaimsFor(reachFor(auth.principal, 'Claims'));
    if (!claims.some((claim) => claim.claimNumber === checked.claimReference)) {
      return fail('Document not recorded', 'That claim is not one of yours.');
    }
  }

  const reference = newRecordNumber('DOC', new Date(), Date.now());
  const extraction = await new DocumentIntelligenceService().ingest({
    attachmentReference: reference,
    claimReference: checked.claimReference,
    documentType: checked.documentType,
    fields: checked.fields,
    engine: formData.get('readOnDevice') === 'yes' ? 'read on device, confirmed by a person' : 'typed by a person',
    enteredBy: actorIdFor(auth.principal)
  });
  if (extraction.status !== 'Verified') {
    await openFollowUp('documents', reference, DOCUMENT_TYPE_LABELS[checked.documentType], auth.principal);
  }
  revalidatePath('/dashboard/operations/documents');
  return extraction.status === 'Verified'
    ? ok('Document recorded', `${DOCUMENT_TYPE_LABELS[checked.documentType]}: every required detail is on record.`, { reference })
    : ok('Document recorded, needs review', `${DOCUMENT_TYPE_LABELS[checked.documentType]}: a required detail is missing, so it is marked for review.`, { reference });
}

/**
 * Confirm a step on a follow-up. The service checks, on the stored record,
 * that this person owns it or supervises its area.
 */
export async function confirmFollowUp(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const auth = await authorizeAction(null);
  if (!auth.ok) return auth.result;
  const id = formData.get('id');
  if (typeof id !== 'string' || id.length === 0 || id.length > 300) return fail('Not confirmed', 'That follow-up could not be found.');

  const result = await new FollowUpService().respond(id, followUpViewerFor(auth.principal), {
    userId: actorIdFor(auth.principal),
    name: auth.principal.name || 'Staff member'
  });
  if (!result.ok) return fail('Not confirmed', result.error);
  // Confirming a new customer's details makes them Active: the moment a referral counts.
  if (result.done.area === 'customers') {
    const customers = getPersistence().customers;
    const customer = await customers.findById(result.done.reference);
    if (customer && customer.status === 'Pending') {
      await customers.update(customer.id, { status: 'Active', verifiedAt: result.done.respondedAt ?? new Date().toISOString() });
      revalidatePath('/dashboard/customers');
      revalidatePath('/dashboard/sales/referrals');
    }
  }
  revalidatePath('/dashboard/follow-ups');
  revalidatePath('/dashboard/operations/escalations');
  revalidatePath('/dashboard');
  return ok('Step confirmed', result.next ? 'The next step is now on the list.' : 'That was the last step. Nothing more is owed on this record.', {
    reference: result.done.reference
  });
}

/**
 * Make a customer's private home link: their policies, what is insured,
 * values, expiry dates and claims. Shown once; making a new one stops the old.
 */
export async function makeCustomerHomeLink(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const auth = await authorizeAction('Customers', 'View');
  if (!auth.ok) return auth.result;
  const customers = getPersistence().customers;
  const customer = (await customers.findById(String(formData.get('customerId') ?? ''))) as OwnedCustomer | undefined;
  if (!customer || !canSeeCustomer(reachFor(auth.principal, 'Customers'), customer)) {
    return fail('No link made', 'That customer is not one of yours.');
  }
  const link = newCustomerLink();
  await customers.update(customer.id, { homeAccessHash: link.hash });
  const url = customerHomeUrl(link.token);
  return ok('Home link made', `Send this to ${customer.name}. It shows their policies, what is insured, values and expiry dates. Any older link stops working.`, {
    reference: customer.id,
    link: url
  });
}
