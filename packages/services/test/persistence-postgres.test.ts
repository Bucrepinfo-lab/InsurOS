import { afterAll, describe, expect, it } from "vitest";
import { PostgresAuthStore, PostgresDatabase, createSqlClient, migrate, type SqlClient } from "../src";
import { deviceAuthContract } from "./device-auth-contract";
import { persistenceContract } from "./persistence-contract";

/**
 * DB-backed contract tests — run only when DATABASE_URL is set (CI provides a
 * throwaway Postgres service). Never point this at a shared/production DB.
 */
const url = process.env.DATABASE_URL;

describe.runIf(Boolean(url))("postgres adapter", () => {
  const sql: SqlClient = createSqlClient(url ?? "postgres://unused");
  const database = new PostgresDatabase(sql);

  afterAll(async () => {
    await sql.end({ timeout: 5 });
  });

  persistenceContract("postgres", (tenantId) => database.adapter(tenantId));
  deviceAuthContract("postgres store", () => new PostgresAuthStore(sql, () => database.ensureMigrated()));

  it("migrations are idempotent (v2 sign-in tables included)", async () => {
    await migrate(sql);
    expect(await migrate(sql)).toEqual([]);
  });

  it("the ledger table rejects DELETE and non-de-identifying UPDATE", async () => {
    await migrate(sql);
    await expect(sql`delete from payment_ledger_entries where false`).resolves.toBeDefined();
    const adapter = database.adapter(`t-guard-${Date.now()}`);
    await adapter.paymentLedger.append({ txnId: "guard-1", status: "REQUESTED", phone: "+254700000002", amount: 10, currency: "KES" });
    await expect(sql.begin(async (tx) => tx`delete from payment_ledger_entries where txn_id = 'guard-1'`)).rejects.toThrow(/append-only/);
    await expect(sql.begin(async (tx) => tx`update payment_ledger_entries set amount = 1 where txn_id = 'guard-1'`)).rejects.toThrow(/append-only/);
  });

  it("RLS hides rows when no tenant is set (non-superuser role)", async () => {
    await migrate(sql);
    const tenant = `t-rls-${Date.now()}`;
    await database.adapter(tenant).claims.insert({ id: `c-${tenant}` } as never);
    await sql.unsafe(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'insuros_rls_probe') THEN
          CREATE ROLE insuros_rls_probe NOLOGIN;
        END IF;
      END $$;
      GRANT SELECT ON insuros_documents TO insuros_rls_probe;`);
    const counts = await sql.begin(async (tx) => {
      await tx.unsafe("SET LOCAL ROLE insuros_rls_probe");
      const none = await tx<{ n: string }>`select count(*)::text as n from insuros_documents`;
      await tx`select set_config('app.current_tenant_id', ${tenant}, true)`;
      const own = await tx<{ n: string }>`select count(*)::text as n from insuros_documents`;
      return { none: Number(none[0].n), own: Number(own[0].n) };
    });
    expect(counts.none).toBe(0);
    expect(counts.own).toBeGreaterThan(0);
  });
});
