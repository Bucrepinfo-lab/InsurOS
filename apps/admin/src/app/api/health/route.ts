import { NextResponse } from "next/server";

// Public health endpoint for Fly's load-balancer check.
// Not protected by Clerk middleware (only /dashboard is protected).
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "insuros-admin",
    timestamp: new Date().toISOString(),
  });
}
