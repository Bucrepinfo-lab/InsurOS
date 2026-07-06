# ADR-001: pnpm Monorepo

**Status:** Accepted

## Context
InsurOS spans an admin app and shared domain, data, service, and UI code that must evolve together with strict type safety.

## Decision
A single pnpm workspace: `apps/admin` + `packages/{domain,mocks,services,ui}`. Workspace protocol links packages; `pnpm validate` typechecks and builds everything.

## Alternatives
Polyrepo (rejected: cross-repo type drift), Nx/Turborepo (deferred: added tooling without present need).

## Consequences
Atomic cross-package changes and one CI pipeline; requires discipline about package boundaries (see ENGINEERING_STANDARDS.md).
