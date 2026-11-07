/**
 * PostgreSQL migrations — ADDITIVE ONLY (new tables / new nullable columns).
 * Never edit an applied migration; append a new one. Applied in order inside
 * one transaction under an advisory lock, tracked in insuros_schema_migrations.
 *
 * Tenancy (tenancy-guard): every tenant-owned table carries tenant_id, is
 * indexed on it, and has FORCE ROW LEVEL SECURITY keyed on the per-transaction
 * setting app.current_tenant_id. The adapter ALSO filters by tenant_id in
 * every query (two layers). No tenant set => no rows.
 */
export interface Migration {
  version: number;
  name: string;
  sql: string;
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: "documents_ledger_rls",
    sql: `
CREATE TABLE IF NOT EXISTS insuros_documents (
  tenant_id   text        NOT NULL,
  collection  text        NOT NULL,
  id          text        NOT NULL,
  seq         bigserial   NOT NULL,
  data        jsonb       NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, collection, id)
);
CREATE INDEX IF NOT EXISTS insuros_documents_tenant_collection_seq
  ON insuros_documents (tenant_id, collection, seq);

ALTER TABLE insuros_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE insuros_documents FORCE ROW LEVEL SECURITY;
CREATE POLICY insuros_documents_tenant_isolation ON insuros_documents
  USING (tenant_id = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));

CREATE TABLE IF NOT EXISTS payment_ledger_entries (
  seq              bigserial   PRIMARY KEY,
  tenant_id        text        NOT NULL,
  txn_id           text        NOT NULL,
  status           text        NOT NULL CHECK (status IN ('REQUESTED','PENDING','SUCCESS','FAILED')),
  provider_txn_id  text,
  phone            text        NOT NULL,
  amount           integer     NOT NULL CHECK (amount > 0),
  currency         text        NOT NULL,
  policy_reference text,
  raw              jsonb,
  recorded_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS payment_ledger_tenant_txn ON payment_ledger_entries (tenant_id, txn_id, seq);
CREATE INDEX IF NOT EXISTS payment_ledger_tenant_provider ON payment_ledger_entries (tenant_id, provider_txn_id);
CREATE INDEX IF NOT EXISTS payment_ledger_tenant_phone ON payment_ledger_entries (tenant_id, phone);

ALTER TABLE payment_ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_ledger_entries FORCE ROW LEVEL SECURITY;
CREATE POLICY payment_ledger_tenant_isolation ON payment_ledger_entries
  USING (tenant_id = current_setting('app.current_tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));

-- Append-only: no DELETE/TRUNCATE ever; UPDATE only to de-identify the payer.
CREATE OR REPLACE FUNCTION insuros_payment_ledger_guard() RETURNS trigger
LANGUAGE plpgsql AS $guard$
BEGIN
  IF TG_OP = 'DELETE' OR TG_OP = 'TRUNCATE' THEN
    RAISE EXCEPTION 'payment_ledger_entries is append-only: % is not allowed', TG_OP;
  END IF;
  IF NEW.phone = 'redacted' AND NEW.raw IS NULL
     AND NEW.seq = OLD.seq AND NEW.tenant_id = OLD.tenant_id AND NEW.txn_id = OLD.txn_id
     AND NEW.status = OLD.status AND NEW.amount = OLD.amount AND NEW.currency = OLD.currency
     AND NEW.provider_txn_id IS NOT DISTINCT FROM OLD.provider_txn_id
     AND NEW.policy_reference IS NOT DISTINCT FROM OLD.policy_reference
     AND NEW.recorded_at = OLD.recorded_at THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'payment_ledger_entries is append-only: only payer de-identification is allowed';
END
$guard$;

CREATE TRIGGER payment_ledger_no_delete_or_edit
  BEFORE UPDATE OR DELETE ON payment_ledger_entries
  FOR EACH ROW EXECUTE FUNCTION insuros_payment_ledger_guard();
CREATE TRIGGER payment_ledger_no_truncate
  BEFORE TRUNCATE ON payment_ledger_entries
  FOR EACH STATEMENT EXECUTE FUNCTION insuros_payment_ledger_guard();

-- Platform metadata (not tenant data): which datasets were seeded per tenant.
CREATE TABLE IF NOT EXISTS insuros_tenant_seeds (
  tenant_id  text        NOT NULL,
  dataset    text        NOT NULL,
  seeded_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, dataset)
);
`
  }
];
