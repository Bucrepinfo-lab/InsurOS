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
