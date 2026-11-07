import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { ClaimService, CustomerService, PolicyService } from "@insuros/services";
import { currentReach } from "@/lib/record-scope";

export type GatedRecord = "claim" | "customer" | "policy";

/**
 * Server-side record gate for detail pages. The section's ScopeGate already
 * checked the area; this checks the RECORD: a user whose role reaches only
 * their own records (an Agent, a Claims Officer) gets a 404 for anything that
 * is not theirs, whatever URL they type. Tenant-wide roles pass through.
 */
export async function RecordGate({ kind, id, children }: { kind: GatedRecord; id: string; children: ReactNode }) {
  const area = kind === "claim" ? "Claims" : kind === "customer" ? "Customers" : "Policies";
  const reach = await currentReach(area);
  if (reach.kind === "all") return <>{children}</>;
  if (reach.kind === "none") notFound();

  const recordId = decodeURIComponent(id);
  const record =
    kind === "claim"
      ? await new ClaimService().getClaimFor(reach, recordId)
      : kind === "customer"
        ? await new CustomerService().getCustomerFor(reach, recordId)
        : await new PolicyService().getPolicyFor(reach, recordId);
  if (!record) notFound();
  return <>{children}</>;
}
