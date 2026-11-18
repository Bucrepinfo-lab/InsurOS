'use client';

import Link from 'next/link';
import { useActionState, type ReactNode } from 'react';
import type { ActionResult } from '@/lib/action-result';
import { addCustomer, recordPolicy, registerClaim } from '@/app/dashboard/record-actions';

const field =
  'mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-[15px] text-ink outline-none transition focus:border-seal focus:ring-2 focus:ring-seal/20';
const label = 'block text-sm font-medium text-ink';
const hint = 'mt-1 block text-xs font-normal text-dim';

function Receipt({ result, backHref, backLabel }: { result: ActionResult | null; backHref: string; backLabel: string }) {
  if (!result) return null;
  return (
    <div
      role='status'
      className={`rounded-xl border px-4 py-3 text-sm ${
        result.ok ? 'border-seal/30 bg-sealsoft text-ink' : 'border-red-300 bg-red-50 text-red-900'
      }`}
    >
      <p>
        <strong>{result.title}.</strong> {result.message}
        {result.reference ? <span className='ml-2 font-mono text-[12.5px] text-dim'>{result.reference}</span> : null}
      </p>
      {result.ok ? (
        <p className='mt-1.5'>
          <Link href={backHref} className='font-medium text-seal underline underline-offset-2'>
            {backLabel}
          </Link>{' '}
          or add another below.
        </p>
      ) : null}
    </div>
  );
}

function FormShell({
  action,
  pending,
  submit,
  working,
  cancelHref,
  children
}: {
  action: (formData: FormData) => void;
  pending: boolean;
  submit: string;
  working: string;
  cancelHref: string;
  children: ReactNode;
}) {
  return (
    <form action={action} className='grid max-w-2xl gap-5 rounded-2xl border border-line bg-sheet p-5 sm:p-7'>
      {children}
      <div className='flex flex-wrap items-center gap-3'>
        <button
          type='submit'
          disabled={pending}
          className='rounded-lg bg-seal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sealdark disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal'
        >
          {pending ? working : submit}
        </button>
        <Link href={cancelHref} className='rounded-lg px-3 py-2 text-sm font-medium text-dim hover:text-ink'>
          Cancel
        </Link>
      </div>
    </form>
  );
}

export function CustomerForm() {
  const [result, action, pending] = useActionState(addCustomer, null);
  return (
    <div className='grid gap-4'>
      <Receipt result={result} backHref='/dashboard/customers' backLabel='See your customers' />
      <FormShell action={action} pending={pending} submit='Add customer' working='Adding…' cancelHref='/dashboard/customers'>
        <label className={label}>
          Full name or business name
          <input name='name' required minLength={2} maxLength={120} autoComplete='off' className={field} />
        </label>
        <fieldset>
          <legend className={label}>Customer type</legend>
          <div className='mt-2 flex flex-wrap gap-4 text-[15px] text-ink'>
            <label className='inline-flex items-center gap-2'>
              <input type='radio' name='type' value='Individual' defaultChecked className='accent-[#0f6e56]' /> Individual
            </label>
            <label className='inline-flex items-center gap-2'>
              <input type='radio' name='type' value='Business' className='accent-[#0f6e56]' /> Business
            </label>
          </div>
        </fieldset>
        <label className={label}>
          Email
          <span className={hint}>Leave empty if the customer has none.</span>
          <input name='email' type='email' maxLength={160} autoComplete='off' inputMode='email' className={field} />
        </label>
        <label className={label}>
          Referral code
          <span className={hint}>Who referred them, if anyone: the code they were given, for example KE-CFT5SD. It cannot be changed later.</span>
          <input name='referredBy' maxLength={12} autoComplete='off' autoCapitalize='characters' className={field} />
        </label>
      </FormShell>
    </div>
  );
}

export function PolicyForm({
  customers,
  products
}: {
  customers: { id: string; name: string }[];
  products: string[];
}) {
  const [result, action, pending] = useActionState(recordPolicy, null);
  if (customers.length === 0) {
    return (
      <p className='max-w-2xl rounded-2xl border border-line bg-sheet p-5 text-sm text-ink'>
        A policy belongs to a customer, and you have none yet.{' '}
        <Link href='/dashboard/customers/new' className='font-medium text-seal underline underline-offset-2'>
          Add a customer first
        </Link>
      </p>
    );
  }
  return (
    <div className='grid gap-4'>
      <Receipt result={result} backHref='/dashboard/policies' backLabel='See your policies' />
      <FormShell action={action} pending={pending} submit='Record policy' working='Recording…' cancelHref='/dashboard/policies'>
        <label className={label}>
          Customer
          <select name='customerId' required defaultValue='' className={field}>
            <option value='' disabled>
              Choose a customer
            </option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </label>
        <label className={label}>
          Product
          <span className={hint}>Pick from the catalogue or type the name on the policy document.</span>
          <input name='product' required minLength={2} maxLength={80} list='product-names' autoComplete='off' className={field} />
          <datalist id='product-names'>
            {products.map((product) => (
              <option key={product} value={product} />
            ))}
          </datalist>
        </label>
        <label className={label}>
          Premium, in shillings
          <span className={hint}>The figure on the policy document. This is a record only: no payment is taken here.</span>
          <input name='premium' required inputMode='decimal' placeholder='42,000' autoComplete='off' className={field} />
        </label>
        <label className={label}>
          Status
          <select name='status' required defaultValue='Active' className={field}>
            <option value='Active'>In force</option>
            <option value='Pending'>Pending</option>
          </select>
        </label>
      </FormShell>
    </div>
  );
}

export function ClaimForm({ policies }: { policies: { id: string; label: string }[] }) {
  const [result, action, pending] = useActionState(registerClaim, null);
  if (policies.length === 0) {
    return (
      <p className='max-w-2xl rounded-2xl border border-line bg-sheet p-5 text-sm text-ink'>
        A claim needs a policy in force, and none of yours is.{' '}
        <Link href='/dashboard/policies' className='font-medium text-seal underline underline-offset-2'>
          Check your policies
        </Link>
      </p>
    );
  }
  return (
    <div className='grid gap-4'>
      <Receipt result={result} backHref='/dashboard/claims' backLabel='See your claims' />
      <FormShell action={action} pending={pending} submit='Register claim' working='Registering…' cancelHref='/dashboard/claims'>
        <label className={label}>
          Policy
          <span className={hint}>Only policies in force are listed.</span>
          <select name='policyId' required defaultValue='' className={field}>
            <option value='' disabled>
              Choose a policy
            </option>
            {policies.map((policy) => (
              <option key={policy.id} value={policy.id}>
                {policy.label}
              </option>
            ))}
          </select>
        </label>
        <label className={label}>
          Amount claimed, in shillings
          <span className={hint}>What the customer is asking for. A person decides the claim; nothing is paid from here.</span>
          <input name='amount' required inputMode='decimal' placeholder='120,000' autoComplete='off' className={field} />
        </label>
      </FormShell>
    </div>
  );
}
