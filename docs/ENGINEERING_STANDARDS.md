# InsurOS Engineering Standards

## Core Principles

1. Audit before changing.
2. Make one focused change at a time.
3. Validate the affected package before validating the full app.
4. Commit only after build passes.
5. Prefer shared packages over app-local duplication.

## Package Responsibilities

### apps/admin
Presentation, routing, and user interaction only.

### packages/ui
Reusable UI primitives, layouts, navigation, and domain UI patterns.

### packages/domain
Shared business entities and domain types.

### packages/mocks
Development and demo data.

### packages/services
Business-facing service layer. UI should access data through services.

## Validation Order

When changing domain:

```bash
pnpm --filter @insuros/domain typecheck
pnpm --filter @insuros/mocks typecheck
pnpm --filter @insuros/services typecheck
pnpm --filter @insuros/admin build