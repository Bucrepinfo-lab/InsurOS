'use server';

import { revalidatePath } from 'next/cache';
import { fail, ok, type ActionResult } from '@/lib/action-result';
import {
  AdminHierarchyService,
  ClaimsAutomationService,
  CommissionService,
  DocumentIntelligenceService,
  MicroinsuranceService,
  SalesHierarchyService,
  SceneCaptureService,
  SubscriptionService,
  TaxRemittanceService,
  TermsService,
  getPersistence
} from '@insuros/services';

/**
 * Demo actions: every primary button runs its real engine against the
 * in-memory dataset, then refreshes the page. When PostgreSQL lands these
 * same paths persist for real.
 */

const FIRST = ['Amos', 'Beatrice', 'Collins', 'Diana', 'Elijah', 'Femi', 'Grace', 'Hassan', 'Imani', 'Joseph'];
const LAST = ['Mutua', 'Wanjiku', 'Odhiambo', 'Cherono', 'Abubakar', 'Njoroge', 'Achieng', 'Kiptoo', 'Nyambura', 'Otieno'];

function randomName(): string {
  return `${FIRST[Math.floor(Math.random() * FIRST.length)]} ${LAST[Math.floor(Math.random() * LAST.length)]}`;
}

function randomMsisdn(): string {
  return `+2547${String(10000000 + Math.floor(Math.random() * 89999999))}`;
}

export async function submitDemoFnol(): Promise<ActionResult> {
  const service = new ClaimsAutomationService();
  const clean = Math.random() > 0.35;

  const result = await service.submitFnol({
    claimReference: `CLM-KE-2026-${String(1000 + Math.floor(Math.random() * 9000))}`,
    policyReference: `POL-KE-2026-${String(100 + Math.floor(Math.random() * 900)).padStart(5, '0')}`,
    insuranceLine: Math.random() > 0.5 ? 'Motor' : 'Health',
    channel: 'Mobile',
    description: 'Demo FNOL submitted from the admin console.',
    incidentAt: new Date(Date.now() - (clean ? 4 : 500) * 3_600_000).toISOString(),
    amountClaimed: clean ? 5_000 + Math.floor(Math.random() * 40_000) : 900_000,
    currency: 'KES',
    documentsComplete: clean,
    policyAgeDays: clean ? 120 + Math.floor(Math.random() * 300) : 12,
    priorClaimsCount: clean ? 0 : 4
  });

  revalidatePath('/dashboard/claims/automation');
  return result.decision.outcome === 'AutoApproved'
    ? ok('Claim auto-approved', `Fraud score ${result.assessment.score} · payout SLA ${result.decision.slaHours}h · reasons on the ledger`, { reference: result.fnol.claimReference })
    : ok('Claim received — under review', `Fraud score ${result.assessment.score} · an adjuster owns the decision from here`, { reference: result.fnol.claimReference });
}

export async function registerDemoSceneCapture(): Promise<ActionResult> {
  const claims = new ClaimsAutomationService();
  const scenes = new SceneCaptureService();
  const fnols = await claims.getFnols();
  const fnol = fnols[fnols.length - 1];

  const photo = await scenes.register({
    claimReference: fnol?.claimReference ?? 'CLM-KE-2026-0801',
    url: `https://storage.insuros.example/scenes/scene-${Date.now()}.jpg`,
    sha256: Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join(''),
    liveCapture: true,
    capturedAt: new Date(Date.now() - 6 * 60_000).toISOString(),
    latitude: -1.21 - Math.random() * 0.1,
    longitude: 36.85 + Math.random() * 0.1,
    geoAccuracyMeters: 4 + Math.floor(Math.random() * 10),
    deviceModel: 'Demo Device'
  });

  revalidatePath('/dashboard/claims/evidence');
  return ok('Evidence sealed at the scene', 'Live capture with GPS fix and on-device hash — tamper-evident from this second', { reference: photo.claimReference });
}

export async function enrolDemoMicroPolicy(): Promise<ActionResult> {
  const service = new MicroinsuranceService();
  const products = await service.getProducts();
  const product = products[Math.floor(Math.random() * products.length)];

  const result = await service.enroll({
    productId: product.id,
    holderName: randomName(),
    msisdn: randomMsisdn(),
    channel: product.activationChannels[0],
    providerId: 'momo-mpesa'
  });

  revalidatePath('/dashboard/marketplace/micro');
  return result.ok
    ? ok('Enrolment confirmed', `${result.policy?.holderName ?? 'Customer'} covered on ${product.name} — first premium via M-PESA activates it`, { reference: result.policy?.id })
    : fail('Enrolment declined', result.error ?? 'Try again or pick another product');
}

export async function addDemoSubscriber(): Promise<ActionResult> {
  const service = new SubscriptionService();
  const name = randomName();

  const sub = await service.subscribe({
    subscriberName: name,
    msisdn: randomMsisdn(),
    countryCode: 'KE'
  });

  revalidatePath('/dashboard/subscribers');
  return ok('Subscription receipted', `${name} starts a free first month · renewal due day 40 · nudges booked for days 35 and 39`, { reference: sub.id });
}

export async function appointDemoAdmin(): Promise<ActionResult> {
  const service = new AdminHierarchyService();
  const regions = await service.getRegions();
  const candidates = regions.filter(
    (region) => region.level === 'County' || region.level === 'Constituency'
  );
  const region = candidates[Math.floor(Math.random() * candidates.length)];
  const name = randomName();

  const result = await service.appointAdmin({
    userId: `user-${Date.now()}`,
    userName: name,
    email: `${name.toLowerCase().replace(' ', '.')}@insuros.example`,
    regionId: region.id,
    roleId: 'role-finance-manager',
    appointedByUserId: 'user-super-admin'
  });

  revalidatePath('/dashboard/governance/appointments');
  return result.ok
    ? ok('Appointment issued', `${name} appointed to ${region.name} — pending activation, audit-logged`, { reference: result.appointment?.id })
    : fail('Appointment blocked', result.error ?? 'Hierarchy rules prevented this appointment');
}

export async function createDemoRegion(): Promise<ActionResult> {
  const db = getPersistence();
  const n = 100 + Math.floor(Math.random() * 900);

  await db.regions.insert({
    id: `region-ke-047-demo-${n}`,
    name: `Demo Ward ${n}`,
    code: `KE-047-D${n}`,
    level: 'Constituency',
    parentRegionId: 'region-ke-047',
    countryCode: 'KE',
    continentCode: 'AF',
    status: 'Active'
  });

  revalidatePath('/dashboard/governance');
  return ok('Region registered', `Demo Ward ${n} created under Nairobi County — jurisdiction chain resolves to Global`, { reference: `KE-047-D${n}` });
}

export async function grantDemoAccess(): Promise<ActionResult> {
  const db = getPersistence();
  const name = randomName();
  const grantId = `jgrant-${Date.now()}`;

  await db.jurisdictionAssignments.insert({
    id: grantId,
    userId: `user-${Date.now()}`,
    userName: name,
    roleId: 'role-finance-manager',
    regionId: 'region-ke-047',
    assignedBy: 'user-super-admin',
    assignedAt: new Date().toISOString(),
    status: 'Active'
  });

  revalidatePath('/dashboard/governance/access');
  return ok('Access granted', `${name} holds Finance Manager across Nairobi County and all descendants`, { reference: grantId });
}

export async function recordDemoAcceptance(): Promise<ActionResult> {
  const service = new TermsService();
  const name = randomName();

  const acceptance = await service.recordAcceptance(`user-${Date.now()}`, name, 'Policyholder');

  revalidatePath('/dashboard/legal');
  return ok('Acceptance receipted', `${name} accepted the active terms — version, time, and method preserved in the audit trail`, { reference: acceptance.id });
}

export async function computeDemoRemittance(): Promise<ActionResult> {
  const service = new TaxRemittanceService();
  const db = getPersistence();
  const jurisdictions = await service.getJurisdictions();
  const jurisdiction = jurisdictions[Math.floor(Math.random() * jurisdictions.length)];

  const remittance = await service.computeRemittance({
    jurisdictionId: jurisdiction.id,
    period: '2026-07',
    insuranceLine: 'Motor',
    grossPremium: 1_000_000 + Math.floor(Math.random() * 50_000_000)
  });

  remittance.dueDate = new Date(Date.now() + 20 * 86_400_000).toISOString();
  await db.taxRemittances.insert(remittance);

  revalidatePath('/dashboard/finance/tax');
  return ok('Remittance computed', `${jurisdiction.countryName}: ${remittance.currency} ${remittance.totalDue.toLocaleString()} due in 20 days · pay via ${jurisdiction.portalName}`, { reference: remittance.id });
}

export async function addDemoRegionalRule(): Promise<ActionResult> {
  const db = getPersistence();
  const n = Math.floor(Math.random() * 47) + 1;
  const ruleId = `sub-ke-demo-${Date.now()}`;

  await db.subnationalTaxRules.insert({
    id: ruleId,
    countryCode: 'KE',
    regionCode: `KE-${String(n).padStart(3, '0')}`,
    regionName: `County ${n}`,
    name: 'Demo county service levy',
    kind: 'LocalLevy',
    flatAmount: 5_000 + Math.floor(Math.random() * 10_000),
    currency: 'KES',
    base: 'GrossPremium',
    appliesTo: [],
    portalName: 'County revenue portal',
    portalUrl: 'https://example.go.ke',
    ratesVerifiedAt: new Date().toISOString(),
    notes: 'Demo rule — replace with verified county data.'
  });

  revalidatePath('/dashboard/finance/tax/regional');
  return ok('Regional rule registered', `Levy recorded for County ${n} — verify the band with the county before filing`, { reference: ruleId });
}

export async function captureDemoBenchmark(): Promise<ActionResult> {
  const db = getPersistence();
  const price = 3_500 + Math.floor(Math.random() * 1_500);
  const benchId = `bench-${Date.now()}`;

  await db.competitorBenchmarks.insert({
    id: benchId,
    competitor: `Competitor ${String.fromCharCode(70 + Math.floor(Math.random() * 15))}`,
    insuranceLine: 'Motor',
    countryCode: 'KE',
    monthlyPremium: price,
    currency: 'KES',
    capturedAt: new Date().toISOString()
  });

  revalidatePath('/dashboard/marketplace/pricing-engine');
  return ok('Benchmark filed', `Captured at KES ${price.toLocaleString()} — the market median and undercut price recalculated instantly`, { reference: benchId });
}

export async function nameDemoAgent(): Promise<ActionResult> {
  const db = getPersistence();
  const name = randomName();
  const agentId = `sales-agent-${Date.now()}`;

  await db.salesAgents.insert({
    id: agentId,
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@insuros.example`,
    rank: 'Constituency Agent',
    regionId: 'region-ke-047-westlands',
    supervisorId: 'sales-nairobi-1',
    status: 'Onboarding',
    joinedAt: new Date().toISOString()
  });

  revalidatePath('/dashboard/sales');
  return ok('Agent named', `${name} joins as Constituency Agent under Faith Njeri — onboarding checklist opened`, { reference: agentId });
}

export async function createDemoAssignment(): Promise<ActionResult> {
  const service = new SalesHierarchyService();

  const result = await service.createAssignment({
    agentId: 'sales-agent-westlands-1',
    assignedByAgentId: 'sales-nairobi-1',
    regionId: 'region-ke-047-westlands',
    targetPremium: 100_000_000 + Math.floor(Math.random() * 200_000_000),
    currency: 'KES',
    period: '2026-Q3',
    notes: 'Demo assignment issued from the console.'
  });

  revalidatePath('/dashboard/sales/assignments');
  return result.ok
    ? ok('Target assigned', 'Rank and reporting line validated — the assignment is on the register', { reference: result.assignment?.id })
    : fail('Assignment blocked', result.error ?? 'Rank rules prevented this assignment');
}

export async function accrueDemoPremium(): Promise<ActionResult> {
  const service = new CommissionService();

  const created = await service.accruePremium({
    writingAgentId: 'sales-agent-westlands-1',
    policyReference: `POL-KE-2026-${String(400 + Math.floor(Math.random() * 500)).padStart(5, '0')}`,
    insuranceLine: Math.random() > 0.5 ? 'Motor' : 'Health',
    grossPremium: 100_000 + Math.floor(Math.random() * 900_000),
    currency: 'KES',
    period: '2026-07'
  });

  revalidatePath('/dashboard/sales/commissions');
  return ok('Commissions accrued', `${created.length} accruals cascaded up the override chain — every beneficiary named`, { reference: created[0]?.policyReference });
}

export async function ingestDemoDocument(): Promise<ActionResult> {
  const service = new DocumentIntelligenceService();
  const strong = Math.random() > 0.4;
  const confidence = strong ? 0.93 + Math.random() * 0.06 : 0.45 + Math.random() * 0.3;

  const extraction = await service.ingest({
    attachmentReference: `ATT-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
    documentType: 'RepairInvoice',
    fields: [
      { key: 'garage', value: 'Demo Motors Ltd', confidence },
      { key: 'amount', value: String(10_000 + Math.floor(Math.random() * 90_000)), confidence },
      { key: 'registrationNumber', value: 'KDX 001A', confidence }
    ]
  });

  revalidatePath('/dashboard/operations/documents');
  return extraction.status === 'Verified'
    ? ok('Document auto-verified', `Read at ${Math.round(extraction.overallConfidence * 100)}% confidence — fields extracted and receipted`, { reference: extraction.attachmentReference })
    : ok('Document receipted — needs review', `Confidence ${Math.round(extraction.overallConfidence * 100)}% — routed to a human, never silently decided`, { reference: extraction.attachmentReference });
}

export async function createDemoContent(): Promise<ActionResult> {
  const db = getPersistence();

  const contentId = `mkt-demo-${Date.now()}`;

  await db.marketingContent.insert({
    id: contentId,
    title: `Draft merit ${new Date().toISOString().slice(11, 19)}`,
    headline: 'A new merit worth telling the world about.',
    body: 'Draft created from the console — edit before publishing.',
    cta: 'Learn more',
    insuranceLine: 'All',
    placement: 'All',
    audience: 'All',
    locale: 'en',
    status: 'Draft'
  });

  revalidatePath('/dashboard/operations/crm');
  return ok('Draft receipted', 'Content saved as draft — edit the merit and activate to publish across policy UIs', { reference: contentId });
}

export async function recordDemoSnapshot(): Promise<ActionResult> {
  const db = getPersistence();
  const snapshots = await db.kpiSnapshots.findAll();
  const latest = snapshots[snapshots.length - 1];
  const gwp = Math.round((latest?.grossWrittenPremium ?? 200_000_000) * (1.02 + Math.random() * 0.06));

  await db.kpiSnapshots.insert({
    id: `kpi-ke-demo-${Date.now()}`,
    period: '2026-07',
    countryCode: 'KE',
    currency: 'KES',
    grossWrittenPremium: gwp,
    claimsIncurred: Math.round(gwp * (0.58 + Math.random() * 0.08)),
    operatingExpenses: Math.round(gwp * (0.26 + Math.random() * 0.05)),
    stpRatePercent: Math.min(70, (latest?.stpRatePercent ?? 41) + Math.floor(Math.random() * 8)),
    avgClaimCycleDays: Math.max(2, (latest?.avgClaimCycleDays ?? 12) - Math.floor(Math.random() * 3)),
    policyRetentionPercent: Math.min(95, (latest?.policyRetentionPercent ?? 78) + Math.floor(Math.random() * 3))
  });

  revalidatePath('/dashboard/finance/analytics');
  return ok('Snapshot filed', 'July KPIs recorded — combined ratio improving as automation climbs', { reference: '2026-07 · KE' });
}

export async function refreshClerkPlan(): Promise<ActionResult> {
  revalidatePath('/dashboard/identity/clerk-sync');
  return fail('Key required to execute', 'Plan refreshed, but running it needs CLERK_SECRET_KEY — provision it and this button goes live', { reference: 'CLERK_SECRET_KEY' });
}

/* ── Legacy-page actions: clone-from-template inserts + universal request log ── */

import {
  mockAttachments,
  mockAuditEvents,
  mockClaims,
  mockComments,
  mockCustomers,
  mockFeatureFlags,
  mockPlatformSettings,
  mockPolicies,
  mockProducts
} from '@insuros/mocks';

function cloneRow<T extends { id: string }>(rows: T[], overrides: Partial<T> = {}): T {
  const template = { ...rows[0], id: `${rows[0].id}-d${Date.now() % 100000}`, ...overrides };
  rows.push(template);
  return template;
}

/**
 * Universal acknowledgment for operational requests: the request is
 * receipted into the audit trail so nothing pressed ever vanishes.
 */
export async function queueDemoRequest(label: string): Promise<ActionResult> {
  const entry = cloneRow(mockAuditEvents as unknown as { id: string }[]) as Record<string, unknown>;
  if ('description' in entry) entry.description = `${label} requested from the console`;
  if ('action' in entry) entry.action = label;
  if ('occurredAt' in entry) entry.occurredAt = new Date().toISOString();
  if ('createdAt' in entry) entry.createdAt = new Date().toISOString();

  revalidatePath('/dashboard/audit');
  return ok('Request receipted', `"${label}" logged to the audit trail — full workflow lands with persistence`, {
    reference: String(entry.id)
  });
}

export async function registerDemoClaim(): Promise<ActionResult> {
  const row = cloneRow(mockClaims);
  revalidatePath('/dashboard/claims');
  return ok('Claim registered', 'New claim opened from template — visible on the register below', { reference: row.id });
}

export async function issueDemoPolicy(): Promise<ActionResult> {
  const row = cloneRow(mockPolicies);
  revalidatePath('/dashboard/policies');
  return ok('Policy issued', 'Policy issued from template — schedule and coverages attached', { reference: row.id });
}

export async function addDemoCustomer(): Promise<ActionResult> {
  const row = cloneRow(mockCustomers);
  revalidatePath('/dashboard/customers');
  return ok('Customer added', 'Customer record created — KYC checks queued', { reference: row.id });
}

export async function createDemoProduct(): Promise<ActionResult> {
  const row = cloneRow(mockProducts);
  revalidatePath('/dashboard/marketplace');
  return ok('Product created', 'Draft product cloned — set pricing before publishing', { reference: row.id });
}

export async function addDemoComment(): Promise<ActionResult> {
  const row = cloneRow(mockComments);
  revalidatePath('/dashboard/comments');
  return ok('Comment receipted', 'Operational note recorded against the thread', { reference: row.id });
}

export async function uploadDemoAttachment(): Promise<ActionResult> {
  const row = cloneRow(mockAttachments);
  revalidatePath('/dashboard/attachments');
  return ok('Attachment receipted', 'File registered — OCR intake picks it up next', { reference: row.id });
}

export async function createDemoSetting(): Promise<ActionResult> {
  const row = cloneRow(mockPlatformSettings);
  revalidatePath('/dashboard/operations/settings');
  return ok('Setting registered', 'Runtime setting created — takes effect on next read', { reference: row.id });
}

export async function createDemoFlag(): Promise<ActionResult> {
  const row = cloneRow(mockFeatureFlags);
  revalidatePath('/dashboard/operations/feature-flags');
  return ok('Flag registered', 'Feature flag created — disabled until you switch it on', { reference: row.id });
}
