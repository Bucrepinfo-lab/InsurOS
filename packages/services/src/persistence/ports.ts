import type {
  AdjudicationDecision,
  AdjudicationRule,
  AdminAppointment,
  AdminRegion,
  AffordabilityBand,
  Claim,
  CommissionAccrual,
  CommissionSchedule,
  CompetitorBenchmark,
  Customer,
  EngagementItem,
  FnolSubmission,
  KpiSnapshot,
  MarketingContent,
  MicroPayment,
  MicroPolicy,
  MicroProduct,
  MobileMoneyProvider,
  NewPaymentLedgerEntry,
  NewsletterIssue,
  OcrExtraction,
  PaymentLedgerEntry,
  Policy,
  RenewalAlert,
  RiskFactor,
  ScenePhoto,
  SubscriberDashboardPrefs,
  Subscription,
  SubscriptionPlan,
  JurisdictionAssignment,
  SalesAgent,
  SalesAssignment,
  SubnationalTaxRule,
  TaxJurisdiction,
  TaxRemittance,
  Tenant,
  TermsAcceptance,
  TermsDocument
} from "@insuros/domain";

/**
 * Persistence port: every storage backend (in-memory, PostgreSQL/Drizzle)
 * implements these interfaces. Services depend on ports, never on a
 * concrete backend.
 */
export interface Repository<T extends { id: string }> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | undefined>;
  findWhere(predicate: (entity: T) => boolean): Promise<T[]>;
  insert(entity: T): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T | undefined>;
}

export type PersistenceKind = "memory" | "postgres";

/**
 * Append-only payment ledger. No update or delete of financial facts; the only
 * permitted change is de-identifying a payer (phone + raw payload removed).
 */
export interface PaymentLedgerPort {
  append(entry: NewPaymentLedgerEntry): Promise<PaymentLedgerEntry>;
  /** All entries of a transaction, oldest first. */
  history(txnId: string): Promise<PaymentLedgerEntry[]>;
  /** Latest entry of the transaction that carries this provider id. */
  latestByProviderTxnId(providerTxnId: string): Promise<PaymentLedgerEntry | undefined>;
  /** Replace the payer phone with "redacted" and drop raw payloads. Returns rows changed. */
  deidentifyPhone(phone: string): Promise<number>;
}

export interface PersistenceAdapter {
  kind: PersistenceKind;
  /** Tenant this adapter instance is bound to. */
  tenantId: string;
  tenants: Repository<Tenant>;
  policies: Repository<Policy>;
  claims: Repository<Claim>;
  customers: Repository<Customer>;
  paymentLedger: PaymentLedgerPort;
  regions: Repository<AdminRegion>;
  appointments: Repository<AdminAppointment>;
  jurisdictionAssignments: Repository<JurisdictionAssignment>;
  taxJurisdictions: Repository<TaxJurisdiction>;
  subnationalTaxRules: Repository<SubnationalTaxRule>;
  taxRemittances: Repository<TaxRemittance>;
  salesAgents: Repository<SalesAgent>;
  salesAssignments: Repository<SalesAssignment>;
  commissionSchedules: Repository<CommissionSchedule>;
  commissionAccruals: Repository<CommissionAccrual>;
  termsDocuments: Repository<TermsDocument>;
  termsAcceptances: Repository<TermsAcceptance>;
  fnolSubmissions: Repository<FnolSubmission>;
  adjudicationRules: Repository<AdjudicationRule>;
  adjudicationDecisions: Repository<AdjudicationDecision>;
  riskFactors: Repository<RiskFactor>;
  affordabilityBands: Repository<AffordabilityBand>;
  competitorBenchmarks: Repository<CompetitorBenchmark>;
  microProducts: Repository<MicroProduct>;
  mobileMoneyProviders: Repository<MobileMoneyProvider>;
  microPolicies: Repository<MicroPolicy>;
  microPayments: Repository<MicroPayment>;
  kpiSnapshots: Repository<KpiSnapshot>;
  ocrExtractions: Repository<OcrExtraction>;
  scenePhotos: Repository<ScenePhoto>;
  marketingContent: Repository<MarketingContent>;
  subscriptionPlans: Repository<SubscriptionPlan>;
  subscriptions: Repository<Subscription>;
  renewalAlerts: Repository<RenewalAlert>;
  engagementItems: Repository<EngagementItem>;
  newsletterIssues: Repository<NewsletterIssue>;
  subscriberPrefs: Repository<SubscriberDashboardPrefs & { id: string }>;
}
