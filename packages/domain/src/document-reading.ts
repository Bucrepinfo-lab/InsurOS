import {
  REQUIRED_FIELDS_BY_TYPE,
  type OcrDocumentType,
  type OcrField
} from "./document-intelligence";

/**
 * Entering a claim document's details, with optional help from a photo read
 * ON THE PERSON'S OWN DEVICE. The photo is never uploaded and never stored:
 * only the details the person confirmed are saved. PURE.
 */

/** Document types that can be entered today. Identity documents are left out on purpose. */
export const ENTRY_DOCUMENT_TYPES = ["RepairInvoice", "MedicalReceipt", "PoliceAbstract", "LogBook"] as const;
export type EntryDocumentType = (typeof ENTRY_DOCUMENT_TYPES)[number];

export const DOCUMENT_TYPE_LABELS: Record<EntryDocumentType, string> = {
  RepairInvoice: "Repair invoice",
  MedicalReceipt: "Medical receipt",
  PoliceAbstract: "Police abstract",
  LogBook: "Vehicle log book"
};

export const DOCUMENT_FIELD_LABELS: Record<string, string> = {
  garage: "Garage",
  amount: "Amount, in shillings",
  registrationNumber: "Vehicle registration number",
  facility: "Hospital or clinic",
  date: "Date on the receipt (dd/mm/yyyy)",
  obNumber: "OB number",
  station: "Police station",
  incidentDate: "Date of the incident (dd/mm/yyyy)",
  ownerName: "Registered owner"
};

export function documentFieldKeys(type: EntryDocumentType): string[] {
  return REQUIRED_FIELDS_BY_TYPE[type as OcrDocumentType];
}

const DATE = /\b(0?[1-9]|[12]\d|3[01])[\/.-](0?[1-9]|1[0-2])[\/.-]((?:19|20)\d{2})\b/;
const PLATE = /\bK[A-Z]{2}[ -]?\d{3}[ -]?[A-Z]\b/;
const OB = /\bO\.?B\.?\s*(?:NO\.?|NUMBER)?\s*[:#]?\s*(\d{1,4}\/\d{1,2}\/\d{1,2}\/\d{2,4})/i;

function dayFirst(match: RegExpMatchArray): string {
  return `${match[1]!.padStart(2, "0")}/${match[2]!.padStart(2, "0")}/${match[3]}`;
}

/** The largest money-looking figure on a line that says total, amount or balance; else nothing. */
function totalAmount(text: string): string | undefined {
  let best = 0;
  for (const line of text.split(/\r?\n/)) {
    if (!/total|amount|balance|kes|ksh/i.test(line)) continue;
    for (const match of line.matchAll(/\d{1,3}(?:[, ]\d{3})+(?:\.\d{2})?|\d{3,9}(?:\.\d{2})?/g)) {
      const value = Math.round(Number(match[0].replace(/[, ]/g, "")));
      if (Number.isFinite(value) && value > best && value <= 1_000_000_000) best = value;
    }
  }
  return best > 0 ? String(best) : undefined;
}

/**
 * Suggestions from text read off a photo. Only values with a recognisable
 * shape are suggested (a date, a number plate, an OB number, a total); names
 * are left for the person to type. Every suggestion must be checked by eye.
 */
export function suggestDocumentFields(type: EntryDocumentType, text: string): Record<string, string> {
  const wanted = documentFieldKeys(type);
  const upper = text.toUpperCase();
  const found: Record<string, string> = {};
  const ob = text.match(OB);
  // An OB number contains a date-like run; do not offer it as the date.
  const date = (ob ? text.replace(ob[0], " ") : text).match(DATE);
  const plate = upper.match(PLATE);
  const amount = totalAmount(text);
  for (const key of wanted) {
    if ((key === "date" || key === "incidentDate") && date) found[key] = dayFirst(date);
    if (key === "registrationNumber" && plate) found[key] = plate[0].replace(/[ -]/g, "").replace(/^(K[A-Z]{2})(\d{3})([A-Z])$/, "$1 $2$3");
    if (key === "obNumber" && ob) found[key] = ob[1]!;
    if (key === "amount" && amount) found[key] = amount;
  }
  return found;
}

export type DocumentCheck =
  | { ok: true; documentType: EntryDocumentType; fields: OcrField[]; claimReference?: string }
  | { ok: false; error: string };

const clean = (value: unknown): string => (typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "");
const PLAIN = /^[\p{L}\p{N} .,'&()\/:#-]*$/u;

/**
 * Check what was submitted. A value the person typed or confirmed counts as
 * certain (1); an empty required detail is kept empty so the record goes to
 * review instead of being refused.
 */
export function checkDocumentForm(input: {
  documentType?: unknown;
  claimReference?: unknown;
  values: Record<string, unknown>;
}): DocumentCheck {
  const documentType = ENTRY_DOCUMENT_TYPES.find((candidate) => candidate === input.documentType);
  if (!documentType) return { ok: false, error: "Choose the kind of document." };
  const claimReference = clean(input.claimReference);
  if (claimReference.length > 60 || !/^[A-Za-z0-9-]*$/.test(claimReference)) {
    return { ok: false, error: "The claim number does not look right." };
  }
  const fields: OcrField[] = [];
  for (const key of documentFieldKeys(documentType)) {
    let value = clean(input.values[key]);
    const label = DOCUMENT_FIELD_LABELS[key] ?? key;
    if (value.length > 120 || !PLAIN.test(value)) return { ok: false, error: `Check "${label}": use letters, numbers and ordinary punctuation.` };
    if (value !== "" && (key === "date" || key === "incidentDate")) {
      const match = value.match(DATE);
      if (!match || match[0] !== value) return { ok: false, error: `Write "${label}" as day/month/year, for example 17/11/2026.` };
      value = dayFirst(match);
    }
    if (value !== "" && key === "amount") {
      const digits = value.replace(/^kes\s*/i, "").replace(/[ ,]/g, "");
      if (!/^\d{1,10}(\.\d{1,2})?$/.test(digits) || Number(digits) <= 0) {
        return { ok: false, error: "Enter the amount in shillings, for example 12,000." };
      }
      value = String(Math.round(Number(digits)));
    }
    fields.push({ key, value, confidence: 1 });
  }
  if (fields.every((field) => field.value === "")) return { ok: false, error: "Enter at least one detail from the document." };
  return { ok: true, documentType, fields, ...(claimReference ? { claimReference } : {}) };
}
