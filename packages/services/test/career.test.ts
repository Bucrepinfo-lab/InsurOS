import { describe, expect, it } from "vitest";
import { CareerService, getPersistence } from "../src";

const text = (bytes: Uint8Array) => Array.from(bytes, (b) => String.fromCharCode(b)).join("");

describe("CareerService", () => {
  it("builds a person's record from their own work only, and a PDF with a fingerprint", async () => {
    const db = getPersistence();
    const me = `staff-career-${Date.now()}`;
    await db.customers.insert({ id: `${me}-c1`, name: "Wanjiru Kamau", type: "Individual", email: "", status: "Active", ownerUserId: me } as never);
    await db.policies.insert({ id: `${me}-p1`, policyNumber: `POL-${me}`, customer: "Wanjiru Kamau", product: "Motor Private", premium: "KES 42,000", status: "Active", ownerUserId: me } as never);

    const service = new CareerService();
    const record = await service.recordFor({ name: "Agent Career", userIds: [me] });
    expect(record.figures).toMatchObject({ customers: 1, policies: 1, premium: 42000 });
    expect(record.roles).toEqual([]);

    const pdf = text(service.pdf(record, new Date("2026-11-18T09:00:00Z")));
    expect(pdf.startsWith("%PDF")).toBe(true);
    expect(pdf).toContain("Career record: Agent Career");
    expect(pdf).toContain(CareerService.fingerprint(record, "2026-11-18"));
  });

  it("changes the fingerprint when any figure changes", async () => {
    const record = await new CareerService().recordFor({ name: "Nobody", userIds: ["staff-none"] });
    const bumped = { ...record, figures: { ...record.figures, policies: record.figures.policies + 1 } };
    expect(CareerService.fingerprint(bumped, "2026-11-18")).not.toBe(CareerService.fingerprint(record, "2026-11-18"));
  });
});
