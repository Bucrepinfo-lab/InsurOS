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
    ? ok(`Auto-approved in seconds · fraud score ${result.assessment.score} · payout SLA ${result.decision.slaHours}h`)
    : ok(`Routed to adjuster review · fraud score ${result.assessment.score}`);
}

export async function registerDemoSceneCapture(): Promise<ActionResult> {
  const claims = new ClaimsAutomationService();
  const scenes = new SceneCaptureService();
  const fnols = await claims.getFnols();
  const fnol = fnols[fnols.length - 1];

  await scenes.register({
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
  return ok('Live capture sealed — GPS and hash attached');
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
    ? ok(`${result.policy?.holderName ?? 'Customer'} enrolled on ${product.name}`)
    : fail(result.error ?? 'Enrolment failed — try again');
}

export async function addDemoSubscriber(): Promise<ActionResult> {
  const service = new SubscriptionService();
  const name = randomName();

  await service.subscribe({
    subscriberName: name,
    msisdn: randomMsisdn(),
    countryCode: 'KE'
  });

  revalidatePath('/dashboard/subscribers');
  return ok(`${name} subscribed · first month free · day-35 and day-39 nudges scheduled`);
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
    ? ok(`${name} appointed to ${region.name} — pending activation`)
    : fail(result.error ?? 'Appointment blocked by hierarchy rules');
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
  return ok(`Demo Ward ${n} created under Nairobi County`);
}

export async function grantDemoAccess(): Promise<ActionResult> {
  const db = getPersistence();
  const name = randomName();

  await db.jurisdictionAssignments.insert({
    id: `jgrant-${Date.now()}`,
    userId: `user-${Date.now()}`,
    userName: name,
    roleId: 'role-finance-manager',
    regionId: 'region-ke-047',
    assignedBy: 'user-super-admin',
    assignedAt: new Date().toISOString(),
    status: 'Active'
  });

  revalidatePath('/dashboard/governance/access');
  return ok(`${name} granted Finance Manager in Nairobi County and descendants`);
}

export async function recordDemoAcceptance(): Promise<ActionResult> {
  const service = new TermsService();
  const name = randomName();

  await service.recordAcceptance(`user-${Date.now()}`, name, 'Policyholder');

  revalidatePath('/dashboard/legal');
  return ok(`Click-wrap acceptance recorded for ${name} — audit trail updated`);
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
  return ok(`${jurisdiction.countryName}: ${remittance.currency} ${remittance.totalDue.toLocaleString()} due · pay via ${jurisdiction.portalName}`);
}

export async function addDemoRegionalRule(): Promise<ActionResult> {
  const db = getPersistence();
  const n = Math.floor(Math.random() * 47) + 1;

  await db.subnationalTaxRules.insert({
    id: `sub-ke-demo-${Date.now()}`,
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
  return ok(`Regional levy added for County ${n} — verify with the county before filing`);
}

export async function captureDemoBenchmark(): Promise<ActionResult> {
  const db = getPersistence();
  const price = 3_500 + Math.floor(Math.random() * 1_500);

  await db.competitorBenchmarks.insert({
    id: `bench-${Date.now()}`,
    competitor: `Competitor ${String.fromCharCode(70 + Math.floor(Math.random() * 15))}`,
    insuranceLine: 'Motor',
    countryCode: 'KE',
    monthlyPremium: price,
    currency: 'KES',
    capturedAt: new Date().toISOString()
  });

  revalidatePath('/dashboard/marketplace/pricing-engine');
  return ok(`Benchmark captured at KES ${price.toLocaleString()} — market median recalculated`);
}

export async function nameDemoAgent(): Promise<ActionResult> {
  const db = getPersistence();
  const name = randomName();

  await db.salesAgents.insert({
    id: `sales-agent-${Date.now()}`,
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@insuros.example`,
    rank: 'Constituency Agent',
    regionId: 'region-ke-047-westlands',
    supervisorId: 'sales-nairobi-1',
    status: 'Onboarding',
    joinedAt: new Date().toISOString()
  });

  revalidatePath('/dashboard/sales');
  return ok(`${name} named Constituency Agent under Faith Njeri — onboarding`);
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
    ? ok('Target assigned — chain of command validated')
    : fail(result.error ?? 'Assignment blocked by rank rules');
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
  return ok(`${created.length} accruals cascaded up the override chain`);
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
    ? ok(`Auto-verified at ${Math.round(extraction.overallConfidence * 100)}% confidence`)
    : ok(`Low confidence (${Math.round(extraction.overallConfidence * 100)}%) — routed to human review`);
}

export async function createDemoContent(): Promise<ActionResult> {
  const db = getPersistence();

  await db.marketingContent.insert({
    id: `mkt-demo-${Date.now()}`,
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
  return ok('Draft created — edit and activate when ready');
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
  return ok('July snapshot recorded — combined ratio improving');
}

export async function refreshClerkPlan(): Promise<ActionResult> {
  revalidatePath('/dashboard/identity/clerk-sync');
  return fail('Plan refreshed, but execution needs CLERK_SECRET_KEY — provision it to go live');
}
