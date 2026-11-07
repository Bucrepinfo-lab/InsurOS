import { NextResponse, type NextRequest } from "next/server";
import { supabaseEnabled } from "./lib/supabase-enabled";
import { updateSupabaseSession } from "./lib/supabase/middleware";

const PROTECTED_PREFIXES = ["/dashboard", "/access-pending", "/account"];

/**
 * Session refresh + coarse route guard. Fine-grained, per-role authorization is
 * enforced server-side in layouts, server actions and route handlers.
 *
 * Production without Supabase settings FAILS CLOSED: protected routes answer 503.
 * Open dev mode (no Supabase) exists only outside production.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!supabaseEnabled) {
    if (process.env.NODE_ENV === "production" && isProtected) {
      return new NextResponse("Sign-in is not configured on this server.", { status: 503 });
    }
    return NextResponse.next();
  }

  const { response, user } = await updateSupabaseSession(request);

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"]
};
