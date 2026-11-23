import { describe, expect, it } from "vitest";
import {
  makePdf,
  maskPayerPhone,
  parsePremiumReference,
  premiumAmount,
  premiumInvoiceFor,
  premiumReceiptPdf,
  providerReferenceFrom,
  receiptNumberFor,
  type Policy
} from "../src";

const base: Policy = {
  id: "POL-1",
  policyNumber: "POL-1",
  customer: "Amina Hassan",
  product: "Private Car Comprehensive",
  premium: "KES 58,000",
  status: "Active",
  startDate: "2026-01-05",
  expiryDate: "2027-01-04"
};
const at = (day: string) => new Date(`${day}T09:00:00Z`);

describe("premium invoice", () => {
  it("reads the premium", () => {
    expect(premiumAmount(base)).toBe(58000);
  });

  it("offers nothing while cover has more than 30 days left", () => {
    expect(premiumInvoiceFor(base, at("2026-11-23"))).toBeNull();
  });

  it("offers the renewal from the day after cover ends, for a year", () => {
    const invoice = premiumInvoiceFor(base, at("2026-12-20"))!;
    expect(invoice.kind).toBe("Renewal");
    expect(invoice.periodStart).toBe("2027-01-05");
    expect(invoice.periodEnd).toBe("2028-01-04");
    expect(invoice.dueDate).toBe("2027-01-04");
    expect(invoice.amount).toBe(58000);
    expect(invoice.invoiceNumber).toBe("INV-POL-1-20270105");
    expect(parsePremiumReference(invoice.reference)).toEqual({ policyId: "POL-1", periodStart: "2027-01-05" });
  });

  it("renews from today after a gap, and invoices a pending policy as new cover", () => {
    expect(premiumInvoiceFor({ ...base, status: "Expired" }, at("2027-02-10"))?.periodStart).toBe("2027-02-10");
    const fresh = premiumInvoiceFor({ ...base, status: "Pending", startDate: "2026-11-25", expiryDate: "2027-11-24" }, at("2026-11-23"))!;
    expect(fresh.kind).toBe("New cover");
    expect(fresh.periodStart).toBe("2026-11-25");
    expect(fresh.periodEnd).toBe("2027-11-24");
  });

  it("never invoices a cancelled policy or an unreadable premium", () => {
    expect(premiumInvoiceFor({ ...base, status: "Cancelled" }, at("2026-12-20"))).toBeNull();
    expect(premiumInvoiceFor({ ...base, premium: "to be agreed" }, at("2026-12-20"))).toBeNull();
    expect(parsePremiumReference("PLUS:c1:2026-11")).toBeNull();
  });
});

describe("premium receipt", () => {
  it("numbers, masks and reads the M-Pesa code", () => {
    expect(receiptNumberFor("pay-1764000000000-123456", "2026-11-23T10:00:00Z")).toBe("RCT-20261123-123456");
    expect(maskPayerPhone("+254712345678")).toBe("0712 *** 678");
    expect(maskPayerPhone("redacted")).toBeUndefined();
    expect(providerReferenceFrom({ providerRefId: "SKL4ABC123" })).toBe("SKL4ABC123");
    expect(providerReferenceFrom({ providerRefId: "<script>" })).toBeUndefined();
  });

  it("makes a PDF with the particulars", () => {
    const doc = premiumReceiptPdf({
      receiptNumber: "RCT-20261123-123456",
      paidAt: "2026-11-23T10:00:00Z",
      invoiceNumber: "INV-POL-1-20270105",
      kind: "Renewal",
      receivedFrom: "Amina Hassan",
      insurer: "Sample insurer",
      issuedBy: "InsurOS Demo",
      policyNumber: "POL-1",
      product: "Private Car Comprehensive",
      periodStart: "2027-01-05",
      periodEnd: "2028-01-04",
      amount: 58000,
      currency: "KES",
      method: "M-Pesa",
      providerReference: "SKL4ABC123"
    });
    const text = JSON.stringify(doc);
    for (const part of ["RCT-20261123-123456", "INV-POL-1-20270105", "Sample insurer", "KES 58,000", "SKL4ABC123", "05/01/27 to 04/01/28"]) {
      expect(text).toContain(part);
    }
    const bytes = makePdf(doc);
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
  });
});
