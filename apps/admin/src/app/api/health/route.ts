import { NextResponse } from "next/server";
import { persistenceKind } from "@insuros/services";
import { getAuthMode, missingAuthEnvNames } from "@/lib/auth/config";

// Public health endpoint for Fly's load-balancer check.
// Fails (503) when production is missing its sign-in settings, so a
// misconfigured deploy never goes live in open mode. Reports NAMES only.
export const dynamic = "force-dynamic";

export function GET() {
  const auth = getAuthMode();
  const healthy = auth !== "misconfigured";
  return NextResponse.json(
    {
      status: healthy ? "ok" : "misconfigured",
      service: "insuros-admin",
      auth,
      persistence: persistenceKind(),
      ...(healthy ? {} : { missing: missingAuthEnvNames() }),
      timestamp: new Date().toISOString()
    },
    { status: healthy ? 200 : 503 }
  );
}
