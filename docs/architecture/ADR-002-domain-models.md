# ADR-002: Domain Package as Source of Truth

**Status:** Accepted

## Context
Business contracts (policies, claims, tax, governance, sales) are consumed by mocks, services, and UI; duplicated types drift.

## Decision
All business entities and pure domain logic live in `@insuros/domain`. Types-first: interfaces plus pure functions (e.g. `computeTaxLines`, `canAdminister`, `buildStatement`) with no I/O and no dependencies on other workspace packages.

## Alternatives
Types co-located with services (rejected: circular deps), schema-first codegen (deferred until API surface exists).

## Consequences
Domain logic is trivially testable and reusable; every capability starts by modelling here (Domain → Mocks → Services → UI).
