# ADR-005: PostgreSQL on DigitalOcean via Drizzle, behind Ports

**Status:** Accepted (2026-07-06, platform owner decision)

## Context
The platform ran entirely on mock data; production needs durable, relational storage aligned with the DigitalOcean deployment target.

## Decision
PostgreSQL (DO Managed Database) accessed through Drizzle ORM. Services depend on repository ports (`packages/services/src/persistence/ports.ts`); the default backend is an in-memory adapter over mocks, switched by `DATABASE_URL`. DDL lives in `persistence/schema.sql`.

## Alternatives
MySQL (weaker JSON/enum fit), MongoDB (poor fit for ledger data), Prisma (codegen step, second schema language).

## Consequences
Backend swap requires no business-logic changes; migration path and provisioning steps are documented in `docs/PERSISTENCE.md`.
