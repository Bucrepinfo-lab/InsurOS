import type {
  AdjudicationDecision,
  AdjudicationRule,
  AdminAppointment,
  AdminRegion,
  AffordabilityBand,
  CommissionAccrual,
  CommissionSchedule,
  CompetitorBenchmark,
  FnolSubmission,
  KpiSnapshot,
  MicroPayment,
  MicroPolicy,
  MicroProduct,
  MobileMoneyProvider,
  RiskFactor,
  JurisdictionAssignment,
  SalesAgent,
  SalesAssignment,
  SubnationalTaxRule,
  TaxJurisdiction,
  TaxRemittance,
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

export interface PersistenceAdapter {
  kind: PersistenceKind;
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
}
