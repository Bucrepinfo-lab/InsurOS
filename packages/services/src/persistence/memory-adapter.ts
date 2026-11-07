import {
  DEFAULT_TENANT_ID,
  REDACTED_PHONE,
  type NewPaymentLedgerEntry,
  type PaymentLedgerEntry
} from "@insuros/domain";
import { DATASETS, REPOSITORY_KEYS, cloneRows, seedsInto, type AnyRepository } from "./datasets";
import type { PaymentLedgerPort, PersistenceAdapter, Repository } from "./ports";

/**
 * In-memory repository over an array. Default backend for development and
 * tests (no DATABASE_URL); mutations last for the process lifetime only.
 */
export class MemoryRepository<T extends { id: string }> implements Repository<T> {
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
    if (this.rows.some((row) => row.id === entity.id)) {
      throw new Error(`Duplicate id: ${entity.id}`);
    }
    this.rows.push(entity);
    return entity;
  }

  async update(id: string, patch: Partial<T>): Promise<T | undefined> {
    const row = this.rows.find((item) => item.id === id);

    if (!row) {
      return undefined;
    }

    Object.assign(row, patch);
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined) delete (row as Record<string, unknown>)[key];
    }
    return row;
  }
}

/** Append-only ledger in memory (same contract as the Postgres table). */
export class MemoryPaymentLedger implements PaymentLedgerPort {
  private readonly entries: PaymentLedgerEntry[] = [];
  private seq = 0;

  async append(entry: NewPaymentLedgerEntry): Promise<PaymentLedgerEntry> {
    const row: PaymentLedgerEntry = {
      ...entry,
      seq: ++this.seq,
      recordedAt: entry.recordedAt ?? new Date().toISOString()
    };
    this.entries.push(row);
    return { ...row };
  }

  async history(txnId: string): Promise<PaymentLedgerEntry[]> {
    return this.entries.filter((entry) => entry.txnId === txnId).map((entry) => ({ ...entry }));
  }

  async latestByProviderTxnId(providerTxnId: string): Promise<PaymentLedgerEntry | undefined> {
    const tagged = this.entries.filter((entry) => entry.providerTxnId === providerTxnId);
    if (tagged.length === 0) return undefined;
    const txnId = tagged[tagged.length - 1].txnId;
    const all = await this.history(txnId);
    return all[all.length - 1];
  }

  async deidentifyPhone(phone: string): Promise<number> {
    let changed = 0;
    for (const entry of this.entries) {
      if (entry.phone !== phone) continue;
      entry.phone = REDACTED_PHONE;
      delete entry.raw;
      changed += 1;
    }
    return changed;
  }
}

export interface MemoryAdapterOptions {
  tenantId?: string;
  /**
   * Share the live mock arrays (legacy dev behaviour, default for the default
   * tenant) or work on private copies (any other tenant, and tests).
   */
  shareMocks?: boolean;
}

export function createMemoryAdapter(options: MemoryAdapterOptions = {}): PersistenceAdapter {
  const tenantId = options.tenantId ?? DEFAULT_TENANT_ID;
  const shareMocks = options.shareMocks ?? tenantId === DEFAULT_TENANT_ID;

  const repositories = Object.fromEntries(
    REPOSITORY_KEYS.map((key) => {
      const dataset = DATASETS[key];
      // Dev default tenant keeps the full mock dataset (as before); other
      // tenants get reference data, plus sample data only for the demo tenant.
      const rows = shareMocks
        ? dataset.rows()
        : seedsInto(tenantId, dataset.kind)
          ? cloneRows(dataset.rows())
          : [];
      return [key, new MemoryRepository(rows) as AnyRepository];
    })
  ) as unknown as Omit<PersistenceAdapter, "kind" | "tenantId" | "paymentLedger">;

  return {
    kind: "memory",
    tenantId,
    ...repositories,
    paymentLedger: new MemoryPaymentLedger()
  };
}
