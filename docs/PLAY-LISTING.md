# Google Play listing — InsurOS (v1, staff/agency operations tool)

Prepared 07/11/26. Goal: closed testing from ~05/01/27, production ~30/01/27.
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
| Start URL in the TWA | `https://insuros.fly.dev/?source=twa` |

Use the custom domain instead of `insuros.fly.dev` everywhere below if one is attached before submission (**OWNER**).

## URLs (public, no sign-in)

- Privacy policy: `https://insuros.fly.dev/privacy`
- Terms: `https://insuros.fly.dev/terms`
- Delete account (Data safety "delete account URL"): `https://insuros.fly.dev/delete-account`
- In-app deletion (signed in): `/account/delete` (top bar → *Delete account*)
- Digital Asset Links: `https://insuros.fly.dev/.well-known/assetlinks.json` — set Fly secret `ANDROID_CERT_FINGERPRINTS` to BOTH SHA-256 fingerprints (Play App Signing key + upload key), comma-separated.

## Store listing text

**Short description (≤ 80 chars)**

> Operations workspace for insurers, agencies and agents: policies and claims.

**Full description**

> InsurOS is the operations workspace for insurance companies, insurance agencies and their field agents in Kenya.
>
> It is a staff tool: your organisation's administrator gives you access to your phone number, and you see only the areas your role covers.
>
> • Claims desk — register claim notices, attach supporting documents and scene evidence, and route every claim to an adjuster. Claim decisions are made by people.
> • Policies and customers — keep policy and customer records for your organisation in one place.
> • Finance and tax views — invoices, reconciliation, commissions and statutory tax summaries for your finance team.
> • Role-based access — claims officers, underwriters, agents, finance and operations staff each see their own work; administrators keep the overall view. Access is enforced on our servers, not just hidden in menus.
> • Phone sign-in — sign in with your mobile number and a one-time SMS code.
>
> InsurOS does not sell insurance to the public and does not take payments in the app.
>
> InsurOS is provided by Telpen Systems Ltd, Kenya. Privacy policy: https://insuros.fly.dev/privacy

**Graphics:** app icon = `apps/admin/public/icons/icon-512.png`. **OWNER/Chrome:** feature graphic (1024×500) and 2–8 phone screenshots (take them on the demo tenant via reviewer access, so no real customer data appears).

## App access (reviewer instructions)

Set Fly secrets `PLAY_REVIEW_PHONE` and `PLAY_REVIEW_CODE` (6+ characters), plus `SUPABASE_SERVICE_ROLE_KEY`. Then in Play Console → App content → App access → "All or some functionality is restricted":

> 1. Open the app and tap **Sign in with your phone**.
> 2. Enter phone number: `<PLAY_REVIEW_PHONE>` and tap **Send code**.
> 3. Enter code: `<PLAY_REVIEW_CODE>` and tap **Verify**.
> You are signed in to a demo organisation with sample data. No SMS is needed.

(**OWNER** fills the two placeholders in Play Console only — never in the repo.)

## Data safety form (answers matching the code)

- **Does your app collect or share any of the required user data types?** Yes.
- **Is all data encrypted in transit?** Yes (HTTPS only).
- **Do you provide a way for users to request deletion?** Yes — in-app and at the delete-account URL.
- **Shared with third parties?** No. (Supabase, Africa's Talking, Fly.io and — only if switched on — Anthropic act as service providers/processors, which Play does not count as "sharing".)

| Data type | Collected | Optional? | Purposes | Notes |
|---|---|---|---|---|
| Personal info → **Name** | Yes | Required | App functionality, Account management | Staff name set by the administrator |
| Personal info → **Phone number** | Yes | Required | App functionality, Account management, Fraud prevention/security | Sign-in identity; SMS one-time code |
| Personal info → **Other info** | Yes | Required | App functionality | Role and assigned region |
| **Photos** | Yes | Optional | App functionality | Claim scene evidence attached by staff |
| Location → **Precise location** | Yes | Optional | App functionality | Only the GPS stamp on claim evidence photos; never in the background |
| App activity → **Other user-generated content** | Yes | Required | App functionality | Policy/claim/customer records staff enter for their organisation |
| App activity → **Other actions** | Yes | Required | App functionality, Security | Audit trail of who did what |
| Financial info | **No** | — | — | Payments are switched off in v1 (`PAYMENTS_ENABLED` unset) |
| Device or other IDs | **No** | — | — | No advertising ID, no analytics SDK |

Data is processed ephemerally? **No** (stored). Collection is not used for advertising or analytics.

## Financial features declaration

v1 offers **no consumer financial features**: no payments, no premium collection, no loans, no claim payouts, no selling or binding of insurance to the public (all disabled server-side; see `PAYMENTS_ENABLED`). Recommended answer: **"My app doesn't provide any financial features"**.
**OWNER:** if the form's list includes an insurance option and you judge that a B2B operations tool for licensed insurers/agencies falls under it, select it instead and be ready to show the insurer/intermediary licences of the organisations using the app. Re-declare before turning `PAYMENTS_ENABLED` on after production.

## Other App content answers

- Ads: No. · Government app: No. · News app: No. · Health: No. · COVID-19: No.
- Content rating questionnaire: category **Utility, Productivity, Communication or Other**; no violence, sexual content, gambling or user-to-user public sharing → expected rating Everyone/3+, while the **target audience** is still set to 18+.
- Account creation: accounts are created by the organisation's administrator (phone allowlist); in-app deletion available.

## Server checklist before the first build (**OWNER**)

Fly app `insuros` secrets (names only): `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SEND_SMS_HOOK_SECRET`, `AT_USERNAME`, `AT_API_KEY`, `AT_SENDER_ID`, `PLATFORM_OWNER_PHONES`, `PLAY_REVIEW_PHONE`, `PLAY_REVIEW_CODE`, `ANDROID_CERT_FINGERPRINTS`. Leave `PAYMENTS_ENABLED` unset.
GitHub repo secrets for the deploy workflow: `FLY_API_TOKEN`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
Then confirm `https://insuros.fly.dev/api/health` returns `"status":"ok"` with `"persistence":"postgres"`.
