# Google Play listing — InsurOS (v1, staff/agency operations tool)

Prepared 07/11/26, updated 24/11/26 (owner: business tool, payments off for the first release; app created in Play Console 24/11/26). Goal: closed testing from ~05/01/27, production ~30/01/27.
Everything below matches the code on `main` as of this date. Items marked
**OWNER** need a decision or a value only the owner has.

## App identity

| Field | Value |
|---|---|
| App name | **InsurOS** |
| Package name | **`com.telpen.insuros`** (TWA of the web app; set `ANDROID_PACKAGE_NAME` only if you change it) |
| Developer | Telpen Systems Ltd |
| Contact email | telpeninfo@gmail.com |
| Category | **Business** |
| Tags | Business, Productivity |
| Contains ads | **No** |
| In-app purchases | **No** |
| Target audience | **18+ only** (workplace tool; not designed for children) |
| Start URL in the TWA | `https://getinsuros.com/?source=twa` |

The custom domain getinsuros.com is attached and serves every URL below (checked 24/11/26).

## URLs (public, no sign-in)

- Privacy policy: `https://getinsuros.com/privacy`
- Terms: `https://getinsuros.com/terms`
- Delete account (Data safety "delete account URL"): `https://getinsuros.com/delete-account`
- In-app deletion (signed in): `/account/delete` (top bar → *Delete account*)
- Digital Asset Links: `https://getinsuros.com/.well-known/assetlinks.json` — set Fly secret `ANDROID_CERT_FINGERPRINTS` to BOTH SHA-256 fingerprints (Play App Signing key + upload key), comma-separated.

## Store listing text

**Short description (≤ 80 chars)**

> Insurance workspace for agencies: customers, policies, claims and renewals.

**Full description**

> InsurOS is the workspace for insurance agencies, insurers and their agents in Kenya.
>
> Staff sign in with their phone number and their own 4-digit PIN. The organisation's administrator gives each person access, and everyone sees only the work their role covers.
>
> • Customers and policies: keep every customer, policy, cover period and renewal date in one place.
> • Claims: register a claim notice, attach documents and photos from the scene, and follow it through review, decision and settlement. Decisions are made by people, and every step is recorded.
> • Renewals: see which policies are due soon, so no customer's cover lapses unnoticed.
> • Customer page: the agency can share a private link with a customer, who sees what they have insured, when cover ends, and can report a claim or message their agent.
> • Finance views: invoices, commissions and tax summaries for the finance team.
> • Role-based access, enforced on our servers. Administrators can sign a staff member out of every device at once.
> • Customer pages in English and Kiswahili.
>
> InsurOS does not sell insurance and takes no payments in the app.
>
> InsurOS is provided by Telpen Systems Ltd, Kenya. Privacy policy: https://getinsuros.com/privacy

**Graphics:** app icon = `apps/admin/public/icons/icon-512.png`. **OWNER/Chrome:** feature graphic (1024×500) and 2–8 phone screenshots (take them on the demo tenant via reviewer access, so no real customer data appears).

## Google Play payments rule (24/11/26)

Inside the Play app (TWA), My Cover Plus is never offered or sold: no price, no pay button, and `/api/my/plus` refuses with `not_in_app` (`packages/domain/src/play-app.ts`, cookie `insuros_play_app` set from the `android-app://` launch referrer). Kenya is not in Play's alternative-billing programmes. Premiums are a real-world financial service and are not affected, and they stay off anyway while `PAYMENTS_ENABLED` is unset.

## App access (reviewer instructions)

Set Fly secrets `PLAY_REVIEW_PHONE` and `PLAY_REVIEW_PIN` (exactly **4 digits**, not 1234). Then in Play Console → App content → App access → "All or some functionality is restricted":

> 1. Open the app and tap **Sign in with your phone**.
> 2. Enter phone number `<PLAY_REVIEW_PHONE>` and PIN `<PLAY_REVIEW_PIN>`, then tap **Sign in**. No SMS or one-time code is used.
> You are signed in to a demo organisation with sample data only.

(**OWNER** fills the two placeholders in Play Console only — never in the repo.)

## Data safety form (answers matching the code)

- **Does your app collect or share any of the required user data types?** Yes.
- **Is all data encrypted in transit?** Yes (HTTPS only).
- **Do you provide a way for users to request deletion?** Yes — in-app and at the delete-account URL.
- **Shared with third parties?** No. (Supabase, Africa's Talking, Fly.io and — only if switched on — Anthropic act as service providers/processors, which Play does not count as "sharing".)

| Data type | Collected | Optional? | Purposes | Notes |
|---|---|---|---|---|
| Personal info → **Name** | Yes | Required | App functionality, Account management | Staff name set by the administrator |
| Personal info → **Phone number** | Yes | Required | App functionality, Account management, Fraud prevention/security | Sign-in identity with the person's own 4-digit PIN (stored only as a salted, peppered hash); no SMS |
| Personal info → **Other info** | Yes | Required | App functionality | Role and assigned region |
| **Photos** | Yes | Optional | App functionality | Claim scene evidence attached by staff |
| Location → **Precise location** | Yes | Optional | App functionality | Only the GPS stamp on claim evidence photos; never in the background |
| App activity → **Other user-generated content** | Yes | Required | App functionality | Policy/claim/customer records staff enter for their organisation |
| App activity → **Other actions** | Yes | Required | App functionality, Security | Audit trail of who did what |
| Financial info | **No** | — | — | Payments are switched off in v1 (`PAYMENTS_ENABLED` unset) |
| **Device or other IDs** | Yes | Required | App functionality, Fraud prevention/security | Random device identifier set by the app at sign-in (revocable). No advertising ID, no hardware IDs, no analytics SDK |

Data is processed ephemerally? **No** (stored). Collection is not used for advertising or analytics.

## Financial features declaration

v1 offers **no consumer financial features**: no payments, no premium collection, no loans, no claim payouts, no selling or binding of insurance to the public (all disabled server-side; see `PAYMENTS_ENABLED`). Recommended answer: **"My app doesn't provide any financial features"**.
**OWNER:** if the form's list includes an insurance option and you judge that a B2B operations tool for licensed insurers/agencies falls under it, select it instead and be ready to show the insurer/intermediary licences of the organisations using the app. Re-declare before turning `PAYMENTS_ENABLED` on after production.

## Other App content answers

- Ads: No. · Government app: No. · News app: No. · Health: No. · COVID-19: No.
- Content rating questionnaire: category **Utility, Productivity, Communication or Other**; no violence, sexual content, gambling or user-to-user public sharing → expected rating Everyone/3+, while the **target audience** is still set to 18+.
- Account creation: accounts are created by the organisation's administrator (phone allowlist); in-app deletion available.

## Server checklist before the first build (**OWNER**)

Fly app `insuros` secrets (names only): `AUTH_SECRET`, `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PLATFORM_OWNER_PHONES`, `PLAY_REVIEW_PHONE`, `PLAY_REVIEW_PIN`, `ANDROID_CERT_FINGERPRINTS`. Leave `PAYMENTS_ENABLED` unset.
Supabase: the Send-SMS hook is **off** (owner 20/11/26: no SMS); sign-in is phone + PIN with joining codes from admins. Email sign-in is not used.
GitHub repo secrets for the deploy workflow: `FLY_API_TOKEN`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
Then confirm `https://getinsuros.com/api/health` returns `"status":"ok"` with `"persistence":"postgres"`.
