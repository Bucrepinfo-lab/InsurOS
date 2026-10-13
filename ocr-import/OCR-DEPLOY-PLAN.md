# 🔒 LOCKED — OCR note-import: apply at each project's DigitalOcean deployment

Decision (2026-07-14): the photo/file OCR import tools are prepared and dropped into
every project under `ocr-import/`, but are **applied as a deployment-time step** —
executed when that project is deployed to DigitalOcean, not before.

## Production note (must be honoured in every project)
> In production the photo/file OCR should upload to DigitalOcean Spaces with a
> server-side OCR / text-extraction step. The client gracefully falls back to
> manual typing when offline, so a user is never blocked.

## Per-project deployment step (add to each project's PRE-DEPLOY checklist)
When deploying a project, before go-live:
1. Move `ocr-import/intake.ts` into the project's shared/core/lib package.
2. Render `NotesImport` in the relevant capture form; map `parseImportedNotes`
   output to the project's fields (domain mapping below); restyle to its design system.
3. Mobile (if any): add `expo-image-picker`, `expo-document-picker`; use `NotesImport.native.tsx`.
4. Add the DigitalOcean **Spaces upload + server OCR** step; keep the manual-typing fallback.
5. Add the production note above to the project's README/PRD.
6. Reuse Stawi's per-country phone limits (`PHONE_RULES`) on any phone inputs.
7. Verify on the project's own toolchain (typecheck/build/tests), commit, push.

## Projects, code locations & domain field mapping
| Project | Code location (Desktop) | Kit dropped at | Domain mapping for `onApply` |
|---|---|---|---|
| InsurOS | `Insurance/InsurOS` (pnpm monorepo) | `Insurance/InsurOS/ocr-import` | claim/policy docs → names, dates, amounts, policy no. |
| HarvestHub | `Mvendoh` (turbo monorepo) | `Mvendoh/ocr-import` | produce/delivery notes → item, quantity, price, date |
| Telpen | `A project/telpen-edu` (Next.js) | `A project/telpen-edu/ocr-import` | class registers/notes → attendance, topics, marks |
| SellFindConnect | `Adverts` (confirm app subfolder) | `Adverts/ocr-import` | listings/receipts → item, price, seller, contact |

## Status
- ✅ Tools staged in all four repos (`ocr-import/`), non-destructive.
- ✅ Production note carried into each `ocr-import/OCR-IMPORT.md`.
- 🔒 Wiring + lock deferred to each project's DO deployment (this plan).
- Stawi (5th project) already has the tools fully wired + locked (v1.9).

Note: full wiring + a real git "lock" needs a clean git environment per project
(own Cowork session or a GitHub connector) — this shared Desktop mount can't commit.
