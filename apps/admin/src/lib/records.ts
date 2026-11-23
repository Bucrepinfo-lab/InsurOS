import { notFound } from 'next/navigation';
import type { ClaimSettlementRecord, ClaimStatus, ClaimStep, OwnedClaim, OwnedCustomer, OwnedPolicy, PolicyStatus } from '@insuros/domain';
import { ClaimService, CustomerService, PolicyService } from '@insuros/services';
import { sampleClaimStory, type SampleClaimStory } from '@insuros/mocks';
import { currentReach } from '@/lib/record-scope';

/*
  One place that loads a customer, policy or claim for its detail pages, so
  every tab shows the record in the address bar (never a fixed demo record)
  and the pages link to each other: customer → policy → claim → settlement.
  Reach is checked on the server; a record the person may not see is a 404.
*/

type Tone = 'neutral' | 'success' | 'warning' | 'danger';

export const claimTone = (status: ClaimStatus): Tone =>
  status === 'Settled' || status === 'Closed' ? 'success' : status === 'Approved' ? 'neutral' : 'warning';

export const policyTone = (status: PolicyStatus): Tone =>
  status === 'Active' ? 'success' : status === 'Cancelled' ? 'danger' : 'warning';

/** Where a claim stands, worked out from its own status (never a separate list that can go stale). */
export function claimStage(claim: Pick<OwnedClaim, 'status' | 'declinedReason'>): { stage: string; state: string } {
  switch (claim.status) {
    case 'Open':
      return { stage: 'First notice', state: 'Submitted' };
    case 'In Review':
      return { stage: 'Assessment', state: 'In Review' };
    case 'Approved':
      return { stage: 'Settlement', state: 'Approved' };
    case 'Settled':
      return { stage: 'Closed', state: 'Settled' };
    default:
      return { stage: 'Closed', state: claim.declinedReason ? 'Declined' : 'Closed' };
  }
}

export const money = (amount: number, currency = 'KES') => `${currency} ${amount.toLocaleString('en-KE')}`;

/** 2026-06-28 → 28/06/26 (the owner's date style). */
export function shortDate(value?: string): string {
  if (!value) return '—';
  const [y, m, d] = value.slice(0, 10).split('-');
  return d && m && y ? `${d}/${m}/${y.slice(2)}` : value;
}

/** 2026-06-28T14:20:00Z → 28/06/26 14:20 (UTC, as recorded). */
export function shortDateTime(value: string): string {
  return `${shortDate(value)} ${value.slice(11, 16)}`;
}

const decode = (id: string) => {
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
};

export interface ClaimRecord {
  claim: OwnedClaim;
  policy?: OwnedPolicy;
  story?: SampleClaimStory;
  /** Approval, payment and certificate as recorded (the claim's own record first). */
  settlement?: ClaimSettlementRecord;
  /** Steps taken, oldest first. */
  steps: ClaimStep[];
  tabs: { id: string; label: string; href: string }[];
}

export async function loadClaim(rawId: string): Promise<ClaimRecord> {
  const id = decode(rawId);
  const claim = await new ClaimService().getClaimFor(await currentReach('Claims'), id);
  if (!claim) notFound();
  const policies = (await new PolicyService().getPolicies()) as OwnedPolicy[];
  const policy = policies.find((row) => row.policyNumber === claim.policyNumber);
  const base = `/dashboard/claims/${encodeURIComponent(claim.id)}`;
  const story = sampleClaimStory(claim.id);
  return {
    claim,
    policy,
    story,
    settlement: claim.settlement ?? (story ? { ...story.settlement, approvedBy: story.settlement.certificateApprovedBy } : undefined),
    steps: claim.steps?.length ? claim.steps : (story?.steps ?? []),
    tabs: [
      { id: 'overview', label: 'Overview', href: base },
      { id: 'fnol', label: 'First notice', href: `${base}/fnol` },
      { id: 'assessment', label: 'Assessment', href: `${base}/assessment` },
      { id: 'settlement', label: 'Settlement', href: `${base}/settlement` },
      { id: 'documents', label: 'Documents', href: `${base}/documents` },
      { id: 'timeline', label: 'Timeline', href: `${base}/timeline` }
    ]
  };
}

export interface PolicyRecord {
  policy: OwnedPolicy;
  customer?: OwnedCustomer;
  claims: OwnedClaim[];
  tabs: { id: string; label: string; href: string }[];
}

export async function loadPolicy(rawId: string): Promise<PolicyRecord> {
  const id = decode(rawId);
  const policy = await new PolicyService().getPolicyFor(await currentReach('Policies'), id);
  if (!policy) notFound();
  const customers = (await new CustomerService().getCustomers()) as OwnedCustomer[];
  const customer =
    customers.find((row) => row.id === policy.customerId) ?? customers.find((row) => row.name === policy.customer);
  const claims = (await new ClaimService().getClaimsFor(await currentReach('Claims'))).filter(
    (claim) => claim.policyNumber === policy.policyNumber
  );
  const base = `/dashboard/policies/${encodeURIComponent(policy.id)}`;
  return {
    policy,
    customer,
    claims,
    tabs: [
      { id: 'overview', label: 'Overview', href: base },
      { id: 'holder', label: 'Policy holder', href: `${base}/holder` }
    ]
  };
}

export interface CustomerRecord {
  customer: OwnedCustomer;
  policies: OwnedPolicy[];
  claims: OwnedClaim[];
}

export async function loadCustomer(rawId: string): Promise<CustomerRecord> {
  const id = decode(rawId);
  const customer = await new CustomerService().getCustomerFor(await currentReach('Customers'), id);
  if (!customer) notFound();
  const policies = (await new PolicyService().getPoliciesFor(await currentReach('Policies'))).filter(
    (policy) => policy.customerId === customer.id || (!policy.customerId && policy.customer === customer.name)
  );
  const numbers = new Set(policies.map((policy) => policy.policyNumber));
  const claims = (await new ClaimService().getClaimsFor(await currentReach('Claims'))).filter((claim) =>
    numbers.has(claim.policyNumber)
  );
  return { customer, policies, claims };
}
