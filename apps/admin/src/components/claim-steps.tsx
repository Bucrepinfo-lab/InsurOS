'use client';

import { useActionState, useState, type ReactNode } from 'react';
import type { ActionResult } from '@/lib/action-result';
import {
  approveClaimAmount,
  approveSettlementCertificate,
  declineClaimWithReason,
  recordClaimPayment,
  startClaimReview
} from '@/app/dashboard/claims/[claimId]/actions';

/*
  The one next step on a claim, as a form a person fills in and confirms.
  The server checks the role, the order of steps and four eyes on the money;
  these forms only collect what the step needs. Nothing here moves money.
*/

export type ClaimNextStep = 'start-review' | 'decide' | 'record-payment' | 'approve-certificate' | 'none';

export interface ClaimStepsProps {
  claimId: string;
  next: ClaimNextStep;
  claimedLabel: string;
  approvedLabel?: string;
  can: { update: boolean; approve: boolean; reject: boolean };
  /** yyyy-mm-dd, server clock. */
  today: string;
}

const field =
  'mt-1 w-full rounded-lg border border-ink/15 bg-sheet px-3 py-2.5 text-[15px] text-ink outline-none transition focus:border-seal focus:ring-2 focus:ring-seal/20';
const label = 'block text-sm font-medium text-ink';
const hint = 'mt-1 block text-xs font-normal text-dim';
const primary =
  'rounded-lg bg-seal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sealdark disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal';
const secondary =
  'rounded-lg border border-dangerink/40 px-4 py-2.5 text-sm font-semibold text-dangerink transition hover:bg-dangersoft disabled:opacity-60';

function Result({ result }: { result: ActionResult | null }) {
  if (!result) return null;
  return (
    <p
      role='status'
      className={`rounded-xl border px-4 py-3 text-sm ${result.ok ? 'border-seal/30 bg-sealsoft text-ink' : 'border-dangerink/30 bg-dangersoft text-ink'}`}
    >
      <strong>{result.title}.</strong> {result.message}
    </p>
  );
}

function Confirm({ children }: { children: ReactNode }) {
  return (
    <label className='flex items-start gap-2 text-sm text-ink'>
      <input type='checkbox' name='confirm' value='yes' required className='mt-0.5 h-4 w-4 accent-seal' />
      <span>{children}</span>
    </label>
  );
}

function StepForm({
  action,
  claimId,
  submit,
  working,
  tone = 'primary',
  children
}: {
  action: (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  claimId: string;
  submit: string;
  working: string;
  tone?: 'primary' | 'secondary';
  children: ReactNode;
}) {
  const [result, run, pending] = useActionState(action, null);
  return (
    <form action={run} className='grid gap-4'>
      <input type='hidden' name='claimId' value={claimId} />
      {children}
      <Result result={result} />
      <div>
        <button type='submit' disabled={pending} className={tone === 'primary' ? primary : secondary}>
          {pending ? working : submit}
        </button>
      </div>
    </form>
  );
}

function NotYourStep({ who }: { who: string }) {
  return <p className='text-sm text-dim'>This step is for {who}. Your role can see the claim but not take this step.</p>;
}

export function ClaimSteps({ claimId, next, claimedLabel, approvedLabel, can, today }: ClaimStepsProps) {
  const [declining, setDeclining] = useState(false);

  if (next === 'none') return null;

  if (next === 'start-review') {
    if (!can.update) return <NotYourStep who='a claims officer or claims manager' />;
    return (
      <StepForm action={startClaimReview} claimId={claimId} submit='Start the review' working='Starting…'>
        <p className='text-sm text-ink'>Check the policy was in force, collect the documents, then start the review.</p>
        <Confirm>I have the claim form and the main documents.</Confirm>
      </StepForm>
    );
  }

  if (next === 'decide') {
    if (!can.approve && !can.reject) return <NotYourStep who='the claims manager' />;
    return (
      <div className='grid gap-6'>
        {can.approve && !declining ? (
          <StepForm action={approveClaimAmount} claimId={claimId} submit='Approve the amount' working='Approving…'>
            <p className='text-sm text-ink'>
              Amount claimed: <strong>{claimedLabel}</strong>. The amount approved is the claim less the excess and anything not covered.
            </p>
            <div className='grid gap-4 sm:grid-cols-2'>
              <label className={label}>
                Excess, in shillings
                <span className={hint}>The part the customer carries under the policy. 0 if none.</span>
                <input name='excess' inputMode='numeric' placeholder='0' autoComplete='off' className={field} />
              </label>
              <label className={label}>
                Not covered, in shillings
                <span className={hint}>Any part of the claim the policy does not cover. 0 if none.</span>
                <input name='notCovered' inputMode='numeric' placeholder='0' autoComplete='off' className={field} />
              </label>
            </div>
            <label className={label}>
              Why part is not covered
              <span className={hint}>Only when an amount is not covered. The customer will see this reason.</span>
              <input name='notCoveredReason' maxLength={200} autoComplete='off' className={field} />
            </label>
            <Confirm>I have assessed this claim and approve the amount worked out above.</Confirm>
          </StepForm>
        ) : null}
        {can.reject ? (
          declining ? (
            <StepForm action={declineClaimWithReason} claimId={claimId} submit='Decline the claim' working='Declining…' tone='secondary'>
              <label className={label}>
                Reason for declining
                <span className={hint}>Plain words the customer will understand, naming the policy condition.</span>
                <textarea name='reason' required minLength={5} maxLength={400} rows={3} className={field} />
              </label>
              <Confirm>I decline this claim for the reason above.</Confirm>
              <button type='button' onClick={() => setDeclining(false)} className='justify-self-start text-sm font-medium text-dim hover:text-ink'>
                Back to approving
              </button>
            </StepForm>
          ) : (
            <button type='button' onClick={() => setDeclining(true)} className={`${secondary} justify-self-start`}>
              Decline instead…
            </button>
          )
        ) : null}
      </div>
    );
  }

  if (next === 'record-payment') {
    if (!can.update) return <NotYourStep who='a claims officer working with finance' />;
    return (
      <StepForm action={recordClaimPayment} claimId={claimId} submit='Record the payment' working='Recording…'>
        <p className='text-sm text-ink'>
          Approved: <strong>{approvedLabel}</strong>. Finance pays outside InsurOS; record here what was paid. Someone other than the person who approved the amount records it.
        </p>
        <div className='grid gap-4 sm:grid-cols-2'>
          <label className={label}>
            Paid to
            <input name='paidTo' required maxLength={120} placeholder='Westlands Auto Body Ltd' autoComplete='off' className={field} />
          </label>
          <label className={label}>
            How it was paid
            <input name='method' required maxLength={80} placeholder='Bank transfer' autoComplete='off' className={field} />
          </label>
          <label className={label}>
            Payment reference
            <span className={hint}>From the bank or M-Pesa confirmation.</span>
            <input name='reference' required maxLength={60} autoComplete='off' className={field} />
          </label>
          <label className={label}>
            Paid on
            <input name='paidOn' type='date' required max={today} defaultValue={today} className={field} />
          </label>
          <label className={label}>
            Discharge voucher signed on
            <span className={hint}>The claimant signs it before payment.</span>
            <input name='dischargeSignedOn' type='date' required max={today} defaultValue={today} className={field} />
          </label>
        </div>
        <Confirm>The payment above was made and the signed discharge voucher is on file.</Confirm>
      </StepForm>
    );
  }

  if (!can.approve) return <NotYourStep who='the claims manager' />;
  return (
    <StepForm action={approveSettlementCertificate} claimId={claimId} submit='Approve the certificate of settlement' working='Approving…'>
      <p className='text-sm text-ink'>
        The payment of <strong>{approvedLabel}</strong> is recorded. Approving the certificate settles the claim. Someone other than the person who recorded the payment approves it.
      </p>
      <Confirm>I have checked the payment and the discharge voucher, and approve the certificate of settlement.</Confirm>
    </StepForm>
  );
}
