import { describe, expect, it } from "vitest";
import {
  ENTRY_DOCUMENT_TYPES,
  DOCUMENT_FIELD_LABELS,
  DOCUMENT_TYPE_LABELS,
  checkDocumentForm,
  documentFieldKeys,
  suggestDocumentFields
} from "../src";

describe("document entry", () => {
  it("has a plain label for every type and every detail", () => {
    for (const type of ENTRY_DOCUMENT_TYPES) {
      expect(DOCUMENT_TYPE_LABELS[type]).toBeTruthy();
      expect(documentFieldKeys(type).length).toBeGreaterThan(0);
      for (const key of documentFieldKeys(type)) expect(DOCUMENT_FIELD_LABELS[key]).toBeTruthy();
    }
  });

  it("does not offer identity documents", () => {
    expect(ENTRY_DOCUMENT_TYPES).not.toContain("NationalId");
    expect(ENTRY_DOCUMENT_TYPES).not.toContain("DriverLicense");
    expect(ENTRY_DOCUMENT_TYPES).not.toContain("DeathCertificate");
  });

  it("suggests only values with a recognisable shape", () => {
    const invoice = "DEMO MOTORS LTD\nInvoice 4471  Date: 3/11/2026\nVehicle kdx 001a\nLabour 12,000.00\nParts 30,500.00\nTOTAL KES 42,500.00\nTel 0712345678";
    expect(suggestDocumentFields("RepairInvoice", invoice)).toEqual({ amount: "42500", registrationNumber: "KDX 001A" });
    expect(suggestDocumentFields("MedicalReceipt", "City Clinic\n17-11-2026\nAmount due 3,200")).toEqual({ date: "17/11/2026", amount: "3200" });
    expect(suggestDocumentFields("PoliceAbstract", "OB No: 23/14/11/2026 Central Police Station on 14.11.2026")).toEqual({
      obNumber: "23/14/11/2026",
      incidentDate: "14/11/2026"
    });
    expect(suggestDocumentFields("PoliceAbstract", "OB 23/14/11/2026 Central Police Station")).toEqual({ obNumber: "23/14/11/2026" });
    expect(suggestDocumentFields("LogBook", "Registration KCA123B owner J. Doe")).toEqual({ registrationNumber: "KCA 123B" });
    expect(suggestDocumentFields("RepairInvoice", "nothing useful here")).toEqual({});
    // A phone number on its own line is not mistaken for the total.
    expect(suggestDocumentFields("RepairInvoice", "Call 0712345678")).toEqual({});
  });

  it("accepts a complete document and normalises it", () => {
    const result = checkDocumentForm({
      documentType: "RepairInvoice",
      claimReference: "CLM-2026-0001",
      values: { garage: " Demo  Motors Ltd ", amount: "KES 42,500", registrationNumber: "KDX 001A" }
    });
    expect(result).toEqual({
      ok: true,
      documentType: "RepairInvoice",
      claimReference: "CLM-2026-0001",
      fields: [
        { key: "garage", value: "Demo Motors Ltd", confidence: 1 },
        { key: "amount", value: "42500", confidence: 1 },
        { key: "registrationNumber", value: "KDX 001A", confidence: 1 }
      ]
    });
  });

  it("keeps a missing detail empty so the record goes to review", () => {
    const result = checkDocumentForm({ documentType: "MedicalReceipt", values: { facility: "City Clinic", date: "3/1/2026" } });
    expect(result.ok && result.fields).toEqual([
      { key: "facility", value: "City Clinic", confidence: 1 },
      { key: "amount", value: "", confidence: 1 },
      { key: "date", value: "03/01/2026", confidence: 1 }
    ]);
  });

  it("refuses bad input", () => {
    expect(checkDocumentForm({ documentType: "NationalId", values: {} })).toMatchObject({ ok: false });
    expect(checkDocumentForm({ documentType: "RepairInvoice", values: {} })).toMatchObject({ ok: false });
    expect(checkDocumentForm({ documentType: "RepairInvoice", values: { garage: "<b>x</b>" } })).toMatchObject({ ok: false });
    expect(checkDocumentForm({ documentType: "RepairInvoice", values: { garage: "A", amount: "lots" } })).toMatchObject({ ok: false });
    expect(checkDocumentForm({ documentType: "MedicalReceipt", values: { facility: "A", date: "2026-11-17" } })).toMatchObject({ ok: false });
    expect(checkDocumentForm({ documentType: "RepairInvoice", claimReference: "x y;drop", values: { garage: "A" } })).toMatchObject({ ok: false });
  });
});
