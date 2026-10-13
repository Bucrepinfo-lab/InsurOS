import type { OcrDocumentType, OcrExtraction, OcrField } from "@insuros/domain";
import { missingRequiredFields, requiresHumanReview } from "@insuros/domain";
import { getPersistence } from "./persistence";

export interface IngestDocumentInput {
  attachmentReference: string;
  claimReference?: string;
  documentType: OcrDocumentType;
  fields: OcrField[];
}

export class DocumentIntelligenceService {
  private get db() {
    return getPersistence();
  }

  async getExtractions(): Promise<OcrExtraction[]> {
    return this.db.ocrExtractions.findAll();
  }

  async getExtractionsForClaim(claimReference: string): Promise<OcrExtraction[]> {
    return this.db.ocrExtractions.findWhere(
      (extraction) => extraction.claimReference === claimReference
    );
  }

  /**
   * Register an OCR result for an uploaded document. Low confidence or
   * missing required fields route to human review automatically — OCR
   * accelerates intake; it never silently decides.
   */
  async ingest(input: IngestDocumentInput): Promise<OcrExtraction> {
    const overallConfidence =
      input.fields.length === 0
        ? 0
        : Math.round(
            (input.fields.reduce((sum, field) => sum + field.confidence, 0) /
              input.fields.length) *
              100
          ) / 100;

    const extraction: OcrExtraction = {
      id: `ocr-${Date.now()}`,
      attachmentReference: input.attachmentReference,
      claimReference: input.claimReference,
      documentType: input.documentType,
      engine: "insuros-ocr-v1",
      fields: input.fields,
      overallConfidence,
      status: "Extracted",
      extractedAt: new Date().toISOString()
    };

    extraction.status = requiresHumanReview(extraction)
      ? "NeedsHumanReview"
      : "Verified";

    if (extraction.status === "Verified") {
      extraction.verifiedBy = "system";
    }

    return this.db.ocrExtractions.insert(extraction);
  }

  /** Human verification of a low-confidence extraction. */
  async verify(extractionId: string, verifiedBy: string): Promise<OcrExtraction> {
    const extraction = await this.db.ocrExtractions.update(extractionId, {
      status: "Verified",
      verifiedBy
    });

    if (!extraction) {
      throw new Error(`Unknown extraction: ${extractionId}`);
    }

    return extraction;
  }

  /** True when every document on a claim is verified with no gaps. */
  async claimDocumentsComplete(claimReference: string): Promise<boolean> {
    const extractions = await this.getExtractionsForClaim(claimReference);

    return (
      extractions.length > 0 &&
      extractions.every(
        (extraction) =>
          extraction.status === "Verified" &&
          missingRequiredFields(extraction).length === 0
      )
    );
  }
}
