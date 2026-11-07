import { describe, expect, it } from "vitest";
import { REDACTED_PHONE, type Claim } from "@insuros/domain";
import type { PersistenceAdapter } from "../src";

/**
 * The persistence contract every backend must honour. Run against the memory
 * adapter always, and against PostgreSQL when DATABASE_URL is set.
 */
export function persistenceContract(
  name: string,
  makeAdapter: (tenantId: string) => Promise<PersistenceAdapter> | PersistenceAdapter
) {
  const unique = () => `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;

  describe(`persistence contract: ${name}`, () => {
    it("inserts, finds, filters and updates documents", async () => {
      const db = await makeAdapter(`t-crud-${unique()}`);
      const id = `clm-${unique()}`;
      const claim = { id, claimNumber: "CLM-1", policyNumber: "POL-1", customer: "A", amount: "KES 1", status: "Open" } as unknown as Claim;
      await db.claims.insert(claim);
      expect((await db.claims.findById(id))?.claimNumber).toBe("CLM-1");
      expect((await db.claims.findWhere((row) => row.id === id)).length).toBe(1);
      const updated = await db.claims.update(id, { claimNumber: "CLM-2" } as Partial<Claim>);
      expect(updated?.claimNumber).toBe("CLM-2");
      expect((await db.claims.findById(id))?.claimNumber).toBe("CLM-2");
      expect(await db.claims.update("missing", {} as Partial<Claim>)).toBeUndefined();
    });

    it("an undefined patch value erases the field (used for de-identification)", async () => {
      const db = await makeAdapter(`t-erase-${unique()}`);
      const regions = await db.regions.findAll();
      const id = `appt-${unique()}`;
      await db.appointments.insert({
        id, userId: "u", userName: "Name", email: "e@x", phone: "+254700000001",
        regionId: regions[0].id, level: regions[0].level, roleId: "role-agent",
        appointedBy: "t", appointedAt: new Date().toISOString(), status: "Active"
      });
      await db.appointments.update(id, { phone: undefined, userName: "Deleted user" });
      const row = await db.appointments.findById(id);
      expect(row?.phone).toBeUndefined();
      expect(row?.userName).toBe("Deleted user");
    });

    it("isolates tenants: B never sees A's rows, even by id", async () => {
      const a = await makeAdapter(`t-a-${unique()}`);
      const b = await makeAdapter(`t-b-${unique()}`);
      const id = `pol-${unique()}`;
      await a.policies.insert({ id, policyNumber: "P-A" } as never);
      expect(await b.policies.findById(id)).toBeUndefined();
      expect((await b.policies.findAll()).some((row) => row.id === id)).toBe(false);
      expect((await a.policies.findById(id))?.id).toBe(id);
    });

    it("seeds reference data into a new tenant, but no sample people/claims", async () => {
      const db = await makeAdapter(`t-seed-${unique()}`);
      expect((await db.regions.findAll()).length).toBeGreaterThan(0);
      expect((await db.adjudicationRules.findAll()).length).toBeGreaterThan(0);
      expect(await db.claims.findAll()).toEqual([]);
      expect(await db.appointments.findAll()).toEqual([]);
    });

    it("demo tenant gets sample data", async () => {
      const db = await makeAdapter("play-review");
      expect((await db.claims.findAll()).length).toBeGreaterThan(0);
      expect((await db.policies.findAll()).length).toBeGreaterThan(0);
    });

    it("payment ledger is append-only and de-identifies without losing rows", async () => {
      const db = await makeAdapter(`t-ledger-${unique()}`);
      const txnId = `pay-${unique()}`;
      const phone = `+2547${String(Math.floor(Math.random() * 1e8)).padStart(8, "0")}`;
      await db.paymentLedger.append({ txnId, status: "REQUESTED", phone, amount: 500, currency: "KES" });
      await db.paymentLedger.append({ txnId, status: "PENDING", providerTxnId: `ATPid_${txnId}`, phone, amount: 500, currency: "KES", raw: { phone } });
      await db.paymentLedger.append({ txnId, status: "SUCCESS", providerTxnId: `ATPid_${txnId}`, phone, amount: 500, currency: "KES" });

      const history = await db.paymentLedger.history(txnId);
      expect(history.map((entry) => entry.status)).toEqual(["REQUESTED", "PENDING", "SUCCESS"]);
      expect(history[1].seq).toBeGreaterThan(history[0].seq);
      expect((await db.paymentLedger.latestByProviderTxnId(`ATPid_${txnId}`))?.status).toBe("SUCCESS");

      expect(await db.paymentLedger.deidentifyPhone(phone)).toBe(3);
      const after = await db.paymentLedger.history(txnId);
      expect(after).toHaveLength(3);
      expect(after.every((entry) => entry.phone === REDACTED_PHONE && entry.raw === undefined)).toBe(true);
      expect(after.map((entry) => entry.amount)).toEqual([500, 500, 500]);
    });
  });
}
