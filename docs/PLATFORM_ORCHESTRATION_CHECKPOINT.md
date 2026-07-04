# InsurOS Platform Orchestration Checkpoint

## Purpose

This document records the current orchestration milestone for InsurOS after integrating the Workflow Engine across core business workspaces.

## Current Status

Workflow capabilities are integrated across:

- Claims
- Policies
- Finance
- Marketplace
- Customers
- Identity

## Architecture Direction

Workflow is a shared platform capability embedded into business workspaces.

### Principles

- One business object = one workspace
- Workflow = an embedded operational capability
- Avoid standalone workflow pages unless they are genuinely cross-domain

## Development Workflow

Every feature follows this sequence:

1. Domain model
2. Mock data
3. Service methods
4. UI integration
5. `pnpm validate`
6. `pnpm repo:health`
7. One logical commit
8. Push before proceeding

## External Integrations (Deferred)

The following remain intentionally deferred until the platform reaches feature completeness:

- Clerk production configuration
- Database persistence
- Object storage
- Email
- SMS
- Payment gateways
- Deployment secrets
- Monitoring and observability

## Completed Integrations

- ✅ Claims Workflow
- ✅ Policy Workflow Foundation
- ✅ Finance Workflow
- ✅ Marketplace Workflow
- ✅ Customer Lifecycle Workflow
- ✅ Identity Verification Workflow

## Next Phase

The next platform objectives are:

1. Complete Policy workspace workflow visibility.
2. Add workflow action previews to every business workspace.
3. Extend workflow rules for all business domains.
4. Introduce shared role and permission models.
5. Add audit and notification event hooks.
6. Prepare persistence adapters after platform stabilization.

---

**Checkpoint Status:** Platform orchestration successfully established across the primary business domains.
