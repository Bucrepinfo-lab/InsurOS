# InsurOS Engineering Standards

## Core Principles

1. Audit before changing.
2. Make one focused change at a time.
3. Validate the affected package before validating the full app.
4. Commit only after build passes.
5. Prefer shared packages over app-local duplication.

## Delivery Loop (standing procedure, agreed 2026-07-06)

Every build session runs the full loop end to end — no handoff of manual steps:

1. **Build** following the capability pattern (Domain → Mocks → Services → Admin UI).
2. **Validate green**: run `pnpm validate` (all typechecks + full Next build) and confirm a clean exit before any commit. When working in a sandbox that cannot resolve platform-specific `node_modules`, perform a clean-room validation: copy the repo (excluding `node_modules`, `.git`, `.next`) to a native directory, `pnpm install`, then `pnpm validate`.
3. **Add** only intended files, staged by explicit path.
4. **Commit** one focused, reversible commit per capability.
5. **Push** to GitHub in the same session. If credentials are unavailabl