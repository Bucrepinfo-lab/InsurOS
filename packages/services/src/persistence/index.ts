import { DEFAULT_TENANT_ID } from "@insuros/domain";
import { DATASETS, REPOSITORY_KEYS, type AnyRepository } from "./datasets";
import { createMemoryAdapter } from "./memory-adapter";
import { PostgresDatabase, createSqlClient } from "./postgres-adapter";
import type { PaymentLedgerPort, PersistenceAdapter, PersistenceKind } from "./ports";
import { resolveTenantId } from "./tenant-context";
import { MemoryAuthStore, type AuthStore } from "../auth/store";
import { PostgresAuthStore } from "./postgres-auth-store";

export * from "./ports";
export { createMemoryAdapter, MemoryPaymentLedger, MemoryRepository } from "./memory-adapter";
export { PostgresDatabase, createSqlClient, migrate, seedTenant, type SqlClient } from "./postgres-adapter";
export { MIGRATIONS } from "./migrations";
export { PostgresAuthStore } from "./postgres-auth-store";
export { DATASETS, REPOSITORY_KEYS, type DatasetKind, type RepositoryKey } from "./datasets";
export { resolveTenantId, setTenantResolver, type TenantResolver } from "./tenant-context";

function env(): Record<string, string | undefined> {
  return (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
}

/** Backend selection: DATABASE_URL set -> PostgreSQL, otherwise in-memory mocks. */
export function persistenceKind(): PersistenceKind {
  return env().DATABASE_URL ? "postgres" : "memory";
}

interface Backend {
  kind: PersistenceKind;
  forTenant(tenantId: string): PersistenceAdapter;
  /** Platform-level sign-in store (PINs, trusted devices, rate limits). */
  authStore: AuthStore;
}

function createBackend(): Backend {
  const url = env().DATABASE_URL;
  if (url) {
    const database = new PostgresDatabase(createSqlClient(url));
    const adapters = new Map<string, PersistenceAdapter>();
    return {
      kind: "postgres",
      authStore: new PostgresAuthStore(database.sql, () => database.ensureMigrated()),
      forTenant(tenantId) {
        let adapter = adapters.get(tenantId);
        if (!adapter) {
          adapter = database.adapter(tenantId);
          adapters.set(tenantId, adapter);
        }
        return adapter;
      }
    };
  }

  const adapters = new Map<string, PersistenceAdapter>();
  return {
    kind: "memory",
    authStore: new MemoryAuthStore(),
    forTenant(tenantId) {
      let adapter = adapters.get(tenantId);
      if (!adapter) {
        adapter = createMemoryAdapter({ tenantId });
        adapters.set(tenantId, adapter);
      }
      return adapter;
    }
  };
}

/**
 * A tenant-routing adapter: every call resolves the request's tenant (from the
 * server session, via setTenantResolver) and delegates to that tenant's store.
 */
function createRoutingAdapter(backend: Backend): PersistenceAdapter {
  const pick = async () => backend.forTenant(await resolveTenantId());

  const repositories = Object.fromEntries(
    REPOSITORY_KEYS.map((key) => {
      const repository: AnyRepository = {
        findAll: async () => ((await pick())[key] as AnyRepository).findAll(),
        findById: async (id) => ((await pick())[key] as AnyRepository).findById(id),
        findWhere: async (predicate) => ((await pick())[key] as AnyRepository).findWhere(predicate),
        insert: async (entity) => ((await pick())[key] as AnyRepository).insert(entity),
        update: async (id, patch) => ((await pick())[key] as AnyRepository).update(id, patch)
      };
      return [key, repository];
    })
  ) as unknown as Omit<PersistenceAdapter, "kind" | "tenantId" | "paymentLedger">;

  const paymentLedger: PaymentLedgerPort = {
    append: async (entry) => (await pick()).paymentLedger.append(entry),
    history: async (txnId) => (await pick()).paymentLedger.history(txnId),
    latestByProviderTxnId: async (id) => (await pick()).paymentLedger.latestByProviderTxnId(id),
    deidentifyPhone: async (phone) => (await pick()).paymentLedger.deidentifyPhone(phone)
  };

  return { kind: backend.kind, tenantId: DEFAULT_TENANT_ID, ...repositories, paymentLedger };
}

const KEY = Symbol.for("insuros.persistence");
type Holder = { [KEY]?: { backend: Backend; adapter: PersistenceAdapter } };

/**
 * Persistence factory — the process-wide, tenant-routing adapter.
 * Services must obtain repositories here so backends can be swapped without
 * touching business logic. Kept on globalThis so every server bundle shares it.
 */
function holderState() {
  const holder = globalThis as Holder;
  if (!holder[KEY]) {
    const backend = createBackend();
    holder[KEY] = { backend, adapter: createRoutingAdapter(backend) };
  }
  return holder[KEY];
}

export function getPersistence(): PersistenceAdapter {
  return holderState().adapter;
}

/** Platform-level sign-in store (same database as getPersistence). */
export function getAuthStore(): AuthStore {
  return holderState().backend.authStore;
}

/** Test helper: drop the process-wide adapter (next call re-reads env). */
export function resetPersistenceForTests(): void {
  delete (globalThis as Holder)[KEY];
}

// Keep the dataset registry reachable for docs/tools without a second import path.
export const PERSISTED_COLLECTIONS = REPOSITORY_KEYS.map((key) => DATASETS[key].collection);
