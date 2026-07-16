import {
  mockAdjudicationDecisions,
  mockAdjudicationRules,
  mockAdminAppointments,
  mockAffordabilityBands,
  mockCompetitorBenchmarks,
  mockFnolSubmissions,
  mockKpiSnapshots,
  mockMarketingContent,
  mockMicroPayments,
  mockMicroPolicies,
  mockMicroProducts,
  mockMobileMoneyProviders,
  mockOcrExtractions,
  mockRiskFactors,
  mockScenePhotos,
  mockAdminRegions,
  mockCommissionAccruals,
  mockCommissionSchedules,
  mockJurisdictionAssignments,
  mockSalesAgents,
  mockSalesAssignments,
  mockSubnationalTaxRules,
  mockTaxJurisdictions,
  mockTaxRemittances,
  mockTermsAcceptances,
  mockTermsDocuments
} from "@insuros/mocks";
import type { PersistenceAdapter, Repository } from "./ports";

/**
 * In-memory repository over a live array (the mock datasets). Default
 * backend for development and demos; mutations persist for the process
 * lifetime only.
 */
class MemoryRepository<T extends { id: string }> implements Repository<T> {
  constructor(private readonly rows: T[]) {}

  async findAll(): Promise<T[]> {
    return this.rows;
  }

  async findById(id: string): Promise<T | undefined> {
    return this.rows.find((row) => row.id === id);
  }

  async findWhere(predicate: (entity: T) => boolean): Promise<T[]> {
    return this.rows.filter(predicate);
  }

  async insert(entity: T): Promise<T> {
    this.rows.push(entity);
    return entity;
  }

  async update(id: string, patch: Partial<T>): Promise<T | undefined> {
    const row = this.rows.find((item) => item.id === id);

    if (!row) {
      return undefined;
    }

    Object.assign(row, patch);
    return row;
  }
}

export function createMemoryAdapter(): PersistenceAdapter {
  return {
    kind: "memory",
    regions: new MemoryRepository(mockAdminRegions),
    appointments: new MemoryRepository(mockAdminAppointments),
    jurisdictionAssignments: new MemoryRepository(mockJurisdictionAssignments),
    taxJurisdictions: new MemoryRepository(mockTaxJurisdictions),
    subnationalTaxRules: new MemoryRepository(mockSubnationalTaxRules),
    taxRemittances: new MemoryRepository(mockTaxRemittances),
    salesAgents: new MemoryRepository(mockSalesAgents),
    salesAssignments: new MemoryRepository(mockSalesAssignments),
    commissionSchedules: new MemoryRepository(mockCommissionSchedules),
    commissionAccruals: new MemoryRepository(mockCommissionAccruals),
    termsDocuments: new MemoryRepository(mockTermsDocuments),
    termsAcceptances: new MemoryRepository(mockTermsAcceptances),
    fnolSubmissions: new MemoryRepository(mockFnolSubmissions),
    adjudicationRules: new MemoryRepository(mockAdjudicationRules),
    adjudicationDecisions: new MemoryRepository(mockAdjudicationDecisions),
    riskFactors: new MemoryRepository(mockRiskFactors),
    affordabilityBands: new MemoryRepository(mockAffordabilityBands),
    competitorBenchmarks: new MemoryRepository(mockCompetitorBenchmarks),
    microProducts: new MemoryRepository(mockMicroProducts),
    mobileMoneyProviders: new MemoryRepository(mockMobileMoneyProviders),
    microPolicies: new MemoryRepository(mockMicroPolicies),
    microPayments: new MemoryRepository(mockMicroPayments),
    kpiSnapshots: new MemoryRepository(mockKpiSnapshots),
    ocrExtractions: new MemoryRepository(mockOcrExtractions),
    scenePhotos: new MemoryRepository(mockScenePhotos),
    marketingContent: new MemoryRepository(mockMarketingContent)
  };
}
