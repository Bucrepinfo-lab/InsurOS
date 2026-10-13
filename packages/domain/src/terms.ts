import type { EntityId, IsoDateTime } from "./base";

export type TermsAudience = "Policyholder" | "Agent" | "Tenant" | "All";

export type TermsStatus = "Draft" | "Active" | "Superseded";

export interface TermsSection {
  id: EntityId;
  order: number;
  heading: string;
  body: string;
}

export interface TermsDocument {
  id: EntityId;
  version: string;
  title: string;
  audience: TermsAudience;
  /** ISO country code or "GLOBAL". */
  jurisdiction: string;
  effectiveDate: IsoDateTime;
  status: TermsStatus;
  sections: TermsSection[];
}

export type TermsAcceptanceMethod = "ClickWrap" | "Signature" | "Imported";

export interface TermsAcceptance {
  id: EntityId;
  termsId: EntityId;
  termsVersion: string;
  userId: string;
  userName: string;
  acceptedAt: IsoDateTime;
  method: TermsAcceptanceMethod;
  ipAddress?: string;
}

/** Whether a user has accepted the currently active terms for an audience. */
export function hasAcceptedActiveTerms(
  documents: TermsDocument[],
  acceptances: TermsAcceptance[],
  userId: string,
  audience: TermsAudience
): boolean {
  const active = documents.find(
    (document) =>
      document.status === "Active" &&
      (document.audience === audience || document.audience === "All")
  );

  if (!active) {
    return false;
  }

  return acceptances.some(
    (acceptance) =>
      acceptance.termsId === active.id && acceptance.userId === userId
  );
}
