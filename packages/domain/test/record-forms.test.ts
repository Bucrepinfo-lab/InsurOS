import { describe, expect, it } from "vitest";
import { checkAmount, checkClaimForm, checkCustomerForm, checkPolicyForm, formatKes, newRecordNumber } from "../src";

describe("record forms", () => {
  it("accepts a customer and tidies the input", () => {
    expect(checkCustomerForm({ name: "  Wanjiru   Kamau ", type: "Individual", email: " W.Kamau@Example.com " })).toEqual({
      ok: true,
      value: { name: "Wanjiru Kamau", type: "Individual", email: "w.kamau@example.com", referredBy: "" }
    });
    expect(checkCustomerForm({ name: "Kilele Traders & Sons (K) Ltd", type: "Business", email: "" })).toMatchObject({ ok: true });
    expect(checkCustomerForm({ name: "Jane Doe", type: "Individual", referredBy: " ke-cft5sd " })).toMatchObject({
      ok: true,
      value: { referredBy: "KE-CFT5SD" }
    });
    expect(checkCustomerForm({ name: "Jane Doe", type: "Individual", referredBy: "my friend" })).toMatchObject({ ok: false, field: "referredBy" });
  });

  it("refuses a customer that is incomplete or carries markup", () => {
    expect(checkCustomerForm({ name: "A", type: "Individual" })).toMatchObject({ ok: false, field: "name" });
    expect(checkCustomerForm({ name: "<script>alert(1)</script>", type: "Individual" })).toMatchObject({ ok: false, field: "name" });
    expect(checkCustomerForm({ name: "Jane Doe", type: "Robot" })).toMatchObject({ ok: false, field: "type" });
    expect(checkCustomerForm({ name: "Jane Doe", type: "Individual", email: "not-an-email" })).toMatchObject({ ok: false, field: "email" });
    expect(checkCustomerForm({ name: "x".repeat(121), type: "Individual" })).toMatchObject({ ok: false, field: "name" });
    expect(checkCustomerForm({})).toMatchObject({ ok: false, field: "name" });
  });

  it("reads amounts the way people type them", () => {
    expect(checkAmount("12,000")).toEqual({ ok: true, value: 12000 });
    expect(checkAmount("KES 12 000")).toEqual({ ok: true, value: 12000 });
    expect(checkAmount("1500.50")).toEqual({ ok: true, value: 1501 });
    expect(checkAmount("0")).toMatchObject({ ok: false });
    expect(checkAmount("-5")).toMatchObject({ ok: false });
    expect(checkAmount("twelve")).toMatchObject({ ok: false });
    expect(checkAmount("9999999999999")).toMatchObject({ ok: false });
    expect(checkAmount(undefined)).toMatchObject({ ok: false });
    expect(formatKes(12000)).toBe("KES 12,000");
    expect(formatKes(950)).toBe("KES 950");
    expect(formatKes(1234567)).toBe("KES 1,234,567");
  });

  it("checks a policy form", () => {
    expect(checkPolicyForm({ customerId: "cus-1", product: "Motor Comprehensive", premium: "42,000", status: "Active" })).toEqual({
      ok: true,
      value: { customerId: "cus-1", product: "Motor Comprehensive", premium: 42000, status: "Active" }
    });
    expect(checkPolicyForm({ customerId: "", product: "Motor", premium: "1", status: "Active" })).toMatchObject({ ok: false, field: "customerId" });
    expect(checkPolicyForm({ customerId: "c", product: "", premium: "1", status: "Active" })).toMatchObject({ ok: false, field: "product" });
    expect(checkPolicyForm({ customerId: "c", product: "Motor", premium: "x", status: "Active" })).toMatchObject({ ok: false, field: "premium" });
    // A new policy can only start in force or pending.
    expect(checkPolicyForm({ customerId: "c", product: "Motor", premium: "1", status: "Cancelled" })).toMatchObject({ ok: false, field: "status" });
  });

  it("checks a claim form", () => {
    expect(checkClaimForm({ policyId: "POL-1", amount: "120,000" })).toEqual({ ok: true, value: { policyId: "POL-1", amount: 120000 } });
    expect(checkClaimForm({ policyId: "", amount: "1" })).toMatchObject({ ok: false, field: "policyId" });
    expect(checkClaimForm({ policyId: "POL-1", amount: "" })).toMatchObject({ ok: false, field: "amount" });
  });

  it("numbers records by the East Africa year", () => {
    expect(newRecordNumber("POL", new Date("2026-12-31T20:59:00Z"), 48213)).toBe("POL-2026-048213");
    expect(newRecordNumber("CLM", new Date("2026-12-31T21:00:00Z"), 7)).toBe("CLM-2027-000007");
    expect(newRecordNumber("CUS", new Date("2026-06-01T00:00:00Z"), 1234567)).toBe("CUS-2026-234567");
  });
});
