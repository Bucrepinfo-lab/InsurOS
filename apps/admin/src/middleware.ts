import { NextResponse, type NextRequest } from "next/server";
import { supabaseEnabled } from "./lib/supabase-enabled";

const PROTECTED_PREFIXES = ["/dashboard", "/access-pending", "/account", "/set-pin"];
const SESSION_COOKIE = "insuros_session";

/**
 * Coarse route guard only. The real check — signed app session on a trusted,
 * unrevoked device bound to the same user, then role permissions — runs on the
 * server in layouts, server actions and route handlers (lib/auth/session.ts).
 *
 * Production without sign-in settings FAILS CLOSED: protected routes answer 503.
 * Open dev mode (no Supabase) exists only outside production.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) return NextResponse.next();

  if (!supabaseEnabled) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Sign-in is not configured on this server.", { status: 503 });
    }
    return NextResponse.next();
  }

  if (!request.cookies.get(SESSION_COOKIE)?.value) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"]
};
