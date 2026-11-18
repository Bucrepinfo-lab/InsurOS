import { createHash } from "node:crypto";
import { DEFAULT_TENANT_ID, buildCareerRecord, clockFor, makePdf, type CareerRecord, type OwnedClaim, type OwnedCustomer, type OwnedPolicy, type PdfBlock } from "@insuros/domain";
import { getPersistence, resolveTenantId } from "./persistence";

const ddmmyy = (iso: string) => (/^\d{4}-\d{2}-\d{2}/.test(iso) ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(2, 4)}` : iso);
const today = (now: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: clockFor(undefined).timeZone }).format(now);
const kes = (value: number) => `KES ${Math.round(value).toLocaleString("en-GB")}`;
const pct = (part: number, whole: number) => (whole > 0 ? `${Math.round((part / whole) * 100)}%` : "-");

/**
 * A member of staff's own career record, built from their work in InsurOS,
 * and the PDF they can take to their next employer. Only the person
 * themselves can ask for theirs: the caller passes the signed-in ids.
 */
export class CareerService {
  private get db() {
    return getPersistence();
  }

  async recordFor(person: { name: string; userIds: string[] }): Promise<CareerRecord> {
    const db = this.db;
    const tenantId = await resolveTenantId();
    const [tenant, appointments, regions, customers, policies, claims, followUps, conversations, messages] = await Promise.all([
      db.tenants.findById(tenantId),
      db.appointments.findAll(),
      db.regions.findAll(),
      db.customers.findAll(),
      db.policies.findAll(),
      db.claims.findAll(),
      db.followUps.findAll(),
      db.conversations.findAll(),
      db.messages.findAll()
    ]);
    return buildCareerRecord({
      name: person.name,
      company: tenant?.name ?? (tenantId === DEFAULT_TENANT_ID ? "Telpen Systems Ltd (InsurOS)" : "InsurOS agency workspace"),
      userIds: person.userIds,
      appointments,
      regions,
      customers: customers as OwnedCustomer[],
      policies: policies as OwnedPolicy[],
      claims: claims as OwnedClaim[],
      followUps,
      conversations,
      messages
    });
  }

  /** A short code that changes if any figure on the record changes. */
  static fingerprint(record: CareerRecord, issuedOn: string): string {
    return createHash("sha256").update(JSON.stringify({ record, issuedOn })).digest("hex").slice(0, 16).toUpperCase().replace(/(.{4})(?=.)/g, "$1-");
  }

  pdf(record: CareerRecord, now: Date = new Date()): Uint8Array {
    const issued = today(now);
    const f = record.figures;
    const blocks: PdfBlock[] = [
      { kind: "heading", text: "Roles held" },
      record.roles.length
        ? {
            kind: "table",
            headers: ["Role", "Level", "Area", "From", "Status"],
            widths: [1.6, 1, 1.4, 0.8, 0.8],
            rows: record.roles.map((role) => [role.role, role.level, role.region, ddmmyy(role.from), role.status === "Active" ? "Current" : role.status])
          }
        : { kind: "text", text: "No role appointments are on record.", muted: true },
      { kind: "space", height: 8 },
      { kind: "heading", text: "Work handled" },
      {
        kind: "pairs",
        rows: [
          ["Customers brought in", String(f.customers)],
          ["Policies placed", String(f.policies)],
          ["Premium on those policies", kes(f.premium)],
          ["Claims registered", String(f.claimsRegistered)],
          ["Claims handled as officer", String(f.claimsHandled)],
          ["Workflow steps completed", `${f.stepsConfirmed} (${pct(f.stepsOnTime, f.stepsConfirmed)} on time)`],
          ["Customer messages answered", `${f.customerReplies} (${pct(f.customerRepliesWithin4h, f.customerReplies)} within 4 hours)`]
        ]
      }
    ];
    if (record.highlights.length) {
      blocks.push({ kind: "space", height: 8 }, { kind: "heading", text: "Highlights" });
      for (const line of record.highlights) blocks.push({ kind: "text", text: `- ${line}` });
    }
    blocks.push(
      { kind: "space", height: 12 },
      {
        kind: "text",
        size: 9,
        muted: true,
        text: `Built automatically from the work recorded in InsurOS; nothing on it was typed in by hand. Issued ${ddmmyy(issued)}. Fingerprint ${CareerService.fingerprint(record, issued)}: an employer can ask ${record.company} to confirm it.`
      }
    );
    return makePdf({
      title: `Career record: ${record.name}`,
      subtitle: `${record.company}${record.since ? `, since ${ddmmyy(record.since)}` : ""}`,
      footer: "InsurOS career record",
      blocks
    });
  }
}
