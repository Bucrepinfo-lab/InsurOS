-- InsurOS PostgreSQL schema (target: DigitalOcean Managed PostgreSQL 16+)
-- Mirrors the domain contracts in @insuros/domain. Drizzle table
-- definitions will be generated from this DDL when DATABASE_URL is
-- provisioned. Enums use text + CHECK to keep migrations simple.

CREATE TABLE admin_regions (
  id            text PRIMARY KEY,
  name          text NOT NULL,
  code          text NOT NULL UNIQUE,
  level         text NOT NULL CHECK (level IN ('Constituency','County','National','Continental','SuperAdmin')),
  parent_region_id text REFERENCES admin_regions(id),
  country_code  text,
  continent_code text NOT NULL,
  status        text NOT NULL CHECK (status IN ('Active','Suspended')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE admin_appointments (
  id            text PRIMARY KEY,
  user_id       text NOT NULL,
  user_name     text NOT NULL,
  email         text NOT NULL,
  region_id     text NOT NULL REFERENCES admin_regions(id),
  level         text NOT NULL,
  role_id       text NOT NULL,
  appointed_by  text NOT NULL,
  appointed_at  timestamptz NOT NULL,
  status        text NOT NULL CHECK (status IN ('Active','Pending','Revoked'))
);

CREATE TABLE jurisdiction_assignments (
  id            text PRIMARY KEY,
  user_id       text NOT NULL,
  user_name     text NOT NULL,
  role_id       text NOT NULL,
  region_id     text NOT NULL REFERENCES admin_regions(id),
  assigned_by   text NOT NULL,
  assigned_at   timestamptz NOT NULL,
  status        text NOT NULL CHECK (status IN ('Active','Suspended','Revoked'))
);

CREATE TABLE tax_jurisdictions (
  id             text PRIMARY KEY,
  country_code   text NOT NULL UNIQUE,
  country_name   text NOT NULL,
  continent_code text NOT NULL,
  currency       text NOT NULL,
  authority_name text NOT NULL,
  regulator_name text,
  portal_name    text NOT NULL,
  portal_url     text NOT NULL,
  filing_frequency text NOT NULL,
  components     jsonb NOT NULL,
  rates_verified_at timestamptz NOT NULL,
  notes          text
);

CREATE TABLE subnational_tax_rules (
  id            text PRIMARY KEY,
  country_code  text NOT NULL,
  region_code   text NOT NULL,
  region_name   text NOT NULL,
  name          text NOT NULL,
  kind          text NOT NULL,
  rate_percent  numeric(8,4),
  flat_amount   numeric(14,2),
  currency      text NOT NULL,
  base          text NOT NULL,
  applies_to    jsonb NOT NULL DEFAULT '[]',
  portal_name   text NOT NULL,
  portal_url    text NOT NULL,
  rates_verified_at timestamptz NOT NULL,
  notes         text
);

CREATE TABLE tax_remittances (
  id            text PRIMARY KEY,
  jurisdiction_id text NOT NULL REFERENCES tax_jurisdictions(id),
  country_code  text NOT NULL,
  period        text NOT NULL,
  insurance_line text NOT NULL,
  gross_premium numeric(16,2) NOT NULL,
  currency      text NOT NULL,
  lines         jsonb NOT NULL,
  total_due     numeric(16,2) NOT NULL,
  status        text NOT NULL CHECK (status IN ('Draft','Computed','Filed','Paid','Overdue')),
  due_date      timestamptz NOT NULL,
  payment_url   text NOT NULL,
  computed_at   timestamptz,
  filed_at      timestamptz,
  paid_at       timestamptz
);

CREATE TABLE sales_agents (
  id            text PRIMARY KEY,
  name          text NOT NULL,
  email         text NOT NULL,
  rank          text NOT NULL,
  region_id     text NOT NULL REFERENCES admin_regions(id),
  supervisor_id text REFERENCES sales_agents(id),
  status        text NOT NULL CHECK (status IN ('Active','Onboarding','Suspended')),
  joined_at     timestamptz NOT NULL
);

CREATE TABLE sales_assignments (
  id            text PRIMARY KEY,
  agent_id      text NOT NULL REFERENCES sales_agents(id),
  assigned_by   text NOT NULL REFERENCES sales_agents(id),
  region_id     text NOT NULL REFERENCES admin_regions(id),
  target_premium numeric(16,2) NOT NULL,
  currency      text NOT NULL,
  period        text NOT NULL,
  assigned_at   timestamptz NOT NULL,
  status        text NOT NULL CHECK (status IN ('Assigned','Accepted','Completed','Revoked')),
  notes         text
);

CREATE TABLE commission_schedules (
  id            text PRIMARY KEY,
  name          text NOT NULL,
  rank          text NOT NULL,
  insurance_line text NOT NULL,
  direct_rate_percent numeric(8,4) NOT NULL,
  override_rate_percent numeric(8,4) NOT NULL,
  effective_from timestamptz NOT NULL,
  status        text NOT NULL CHECK (status IN ('Active','Superseded'))
);

CREATE TABLE commission_accruals (
  id            text PRIMARY KEY,
  agent_id      text NOT NULL REFERENCES sales_agents(id),
  source_agent_id text NOT NULL REFERENCES sales_agents(id),
  schedule_id   text NOT NULL REFERENCES commission_schedules(id),
  kind          text NOT NULL CHECK (kind IN ('Direct','Override')),
  policy_reference text NOT NULL,
  insurance_line text NOT NULL,
  gross_premium numeric(16,2) NOT NULL,
  rate_percent  numeric(8,4) NOT NULL,
  amount        numeric(16,2) NOT NULL,
  currency      text NOT NULL,
  period        text NOT NULL,
  accrued_at    timestamptz NOT NULL,
  status        text NOT NULL CHECK (status IN ('Accrued','Approved','Paid','ClawedBack')),
  clawback_reason text
);

CREATE TABLE terms_documents (
  id            text PRIMARY KEY,
  version       text NOT NULL,
  title         text NOT NULL,
  audience      text NOT NULL,
  jurisdiction  text NOT NULL,
  effective_date timestamptz NOT NULL,
  status        text NOT NULL CHECK (status IN ('Draft','Active','Superseded')),
  sections      jsonb NOT NULL
);

CREATE TABLE terms_acceptances (
  id            text PRIMARY KEY,
  terms_id      text NOT NULL REFERENCES terms_documents(id),
  terms_version text NOT NULL,
  user_id       text NOT NULL,
  user_name     text NOT NULL,
  accepted_at   timestamptz NOT NULL,
  method        text NOT NULL CHECK (method IN ('ClickWrap','Signature','Imported')),
  ip_address    text
);

CREATE INDEX idx_regions_parent ON admin_regions(parent_region_id);
CREATE INDEX idx_jassign_user ON jurisdiction_assignments(user_id) WHERE status = 'Active';
CREATE INDEX idx_remit_country_period ON tax_remittances(country_code, period);
CREATE INDEX idx_agents_supervisor ON sales_agents(supervisor_id);
CREATE INDEX idx_accruals_agent_period ON commission_accruals(agent_id, period);
CREATE INDEX idx_acceptances_user ON terms_acceptances(user_id);
