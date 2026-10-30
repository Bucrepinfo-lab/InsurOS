# InsurOS — repo guide

Multi-tenant insurance operating system (pnpm workspaces): `apps/admin` (Next.js),
`packages/domain` (business types/rules), `packages/services` (services,
persistence), `packages/ui`, `packages/mocks`. Standards:
`docs/ENGINEERING_STANDARDS.md`. Session log: `MEMORY.md`.

## Owner standing rules
Read `docs/STANDING_RULES.md` first — it binds every contributor and agent:
live stays live (fix forward); fix once, fix everywhere (every country, county,
tenant and app); escalate, don't fix, in protected areas (premiums, payments,
commissions, claims settlement, tax, sign-in/roles/tenancy, approvals,
persistence, deploy config, secrets) or after three failed attempts; never weaken
a test; merge only green at the exact head SHA; no autonomous money movement or
claim payout.

## The gate (see the `insuros:ship-workflow` skill)
```
pnpm install
pnpm validate        # typecheck all packages + build admin (CI: .github/workflows/validate.yml)
```
Deploy: Fly app `insuros`; confirm `/api/health` → `{"status":"ok"}`.

## Skills
`.claude/skills/`: `ship-workflow`, `tenancy-guard`, `architecture-scaffold`,
`billing-and-payments`, `claims-management`, `insurance-compliance`,
`policy-administration`, `product-definition`, `underwriting-rules`.
UTF-8 + LF only. Commit/push only when asked.
