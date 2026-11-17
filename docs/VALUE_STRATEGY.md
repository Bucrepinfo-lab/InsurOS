# InsurOS value strategy — sell the value, not the app

**Written:** 17/11/26 · **Owner brief:** 17/11/26 · **Supersedes the copy guidance in** `docs/MARKET_GAPS.md` (the research there stays; the claims it led to are corrected here).

This is the single source for what InsurOS says about itself, in the app and in public. The copy lives in code at `packages/domain/src/value-story.ts`; tests in `packages/domain/test/value-story.test.ts` fail the build if the copy drifts from the rules below.

## 1. Who we are talking to

InsurOS v1 is a workspace for the people who run insurance: agencies, brokers, insurers' claims and finance desks. It does not sell cover to the public, it takes no payments, and every claim decision is made by a person. So the reader of every banner is a member of staff, and the promise is about their working day and what their customer experiences as a result.

## 2. What the research says hurts (pains, with sources)

| Pain | Evidence | Source |
|---|---|---|
| Claims are slow and silent | 532 complaints reached the regulator in July–September 2025; fewer than half were resolved in the quarter | [Capital Business, citing the IRA report](https://www.capitalfm.co.ke/business/2026/02/directline-trident-top-list-of-most-complained-about-insurers/) |
| Delay is the main complaint; decisions come without reasons | Over half of complaints are about delay; the draft claims guidelines ask for acknowledgement in 2 working days and written reasons for rejection | [Techweez](https://techweez.com/2025/10/28/insurance-claims-guidelines-kenya-2025/) |
| People do not trust insurance, so they do not buy it | Penetration is 2.4% of GDP in Kenya against 7.4% worldwide; bad claim experiences travel through families | [The Star, citing Allianz 2025](https://www.the-star.co.ke/business/commentary/2026-05-10-omoro-kenyas-insurance-industry-must-fix-its-trust-deficit-letters-monday-1) |
| Reporting is a scramble | Seven insurers faced fines for missing the filing deadline for the quarter ended March 2026 | [Business Daily](https://www.businessdailyafrica.com/bd/corporate/companies/seven-insurance-firms-face-ira-fines-for-reporting-breaches-5526076) |
| No single owner of a claim; fraud checks are late; data sits in silos | Operator-side accounts of claims handling in African markets | Curacel, "challenges in insurance claims" (industry blog) |
| Existing agency software is hard to use | Review themes for a leading agency system: too many clicks, hard to find information, dated, slow, costly | Capterra reviews (themes only; no figures quoted) |

Only the first four rows are quoted in public (`/why`), each with its link. The last two shape the product and are not cited as figures.

## 3. The earlier points, reconciled

`docs/MARKET_GAPS.md` listed twelve gap → solution rows. Checked against what the workspace does today:

| # | Earlier claim | Verdict | What we say now |
|---|---|---|---|
| 1 | Claims auto-approved, paid in hours | **Not true today**: auto-approval and payout are switched off | Every claim has a status and a named owner; a person decides, with reasons |
| 2 | Explainable fraud signals at intake | True | Kept: plain signals, reason beside the score |
| 3 | Micro covers sold by USSD and paid by mobile money | **Not true today**: no USSD, payments off | Small covers are designed here, ready for a licensed insurer to offer |
| 4 | Index covers pay automatically | **Not true today** | Index covers are defined by a measured trigger; no payout promise |
| 5 | Pricing below the market | Partly: the engine shows its lines and a floor | We promise an open price, never "cheapest" |
| 6 | Ratios on one page | True | Kept |
| 7 | Commission statements with clawbacks | True | Kept |
| 8 | Per-country levies with authority portals | True as a guide | Kept, with "confirm with the authority before you file" |
| 9 | Region-scoped roles | True | Kept; strengthened by phone sign-in and device sign-out |
| 10 | One system instead of many | True | The headline: one workspace |
| 11 | Reporting as a query | Partly: search, filter, export on every list | Said as "searched, filtered and exported" |
| 12 | Catastrophe exposure | Roadmap | Not mentioned |

Reconciled into eight value pillars, which the twenty section stories hang from:

1. **One workspace** — customers, policies, claims and money together.
2. **A claim always has an owner and a status** — the answer to delay and silence.
3. **Reasons in writing** — risk signals, evidence grades, prices and commissions show their working.
4. **The book belongs to the organisation** — customers and policies outlive any one agent.
5. **Each person sees only their own work** — own phone, own role, own region.
6. **Figures ready before the deadline** — ratios, levies, reconciliation, export.
7. **Cover that fits irregular income** — small covers designed with grace rules.
8. **Proof on record** — who did what and when.

## 4. Why a team should move to InsurOS

- Their customer stops hearing silence: any member of staff can say where a claim is and who holds it.
- Their client book stays when an agent leaves.
- Month-end and the regulator's return stop being a week of matching spreadsheets.
- New staff find things: one search, grouped sections, the same layout everywhere.
- It runs in a browser or on a phone, with sign-in by the person's own number.

## 5. Rules for every line of copy

1. Pain first, in the words of the people living it. Then what this section does about it today. Then one thing to do now. Then where to go next.
2. Promise only what is delivered. Banned in copy (enforced by test): payment speed, "instant", automatic approval or payment, USSD codes, guarantees, "cheapest", reading uploaded files, exclamation marks.
3. Every public figure carries its source link.
4. Plain words, sentence case, short sentences.
5. Each story links to two other sections, so the workspace reads as one flow: customer → policy → claim → evidence → decision → money → proof.

## 6. How it shows up in the product

- **Value banner on every section** (`ValueBanner` in the dashboard shell): pain, answer, "Try it", two onward links, Share, Hide. One accent colour and line drawing per theme (see `docs/DESIGN_SYSTEM.md`). Folded state is remembered per person per section.
- **Home** shows real counts for the signed-in person's reach and "Where to go next" cards filtered by their role.
- **Public page `/why`**: the sourced facts and every public story, each with its own link (`/why#claims`), so a story can be shared on WhatsApp, by email or copied.
- **Navigation**: sections are grouped and collapsed, the open group is the one you are in, and the search box in the top bar jumps to any section.
- **No dead controls** (enforced by `packages/domain/test/no-dead-buttons.test.ts`): a button runs a handler or submits a form; a tab or call to action with nowhere to go is not drawn.

## 7. Audit findings the owner should know (17/11/26)

1. **Uploads and reading documents (OCR) do not exist yet.** There is no file picker anywhere in the web app. "Scan document" files a sample record. The `ocr-import/` kit is staged but not wired. The Documents page now says so plainly. Real upload needs a storage choice and a reader choice (owner decision; storage and persistence are protected areas). Options: (a) read on the device in the browser, nothing leaves the phone until the person confirms the fields, no per-page fee, weaker on handwriting; (b) a cloud reader, better accuracy, a fee per page and a data-processing agreement.
2. **Sample-row buttons.** Customers, policies and claims now have real forms (17/11/26). The remaining buttons that copy a sample row are in set-up and back-office areas (regions, appointments, benchmarks, tax rules, settings, flags, comments, attachments, scene capture, small-cover enrolment, subscribers); they work and are permission-checked, and each needs its own form in a later change.
3. **Detail pages show sample identifiers** (already logged 07/11/26).
4. **Sample messages live only in the store-review demo tenant.** The corrected CRM, engagement and newsletter copy is seeded into a new demo tenant; a demo tenant that was already seeded keeps the old rows until it is reseeded, which is a data change for the owner to approve. The live tenant has none of this sample content.
5. **Usage insight (most opened, most searched, most clicked)** is built as its own change because it adds a stored collection (`usage_counters`): Operations → What people use. It counts section opens, section searches (found and not found) and banner clicks per tenant per day. It stores no person and no record id, and search words containing digits are dropped so that no phone, policy or ID number is kept.
