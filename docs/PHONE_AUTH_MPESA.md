# InsurOS — Phone-OTP Login + M-Pesa Premiums

Clerk was replaced with **Supabase phone-OTP** in `apps/admin`, and **Africa's
Talking** now delivers OTP SMS and M-Pesa premium payments. The phone you sign in
with is also your M-Pesa number. Consistent with the app's design, auth is
feature-flagged: with no Supabase keys the admin runs in open dev mode (local
principal, full access) exactly as before.

## Auth (apps/admin)

- `lib/supabase-enabled.ts` — `supabaseEnabled` (URL + anon key present), replacing
  `clerk-enabled`.
- `lib/supabase/{server,client,middleware}.ts` — SSR clients (Next 16 async cookies).
- `middleware.ts` — guards `/dashboard` behind a Supabase session when enabled.
- `app/sign-in` — phone → SMS OTP screen (`components/phone-auth.tsx`).
- `app/dashboard/layout.tsx` — resolves the principal from the Supabase user
  (email, or a synthetic `<phone>@phone.insuros` for phone-only users) via the
  existing `PrincipalService.resolveByEmail`; dev fallback unchanged.
- `app/api/auth/send-sms` — Supabase Send-SMS hook → Africa's Talking (HMAC-verified).
- `ClerkProvider` removed from the root layout; `@clerk/nextjs` dropped for
  `@supabase/ssr` + `@supabase/supabase-js`.

> The `identity/clerk-sync` page + `PrincipalService.getClerkSyncPlan()` remain as a
> jurisdiction→org-role mapping *view* (mock data, no `@clerk` import). Rename later
> if you adopt Supabase org/roles.

## M-Pesa premiums (apps/admin)

- `lib/africastalking/payments.ts` — AT Payments provider (STK `mobileCheckout`).
- `lib/payments.ts` — `requestPremiumCheckout` (STK to the signed-in policyholder's
  phone) + `reconcile`, over an in-memory ledger (the app's mock-persistence ethos;
  swap the Map for a table when PostgreSQL lands). Money-block held.
- `app/api/payments/checkout` — session-authorised STK push.
- `app/api/payments/at/callback?token=<AT_PAYMENTS_CALLBACK_SECRET>` — token-verified
  reconciliation.

Pure helpers `toE164` + payment FSM/amount/status live in `@insuros/domain`.

## Env

```
NEXT_PUBLIC_SUPABASE_URL=...        # blank = open dev mode
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SEND_SMS_HOOK_SECRET=...
AT_USERNAME=sandbox                 # or your AT username
AT_API_KEY=...
AT_PAYMENTS_PRODUCT_NAME=...
AT_PAYMENTS_CALLBACK_SECRET=...
```

## Validate

```
pnpm -r typecheck && pnpm -r build   # domain/services typecheck + admin next build
```

The M-Pesa flow rings a real phone once the Africa's Talking account is live
(sandbox uses the AT simulator).
