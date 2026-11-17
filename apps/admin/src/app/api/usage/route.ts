import { NextResponse } from "next/server";
import { USAGE_KINDS, type UsageKind } from "@insuros/domain";
import { UsageInsightService } from "@insuros/services";
import { authorizeRequest } from "@/lib/auth/session";

/**
 * Count one section view, section search or banner click for the signed-in
 * person's organisation. Counts only: the service turns the value into a
 * fixed key (a section, a banner action, or a short phrase with no digits) and
 * ignores everything else. Nothing about the person is stored.
 */
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Same-site requests only (browsers send this header; a cross-site form cannot fake it).
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const auth = await authorizeRequest(null);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = (await req.json().catch(() => null)) as { kind?: unknown; value?: unknown } | null;
  const kind = USAGE_KINDS.find((candidate) => candidate === body?.kind) as UsageKind | undefined;
  if (!kind) {
    return NextResponse.json({ error: "kind required" }, { status: 400 });
  }

  const counted = await new UsageInsightService().record(kind, body?.value).catch(() => false);
  return NextResponse.json({ counted });
}
