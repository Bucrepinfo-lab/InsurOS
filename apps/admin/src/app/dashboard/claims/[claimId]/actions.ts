'use server';

import { revalidatePath } from 'next/cache';
import {
  approveCertificate,
  approveClaim,
  declineClaim,
  recordPayment,
  startReview,
  type ClaimActor,
  type ClaimProgressResult,
  type OwnedClaim,
  type PermissionAction
} from '@insuros/domain';
import { ClaimService } from '@insuros/services';
import { fail, ok, type ActionResult } from '@/lib/action-result';
import { authorizeAction } from '@/lib/auth/session';
import { actorIdFor, reachFor } from '@/lib/record-scope';

/*
  One server action per claim step. Each needs the role's permission, a ticked
  confirmation, and passes the step's own rules (claim-progress.ts), which also
  keep four eyes on the money. A record only: no money moves from InsurOS.
*/

const text = (formData: FormData, name: string) => String(formData.get(name) ?? '').trim();

function wholeShillings(raw: string): number {
  const cleaned = raw.replace(/[,\s]/g, '').replace(/^KES/i, '');
  if (cleaned === '') return 0;
  return /^\d+$/.test(cleaned) ? Number(cleaned) : Number.NaN;
}

async function take(
  formData: FormData,
  action: PermissionAction,
  stepName: string,
  run: (claim: OwnedClaim, actor: ClaimActor) => ClaimProgressResult,
  done: (claim: OwnedClaim) => [string, string]
): Promise<ActionResult> {
  const auth = await authorizeAction('Claims', action);
  if (!auth.ok) return auth.result;
  if (formData.get('confirm') !== 'yes') return fail('Please confirm', `Tick the box to confirm you want to ${stepName}.`);

  const claimId = text(formData, 'claimId');
  const actor: ClaimActor = { userId: actorIdFor(auth.principal), name: auth.principal.name || auth.principal.phone || 'Staff member' };
  const result = await new ClaimService().progressClaim(reachFor(auth.principal, 'Claims'), claimId, (claim) => run(claim, actor));
  if (!result.ok) return fail('Not done', result.error);

  const path = `/dashboard/claims/${encodeURIComponent(result.claim.id)}`;
  revalidatePath(path, 'layout');
  revalidatePath('/dashboard/claims');
  const [title, message] = done(result.claim);
  return ok(title, message, { reference: result.claim.claimNumber });
}

export async function startClaimReview(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return take(formData, 'Update', 'start the review', (claim, actor) => startReview(claim, actor), () => [
    'Review started',
    'The claim is in review. The claims manager approves or declines it.'
  ]);
}

export async function approveClaimAmount(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const excess = wholeShillings(text(formData, 'excess'));
  const notCovered = wholeShillings(text(formData, 'notCovered'));
  if (!Number.isFinite(excess) || !Number.isFinite(notCovered)) {
    return fail('Check the figures', 'Write the excess and the amount not covered in whole shillings, for example 15,000.');
  }
  return take(
    formData,
    'Approve',
    'approve this amount',
    (claim, actor) => approveClaim(claim, actor, { excess, notCovered, notCoveredReason: text(formData, 'notCoveredReason') }),
    (claim) => ['Claim approved', `KES ${claim.settlement?.approved.toLocaleString('en-KE')} approved. Finance pays it outside InsurOS and someone else records the payment here.`]
  );
}

export async function declineClaimWithReason(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return take(formData, 'Reject', 'decline this claim', (claim, actor) => declineClaim(claim, actor, text(formData, 'reason')), () => [
    'Claim declined',
    'The claim is closed with your reason. Tell the customer, in the same words.'
  ]);
}

export async function recordClaimPayment(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return take(
    formData,
    'Update',
    'record this payment',
    (claim, actor) =>
      recordPayment(claim, actor, {
        paidTo: text(formData, 'paidTo'),
        method: text(formData, 'method'),
        reference: text(formData, 'reference'),
        paidOn: text(formData, 'paidOn'),
        dischargeSignedOn: text(formData, 'dischargeSignedOn')
      }),
    () => ['Payment recorded', 'The claims manager now approves the certificate of settlement.']
  );
}

export async function approveSettlementCertificate(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return take(formData, 'Approve', 'approve the certificate of settlement', (claim, actor) => approveCertificate(claim, actor), (claim) => [
    'Claim settled',
    `Certificate of settlement ${claim.settlement?.certificateNumber} approved.`
  ]);
}
