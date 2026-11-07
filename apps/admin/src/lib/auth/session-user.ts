import { cache } from "react";
import { getAuthMode } from "./config";
import { getDeviceAuth, readAuthCookies } from "./device-auth";

export interface SessionIdentity {
  /** Auth user id (Supabase user id, or "play-review"). */
  userId: string;
  phone: string;
  deviceId: string;
  via: "sms" | "pin";
}

/**
 * The verified identity for this request — ONLY from a signed app session
 * issued after an SMS code or PIN, on a still-trusted device bound to the same
 * user. A typed phone number, a forged/expired cookie or a revoked device
 * yields null.
 */
export const getSessionIdentity = cache(async (): Promise<SessionIdentity | null> => {
  if (getAuthMode() !== "supabase") return null;
  const { device, session } = await readAuthCookies();
  if (!session || !device) return null;
  const valid = await getDeviceAuth().validateSession(session, device);
  if (!valid) return null;
  return { userId: valid.uid, phone: valid.phone, deviceId: valid.did, via: valid.via };
});
