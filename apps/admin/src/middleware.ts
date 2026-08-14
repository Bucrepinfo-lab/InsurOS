import { NextResponse, type NextRequest } from "next/server";
import { supabaseEnabled } from "./lib/supabase-enabled";
import { updateSupabaseSession } from "./lib/supabase/middleware";

/**
 * Guards /dashboard behind a Supabase phone-OTP session when auth is enabled.
 * With no Supabase keys the app runs open (dev mode), matching prior behaviour.
 */
export async function middleware(request: NextRequest) {
  if (!supabaseEnabled) {
    return NextResponse.next();
  }

  const { response, user } = await updateSupabaseSession(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"]
};
