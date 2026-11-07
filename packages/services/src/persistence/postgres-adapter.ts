import postgres from "postgres";
import {
  REDACTED_PHONE,
  type NewPaymentLedgerEntry,
  type PaymentLedgerEntry,
  type PaymentStatus
} from "@insuros/domain";
import { DATASETS, REPOSITORY_KEYS, cloneRows, seedsInto, type AnyRepository } from "./datasets";
import { MIGRATIONS } from "./migrations";
import type { PaymentLedgerPort, PersistenceAdapter, Repository } from "./ports";

/**
 * PostgreSQL adapter (postgres.js). Each repository is a collection in
 * `insuros_documents` (JSONB rows keyed by tenant + collection + id); the
 * payment ledger is its own append-only table. Every statement runs in a
 * transaction that sets app.current_tenant_id (RLS) AND filters tenant_id.
 *
 * findWhere loads the tenant's collection and filters in process — fine at v1
 * volumes; hot paths can get dedicated tables/indexes in later migrations.
 */

type Row = Record<string, unknown>;

/** The subset of postgres.js we use (keeps typing independent of its generics). */
export interface SqlClient {
  <T = Row>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T[]>;
  json(value: unknown): unknown;
  unsafe(query: string): Promise<unknown>;
  begin<T>(fn: (tx: SqlClient) => Promise<T>): Promise<T>;
  end(options?: { timeout?: number }): Promise<void>;
}

export function createSqlClient(databaseUrl: string): SqlClient {
  const client = postgres(databaseUrl, {
    max: Number(globalEnv().PG_POOL_MAX ?? 5),
    idle_timeout: 30,
    connect_timeout: 15,
    onnotice: () => undefined,
    prepare: false
  });
  return client as unknown as SqlClient;
}

function globalEnv(): Record<string, string | undefined> {
  return (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
}

/** Run fn in a transaction scoped to one tenant (RLS session setting). */
async function inTenant<T>(sql: SqlClient, tenantId: string, fn: (tx: SqlClient) => Promise<T>): Promise<T> {
  return sql.begin(async (tx) => {
    await tx`select set_config('app.current_tenant_id', ${tenantId}, true)`;
    return fn(tx);
  });
}

/** Apply pending migrations (idempotent, serialised by an advisory lock). */
export async function migrate(sql: SqlClient): Promise<number[]> {
  return sql.begin(async (tx) => {
    await tx`select pg_advisory_xact_lock(491170001)`;
    await tx.unsafe(
      "CREATE TABLE IF NOT EXISTS insuros_schema_migrations (version integer PRIMARY KEY, name text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())"
    );
    const done = await tx<{ version: number }>`select version from insuros_schema_migrations`;
    const applied = new Set(done.map((row) => Number(row.version)));
    const ran: number[] = [];
    for (const migration of MIGRATIONS) {
      if (applied.has(migration.version)) continue;
      await tx.unsafe(migration.sql);
      await tx`insert into insuros_schema_migrations (version, name) values (${migration.version}, ${migration.name})`;
      ran.push(migration.version);
    }
    return ran;
  });
}

/** Seed reference data (every tenant) and sample data (demo tenant only), once. */
export async function seedTenant(sql: SqlClient, tenantId: string): Promise<void> {
  await inTenant(sql, tenantId, async (tx) => {
    await tx`select pg_advisory_xact_lock(491170002, hashtext(${tenantId}))`;
    const seeded = await tx<{ dataset: string }>`select dataset from insuros_tenant_seeds where tenant_id = ${tenantId}`;
    const done = new Set(seeded.map((row) => row.dataset));
    for (const key of REPOSITORY_KEYS) {
      const dataset = DATASETS[key];
      if (done.has(dataset.collection) || !seedsInto(tenantId, dataset.kind)) continue;
      for (const row of cloneRows(dataset.rows())) {
        await tx`
          insert into insuros_documents (tenant_id, collection, id, data)
          values (${tenantId}, ${dataset.collection}, ${row.id}, ${tx.json(row)})
          on conflict do nothing`;
      }
      await tx`insert into insuros_tenant_seeds (tenant_id, dataset) values (${tenantId}, ${dataset.collection}) on conflict do nothing`;
    }
  });
}

class PostgresRepository<T extends { id: string }> implements Repository<T> {
  constructor(
    private readonly sql: SqlClient,
    private readonly ready: () => Promise<void>,
    private readonly tenantId: string,
    private readonly collection: string
  ) {}

  private async run<R>(fn: (tx: SqlClient) => Promise<R>): Promise<R> {
    await this.ready();
    return inTenant(this.sql, this.tenantId, fn);
  }

  async findAll(): Promise<T[]> {
    return this.run(async (tx) => {
      const rows = await tx<{ data: T }>`
        select data from insuros_documents
        where tenant_id = ${this.tenantId} and collection = ${this.collection}
        order by seq`;
      return rows.map((row) => row.data);
    });
  }

  async findById(id: string): Promise<T | undefined> {
    return this.run(async (tx) => {
      const rows = await tx<{ data: T }>`
        select data from insuros_documents
        where tenant_id = ${this.tenantId} and collection = ${this.collection} and id = ${id}`;
      return rows[0]?.data;
    });
  }

  async findWhere(predicate: (entity: T) => boolean): Promise<T[]> {
    return (await this.findAll()).filter(predicate);
  }

  async insert(entity: T): Promise<T> {
    return this.run(async (tx) => {
      await tx`
        insert into insuros_documents (tenant_id, collection, id, data)
        values (${this.tenantId}, ${this.collection}, ${entity.id}, ${tx.json(entity)})`;
      return entity;
    });
  }

  async update(id: string, patch: Partial<T>): Promise<T | undefined> {
    return this.run(async (tx) => {
      const rows = await tx<{ data: T }>`
        select data from insuros_documents
        where tenant_id = ${this.tenantId} and collection = ${this.collection} and id = ${id}
        for update`;
      if (!rows[0]) return undefined;
      // JSON drops undefined keys, so a patch of `field: undefined` erases it.
      const next = JSON.parse(JSON.stringify({ ...rows[0].data, ...patch, id })) as T;
      await tx`
        update insuros_documents set data = ${tx.json(next)}, updated_at = now()
        where tenant_id = ${this.tenantId} and collection = ${this.collection} and id = ${id}`;
      return next;
    });
  }
}

interface LedgerRow {
  seq: string | number;
  txn_id: string;
  status: PaymentStatus;
  provider_txn_id: string | null;
  phone: string;
  amount: number;
  currency: string;
  policy_reference: string | null;
  raw: unknown;
  recorded_at: Date | string;
}

function toEntry(row: LedgerRow): PaymentLedgerEntry {
  return {
    seq: Number(row.seq),
    txnId: row.txn_id,
    status: row.status,
    ...(row.provider_txn_id ? { providerTxnId: row.provider_txn_id } : {}),
    phone: row.phone,
    amount: Number(row.amount),
    currency: row.currency,
    ...(row.policy_reference ? { policyReference: row.policy_reference } : {}),
    ...(row.raw === null || row.raw === undefined ? {} : { raw: row.raw }),
    recordedAt: new Date(row.recorded_at).toISOString()
  };
}

class PostgresPaymentLedger implements PaymentLedgerPort {
  constructor(
    private readonly sql: SqlClient,
    private readonly ready: () => Promise<void>,
    private readonly tenantId: string
  ) {}

  private async run<R>(fn: (tx: SqlClient) => Promise<R>): Promise<R> {
    await this.ready();
    return inTenant(this.sql, this.tenantId, fn);
  }

  async append(entry: NewPaymentLedgerEntry): Promise<PaymentLedgerEntry> {
    return this.run(async (tx) => {
      const rows = await tx<LedgerRow>`
        insert into payment_ledger_entries
          (tenant_id, txn_id, status, provider_txn_id, phone, amount, currency, policy_reference, raw, recorded_at)
        values (
          ${this.tenantId}, ${entry.txnId}, ${entry.status}, ${entry.providerTxnId ?? null}, ${entry.phone},
          ${entry.amount}, ${entry.currency}, ${entry.policyReference ?? null},
          ${entry.raw === undefined ? null : tx.json(entry.raw)}, ${entry.recordedAt ?? new Date().toISOString()}
        )
        returning *`;
      return toEntry(rows[0]);
    });
  }

  async history(txnId: string): Promise<PaymentLedgerEntry[]> {
    return this.run(async (tx) => {
      const rows = await tx<LedgerRow>`
        select * from payment_ledger_entries
        where tenant_id = ${this.tenantId} and txn_id = ${txnId}
        order by seq`;
      return rows.map(toEntry);
    });
  }

  async latestByProviderTxnId(providerTxnId: string): Promise<PaymentLedgerEntry | undefined> {
    return this.run(async (tx) => {
      const rows = await tx<LedgerRow>`
        select l.* from payment_ledger_entries l
        where l.tenant_id = ${this.tenantId}
          and l.txn_id = (
            select txn_id from payment_ledger_entries
            where tenant_id = ${this.tenantId} and provider_txn_id = ${providerTxnId}
            order by seq desc limit 1)
        order by l.seq desc limit 1`;
      return rows[0] ? toEntry(rows[0]) : undefined;
    });
  }

  async deidentifyPhone(phone: string): Promise<number> {
    if (phone === REDACTED_PHONE) return 0;
    return this.run(async (tx) => {
      const rows = await tx<{ seq: string }>`
        update payment_ledger_entries set phone = ${REDACTED_PHONE}, raw = null
        where tenant_id = ${this.tenantId} and phone = ${phone}
        returning seq`;
      return rows.length;
    });
  }
}

/**
 * Shared, process-wide database state: one pool, migrations once, each tenant
 * seeded once. Adapters per tenant are cheap views over it.
 */
export class PostgresDatabase {
  private migrated?: Promise<unknown>;
  private readonly seeded = new Map<string, Promise<void>>();

  constructor(readonly sql: SqlClient) {}

  ready(tenantId: string): Promise<void> {
    if (!this.migrated) {
      this.migrated = migrate(this.sql).catch((error) => {
        this.migrated = undefined;
        throw error;
      });
    }
    let seed = this.seeded.get(tenantId);
    if (!seed) {
      seed = this.migrated.then(() => seedTenant(this.sql, tenantId));
      seed.catch(() => this.seeded.delete(tenantId));
      this.seeded.set(tenantId, seed);
    }
    return seed;
  }

  adapter(tenantId: string): PersistenceAdapter {
    const ready = () => this.ready(tenantId);
    const repositories = Object.fromEntries(
      REPOSITORY_KEYS.map((key) => [
        key,
        new PostgresRepository(this.sql, ready, tenantId, DATASETS[key].collection) as AnyRepository
      ])
    ) as unknown as Omit<PersistenceAdapter, "kind" | "tenantId" | "paymentLedger">;

    return {
      kind: "postgres",
      tenantId,
      ...repositories,
      paymentLedger: new PostgresPaymentLedger(this.sql, ready, tenantId)
    };
  }
}
