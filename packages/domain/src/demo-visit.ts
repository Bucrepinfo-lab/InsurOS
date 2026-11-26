/**
 * "Look around the demo" (owner 26/11/26): anyone can open a view-only visit
 * to the isolated demo tenant (sample data only) without an account, so
 * testers and prospects see inside InsurOS. No phone, no PIN, no code.
 *
 * - The visit's identity is a fixed sentinel that is not a phone number, so no
 *   real person's number can ever match it.
 * - Permissions are View only: a visitor can never create, change, approve or
 *   pay anything, and sees no identity/platform administration.
 * - Switched off with DEMO_VISITS=off.
 */
export const DEMO_VISITOR_USER_ID = "demo-visitor";
export const DEMO_VISITOR_PHONE = "demo-visitor";

export const DEMO_VISITOR_PERMISSIONS: readonly string[] = [
  "Claims:View",
  "Policies:View",
  "Customers:View",
  "Marketplace:View",
  "Finance:View",
  "Operations:View"
];

type Env = Record<string, string | undefined>;
const runtimeEnv = (): Env => (globalThis as { process?: { env?: Env } }).process?.env ?? {};

export function demoVisitsEnabled(env: Env = runtimeEnv()): boolean {
  return (env.DEMO_VISITS ?? "on").trim().toLowerCase() !== "off";
}

export function isDemoVisitor(phone: string | null | undefined, env: Env = runtimeEnv()): boolean {
  return demoVisitsEnabled(env) && phone === DEMO_VISITOR_PHONE;
}
