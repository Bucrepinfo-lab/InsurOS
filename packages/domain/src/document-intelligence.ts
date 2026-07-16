import type { EntityId, IsoDateTime } from "./base";

export type OcrDocumentType =
  | "NationalId"
  | "DriverLicense"
  | "LogBook"
  | "PoliceAbstract"
  | "MedicalReceipt"
  | "RepairInvoice"
  | "DeathCertificate"
  | "Other";

export interface OcrField {
  key: string;
  value: string;
  /** Engine confidence 0–1. */
  confidence: number;
}

export type OcrStatus = "Extracted" | "NeedsHumanReview" | "Verified" | "Rejected";

export interface OcrExtraction {
  id: EntityId;
  /** Reference to the uploaded attachment. */
  attachmentReference: string;
  claimReference?: string;
  documentType: OcrDocumentType;
  engine: string;
  fields: OcrField[];
  overallConfidence: number;
  status: OcrStatus;
  extractedAt: IsoDateTime;
  verifiedBy?: string;
}

/** Fields that must be present per document type before a claim can rely on it. */
export const REQUIRED_FIELDS_BY_TYPE: Record<OcrDocumentType, string[]> = {
  NationalId: ["fullName", "idNumber"],
  DriverLicense: ["fullName", "licenseNumber", "expiryDate"],
  LogBook: ["registrationNumber", "ownerName"],
  PoliceAbstract: ["obNumber", "station", "incidentDate"],
  MedicalReceipt: ["facility", "amount", "date"],
  RepairInvoice: ["garage", "amount", "registrationNumber"],
  DeathCertificate: ["fullName", "dateOfDeath", "certificateNumber"],
  Other: []
};

export function missingRequiredFields(extraction: OcrExtraction): string[] {
  const required = REQUIRED_FIELDS_BY_TYPE[extraction.documentType];
  const present = new Set(
    extraction.fields
      .filter((field) => field.value.trim().length > 0)
      .map((field) => field.key)
  );

  return required.filter((key) => !present.has(key));
}

/**
 * Route to a human when the engine is unsure or required fields are
 * missing. OCR accelerates intake; it never silently decides.
 */
export function requiresHumanReview(
  extraction: OcrExtraction,
  confidenceThreshold = 0.85
): boolean {
  return (
    extraction.overallConfidence < confidenceThreshold ||
    missingRequiredFields(extraction).length > 0
  );
}
