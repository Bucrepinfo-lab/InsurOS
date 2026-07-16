/**
 * Clerk is enabled only when a plausible publishable key is configured.
 * Without one, the app runs in open dev mode: no sign-in, a local dev
 * principal, and full dashboard access. Production must set real keys.
 */
export const clerkEnabled = /^pk_(test|live)_[A-Za-z0-9]{20,}/.test(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? ""
);
