# InsurOS Platform Foundation

## Purpose

This document records the shared platform capabilities established for InsurOS and the standard implementation pattern every new platform capability should follow.

The goal is to prevent duplication across modules and ensure that future features are built consistently.

---

## Standard Capability Pattern

Every reusable platform capability should follow this sequence:

```text
Domain
  ↓
Mocks
  ↓
Services
  ↓
Admin UI
```

### 1. Domain

Shared types and contracts live in:

```text
packages/domain/src
```

### 2. Mocks

Development and demo data live in:

```text
packages/mocks/src
```

### 3. Services

Business-facing service access lives in:

```text
packages/services/src
```

### 4. Admin UI

Operational UI lives in:

```text
apps/admin/src/app/dashboard
```

---

## Completed Platform Capabilities

### Activity

Cross-module activity and timeline events.

Current layers:

- Domain
- Mocks
- Services
- Admin UI

### Notifications

Platform notifications, alerts, warnings, and operational messages.

Current layers:

- Domain
- Mocks
- Services
- Admin UI

### Comments

Cross-module collaboration notes and operational remarks.

Current layers:

- Domain
- Mocks
- Services
- Admin UI

### Attachments

Uploaded files, documents, evidence, policy schedules, and operational attachments.

Current layers:

- Domain
- Mocks
- Services
- Admin UI

### Audit Logs

Immutable compliance and traceability records.

Current layers:

- Domain
- Mocks
- Services
- Admin UI

### Workflow Operations

Operational workflows, task queues, approval queues, escalations, and workflow templates.

Current layers:

- Domain
- Mocks
- Services
- Admin UI

---

## Engineering Rules

1. Use shared packages before creating app-local logic.
2. UI should consume services, not mocks directly.
3. Domain types should be the source of truth for business contracts.
4. Barrel files should be replaced fully when updated.
5. Pages and service files should be replaced fully when corrupted or significantly changed.
6. Every capability should validate with `pnpm validate`.
7. Every commit should be focused and reversible.

---

## Future Platform Capabilities

Future cross-cutting capabilities may include:

- Permissions and capabilities
- Universal search
- Reporting widgets
- Document generation
- Messaging
- Webhooks
- Integrations
- Background jobs
- API adapters
