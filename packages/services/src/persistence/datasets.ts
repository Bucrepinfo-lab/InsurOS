import {
  mockAdjudicationDecisions,
  mockAdjudicationRules,
  mockAdminAppointments,
  mockAdminRegions,
  mockAffordabilityBands,
  mockClaims,
  mockCommissionAccruals,
  mockCommissionSchedules,
  mockCompetitorBenchmarks,
  mockCustomers,
  mockEngagementItems,
  mockFnolSubmissions,
  mockJurisdictionAssignments,
  mockKpiSnapshots,
  mockMarketingContent,
  mockMicroPayments,
  mockMicroPolicies,
  mockMicroProducts,
  mockMobileMoneyProviders,
  mockNewsletterIssues,
  mockOcrExtractions,
  mockPolicies,
  mockRenewalAlerts,
  mockRiskFactors,
  mockSalesAgents,
  mockSalesAssignments,
  mockScenePhotos,
  mockSubnationalTaxRules,
  mockSubscriberPrefs,
  mockSubscriptionPlans,
  mockSubscriptions,
  mockTaxJurisdictions,
  mockTaxRemittances,
  mockTermsAcceptances,
  mockTermsDocuments
} from "@insuros/mocks";
import { DEFAULT_TENANT_ID, DEMO_TENANT_ID, type Tenant } from "@insuros/domain";
import type { PersistenceAdapter, Repository } from "./ports";

/** Adapter keys that are document repositories (everything but metadata + ledger). */
export type RepositoryKey = Exclude<keyof PersistenceAdapter, "kind" | "tenantId" | "paymentLedger">;

/**
 * - "reference": configuration every tenant needs (regions, tax tables, rules,
 *   product catalogue, terms). Seeded into every tenant on first use.
 * - "sample": demo/sample business data (people, policies, claims, …). Seeded
 *   ONLY into the demo tenant — a production tenant starts empty.
 */
export type DatasetKind = "reference" | "sample";

export interface DatasetDefinition {
  /** Stable collection name in storage. Never rename (data lives under it). */
  collection: string;
  kind: DatasetKind;
  rows: () => { id: string }[];
  /**
   * Bump to seed new sample rows into a tenant that was seeded before. Rows
   * already there are never overwritten (insert ... on conflict do nothing),
   * so edits made in the demo tenant stay. Missing = 1.
   */
  seedVersion?: number;
}

const tenantRows = (): Tenant[] => [
  {
    id: DEFAULT_TENANT_ID,
    name: "InsurOS",
    kind: "Platform",
    countryCode: "KE",
    status: "Active",
    createdAt: "2026-11-07T00:00:00.000Z"
  },
  {
    id: DEMO_TENANT_ID,
    name: "InsurOS Demo (store review)",
    kind: "Demo",
    countryCode: "KE",
    status: "Active",
    createdAt: "2026-11-07T00:00:00.000Z"
  }
];

export const DATASETS: Record<RepositoryKey, DatasetDefinition> = {
  tenants: { collection: "tenants", kind: "reference", rows: tenantRows },
  regions: { collection: "regions", kind: "reference", rows: () => mockAdminRegions },
  appointments: { collection: "appointments", kind: "sample", rows: () => mockAdminAppointments },
  jurisdictionAssignments: { collection: "jurisdiction_assignments", kind: "sample", rows: () => mockJurisdictionAssignments },
  // v2 (23/11/26): three worked examples for every kind of cover (sample-book.ts).
  policies: { collection: "policies", kind: "sample", rows: () => mockPolicies, seedVersion: 2 },
  claims: { collection: "claims", kind: "sample", rows: () => mockClaims, seedVersion: 2 },
  customers: { collection: "customers", kind: "sample", rows: () => mockCustomers, seedVersion: 2 },
  taxJurisdictions: { collection: "tax_jurisdictions", kind: "reference", rows: () => mockTaxJurisdictions },
  subnationalTaxRules: { collection: "subnational_tax_rules", kind: "reference", rows: () => mockSubnationalTaxRules },
  taxRemittances: { collection: "tax_remittances", kind: "sample", rows: () => mockTaxRemittances },
  salesAgents: { collection: "sales_agents", kind: "sample", rows: () => mockSalesAgents },
  salesAssignments: { collection: "sales_assignments", kind: "sample", rows: () => mockSalesAssignments },
  commissionSchedules: { collection: "commission_schedules", kind: "reference", rows: () => mockCommissionSchedules },
  commissionAccruals: { collection: "commission_accruals", kind: "sample", rows: () => mockCommissionAccruals },
  termsDocuments: { collection: "terms_documents", kind: "reference", rows: () => mockTermsDocuments },
  termsAcceptances: { collection: "terms_acceptances", kind: "sample", rows: () => mockTermsAcceptances },
  fnolSubmissions: { collection: "fnol_submissions", kind: "sample", rows: () => mockFnolSubmissions },
  adjudicationRules: { collection: "adjudication_rules", kind: "reference", rows: () => mockAdjudicationRules },
  adjudicationDecisions: { collection: "adjudication_decisions", kind: "sample", rows: () => mockAdjudicationDecisions },
  riskFactors: { collection: "risk_factors", kind: "reference", rows: () => mockRiskFactors },
  affordabilityBands: { collection: "affordability_bands", kind: "reference", rows: () => mockAffordabilityBands },
  competitorBenchmarks: { collection: "competitor_benchmarks", kind: "sample", rows: () => mockCompetitorBenchmarks },
  microProducts: { collection: "micro_products", kind: "reference", rows: () => mockMicroProducts },
  mobileMoneyProviders: { collection: "mobile_money_providers", kind: "reference", rows: () => mockMobileMoneyProviders },
  microPolicies: { collection: "micro_policies", kind: "sample", rows: () => mockMicroPolicies },
  microPayments: { collection: "micro_payments", kind: "sample", rows: () => mockMicroPayments },
  kpiSnapshots: { collection: "kpi_snapshots", kind: "sample", rows: () => mockKpiSnapshots },
  ocrExtractions: { collection: "ocr_extractions", kind: "sample", rows: () => mockOcrExtractions },
  scenePhotos: { collection: "scene_photos", kind: "sample", rows: () => mockScenePhotos },
  marketingContent: { collection: "marketing_content", kind: "sample", rows: () => mockMarketingContent },
  subscriptionPlans: { collection: "subscription_plans", kind: "reference", rows: () => mockSubscriptionPlans },
  subscriptions: { collection: "subscriptions", kind: "sample", rows: () => mockSubscriptions },
  renewalAlerts: { collection: "renewal_alerts", kind: "sample", rows: () => mockRenewalAlerts },
  engagementItems: { collection: "engagement_items", kind: "sample", rows: () => mockEngagementItems },
  newsletterIssues: { collection: "newsletter_issues", kind: "sample", rows: () => mockNewsletterIssues },
  subscriberPrefs: {
    collection: "subscriber_prefs",
    kind: "sample",
    rows: () => mockSubscriberPrefs.map((prefs) => ({ id: prefs.subscriptionId, ...prefs }))
  },
  // Nothing is seeded: counts start at zero in every tenant.
  usageCounters: { collection: "usage_counters", kind: "reference", rows: () => [] },
  followUps: { collection: "follow_ups", kind: "reference", rows: () => [] },
  conversations: { collection: "conversations", kind: "reference", rows: () => [] },
  messages: { collection: "messages", kind: "reference", rows: () => [] },
  aiUsage: { collection: "ai_usage", kind: "reference", rows: () => [] },
  signatures: { collection: "signatures", kind: "reference", rows: () => [] }
};

export const REPOSITORY_KEYS = Object.keys(DATASETS) as RepositoryKey[];

/** Name recorded in insuros_tenant_seeds once a dataset is seeded ("claims", then "claims@v2"). */
export function seedMarker(dataset: DatasetDefinition): string {
  return (dataset.seedVersion ?? 1) > 1 ? `${dataset.collection}@v${dataset.seedVersion}` : dataset.collection;
}

/** Whether a tenant gets this dataset seeded. */
export function seedsInto(tenantId: string, kind: DatasetKind): boolean {
  return kind === "reference" || tenantId === DEMO_TENANT_ID;
}

/** Deep copy so tenants never share mutable rows with the mock modules. */
export function cloneRows<T>(rows: T[]): T[] {
  return JSON.parse(JSON.stringify(rows)) as T[];
}

export type AnyRepository = Repository<{ id: string }>;
