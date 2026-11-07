import { randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { TRUSTED_DEVICE_TTL_MS, APP_SESSION_TTL_MS } from "@insuros/domain";
import { DeviceAuthService, getAuthStore } from "@insuros/services";
import { isProductionRuntime } from "./config";

/**
 * Cookie + secret glue for the phone / SMS code / PIN sign-in.
 * Env (names only): AUTH_SECRET (≥32 chars; required in production).
 */
export const DEVICE_COOKIE = "insuros_device";
export const SESSION_COOKIE = "insuros_session";

const DEV_SECRET_KEY = Symbol.for("insuros.devAuthSecret");

function authSecret(): string {
  const configured = process.env.AUTH_SECRET ?? "";
  if (configured.length >= 32) return configured;
  if (isProductionRuntime) throw new Error("AUTH_SECRET is not configured");
  // Local development only: a per-process random secret.
  const holder = globalThis as { [DEV_SECRET_KEY]?: string };
  holder[DEV_SECRET_KEY] ??= randomBytes(32).toString("hex");
  return holder[DEV_SECRET_KEY]!;
}

export function getDeviceAuth(): DeviceAuthService {
  return new DeviceAuthService(getAuthStore(), { secret: authSecret() });
}

const baseCookie = {
  httpOnly: true,
  secure: isProductionRuntime,
  sameSite: "lax" as const,
  path: "/"
};

export async function setDeviceCookie(token: string) {
  (await cookies()).set(DEVICE_COOKIE, token, { ...baseCookie, maxAge: Math.floor(TRUSTED_DEVICE_TTL_MS / 1000) });
}

export async function setSessionCookie(token: string) {
  (await cookies()).set(SESSION_COOKIE, token, { ...baseCookie, maxAge: Math.floor(APP_SESSION_TTL_MS / 1000) });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function clearDeviceCookie() {
  (await cookies()).delete(DEVICE_COOKIE);
}

export async function readAuthCookies() {
  const jar = await cookies();
  return { device: jar.get(DEVICE_COOKIE)?.value, session: jar.get(SESSION_COOKIE)?.value };
}

/** Client IP for per-IP rate limits (Fly sets Fly-Client-IP). */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("fly-client-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

/** Short device label from the user agent (shown when revoking devices). */
export async function deviceLabel(): Promise<string> {
  const ua = (await headers()).get("user-agent") ?? "";
  const os = /Android/i.test(ua) ? "Android" : /iPhone|iPad/i.test(ua) ? "iOS" : /Windows/i.test(ua) ? "Windows" : /Mac OS/i.test(ua) ? "macOS" : /Linux/i.test(ua) ? "Linux" : "Device";
  const app = /wv\)|; wv/i.test(ua) ? "app" : "browser";
  return `${os} ${app}`;
}
