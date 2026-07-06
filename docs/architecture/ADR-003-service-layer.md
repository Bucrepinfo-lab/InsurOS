# ADR-003: Business-Facing Service Layer

**Status:** Accepted

## Context
UI pages need data access without knowing where data lives; storage will change (mock → PostgreSQL).

## Decision
`@insuros/services` exposes class-based services (e.g. `TaxRemittanceService`, `CommissionService`) that UI consumes exclusively. Services depend on persistence ports (`getPersistence()`, ADR-005), never on concrete storage or on UI.

## Alternatives
UI importing mocks directly (rejected: no seam for persistence), tRPC/REST API layer (deferred until a non-admin client exists).

## Consequences
Swapping storage backends touches zero business logic; services are the single place for business rules like rank-enforced assignment.
