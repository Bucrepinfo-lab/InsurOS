/**
 * Google Play payments policy — PURE. Inside the Play app (the Android TWA),
 * InsurOS does not sell its own digital service: My Cover Plus cannot be bought
 * there, because Kenya is not in Play's alternative-billing programmes. It is
 * bought on the web only. Insurance premiums are a real-world financial service
 * and are not affected. Same rule as Telpen Edu and HarvestHub ("fix once, fix
 * everywhere").
 *
 * Signal: the TWA's launch request carries `Referer: android-app://com.telpen.insuros`;
 * the middleware turns that into a session cookie so later requests know too.
 */
export const PLAY_APP_COOKIE = "insuros_play_app";
export const PLAY_APP_REFERRER_PREFIX = "android-app://";

export function isPlayAppSignal(s: { cookie?: string | null; referrer?: string | null }): boolean {
  if (s.cookie === "1") return true;
  return (s.referrer ?? "").startsWith(PLAY_APP_REFERRER_PREFIX);
}

/** True when the middleware should remember this browser session as the Play app. */
export function shouldMarkPlayApp(referrer: string | null | undefined, cookie: string | null | undefined): boolean {
  return cookie !== "1" && (referrer ?? "").startsWith(PLAY_APP_REFERRER_PREFIX);
}

/** InsurOS's own digital purchases (My Cover Plus) are allowed only outside the Play app. */
export function digitalPurchasesAllowed(s: { cookie?: string | null; referrer?: string | null }): boolean {
  return !isPlayAppSignal(s);
}
