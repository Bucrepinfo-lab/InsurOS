# ADR-004: Next.js App Router Workspaces

**Status:** Accepted

## Context
The admin control plane covers many business domains, each needing list/detail/sub-views.

## Decision
Next.js App Router with one workspace directory per business object under `apps/admin/src/app/dashboard/` (e.g. `claims/[claimId]/assessment`). Navigation is data-driven from `@insuros/ui` `navigation-config.ts`; every nav href must resolve to a real route.

## Alternatives
Pages router (rejected: legacy), standalone apps per domain (rejected: shared shell and RBAC).

## Consequences
Server components fetch via services by default; workspaces stay consistent (DomainModulePage + KPICard + DomainEntityList pattern).
