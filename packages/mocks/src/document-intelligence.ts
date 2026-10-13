import type { OcrExtraction } from "@insuros/domain";

export const mockOcrExtractions: OcrExtraction[] = [
  {
    id: "ocr-1",
    attachmentReference: "ATT-2026-0801-A",
    claimReference: "CLM-KE-2026-0801",
    documentType: "PoliceAbstract",
    engine: "insuros-ocr-v1",
    fields: [
      { key: "obNumber", value: "OB/45/2026", confidence: 0.97 },
      { key: "station", value: "Kasarani Police Station", confidence: 0.95 },
      { key: "incidentDate", value: "2026-07-10", confidence: 0.98 }
    ],
    overallConfidence: 0.96,
    status: "Verified",
    extractedAt: "2026-07-10T08:02:11Z",
    verifiedBy: "system"
  },
  {
    id: "ocr-2",
    attachmentReference: "ATT-2026-0801-B",
    claimReference: "CLM-KE-2026-0801",
    documentType: "RepairInvoice",
    engine: "insuros-ocr-v1",
    fields: [
      { key: "garage", value: "AutoXpress Thika Rd", confidence: 0.94 },
      { key: "amount", value: "38500", confidence: 0.99 },
      { key: "registrationNumber", value: "KDG 412X", confidence: 0.96 }
    ],
    overallConfidence: 0.96,
    status: "Verified",
    extractedAt: "2026-07-10T08:03:40Z",
    verifiedBy: "system"
  },
  {
    id: "ocr-3",
    attachmentReference: "ATT-2026-0802-A",
    claimReference: "CLM-KE-2026-0802",
    documentType: "MedicalReceipt",
    engine: "insuros-ocr-v1",
    fields: [
      { key: "facility", value: "Mbagathi Hospital", confidence: 0.93 },
      { key: "amount", value: "8200", confidence: 0.98 },
      { key: "date", value: "2026-07-12", confidence: 0.97 }
    ],
    overallConfidence: 0.96,
    status: "Verified",
    extractedAt: "2026-07-12T14:22:05Z",
    verifiedBy: "system"
  },
  {
    id: "ocr-4",
    attachmentReference: "ATT-2026-0803-A",
    claimReference: "CLM-KE-2026-0803",
    documentType: "PoliceAbstract",
    engine: "insuros-ocr-v1",
    fields: [
      { key: "obNumber", value: "OB/…/2026", confidence: 0.41 },
      { key: "station", value: "Industrial Area", confidence: 0.72 }
    ],
    overallConfidence: 0.57,
    status: "NeedsHumanReview",
    extractedAt: "2026-07-08T09:01:30Z"
  }
];
