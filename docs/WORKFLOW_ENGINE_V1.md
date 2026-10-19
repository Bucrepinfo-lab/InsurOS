# Workflow Engine v1

The workflow engine is a shared platform capability embedded into every business workspace (claims, policies, finance, marketplace, customers, identity).

Core pieces, all in `packages/domain` + `packages/services`: workflow types and statuses, state machines with validated transitions (`workflow-state-machine`), rules and policies evaluated before transitions (`workflow-rule`, `workflow-policy`), an authorization gate (`workflow-authorization`), and the engine (`workflow-engine`) that executes transitions and emits platform events.

Principles: one business object = one workspace; workflow is an embedded capability, not a standalone module; every transition is validated, authorized, and auditable. Extension points for v2: per-jurisdiction workflow rules bound to the governance hierarchy, and persistence-backed workflow instances once the PostgreSQL adapter lands.
