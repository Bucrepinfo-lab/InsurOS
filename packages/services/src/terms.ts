import type {
  TermsAcceptance,
  TermsAudience,
  TermsDocument
} from "@insuros/domain";
import { hasAcceptedActiveTerms } from "@insuros/domain";
import { mockTermsAcceptances, mockTermsDocuments } from "@insuros/mocks";

export class TermsService {
  async getTermsDocuments(): Promise<TermsDocument[]> {
    return mockTermsDocuments;
  }

  async getActiveTerms(audience: TermsAudience): Promise<TermsDocument | undefined> {
    return mockTermsDocuments.find(
      (document) =>
        document.status === "Active" &&
        (document.audience === audience || document.audience === "All")
    );
  }

  async getAcceptances(): Promise<TermsAcceptance[]> {
    return mockTermsAcceptances;
  }

  async userHasAccepted(userId: string, audience: TermsAudience): Promise<boolean> {
    return hasAcceptedActiveTerms(
      mockTermsDocuments,
      mockTermsAcceptances,
      userId,
      audience
    );
  }

  /** Record a click-wrap acceptance of the active terms. */
  async recordAcceptance(
    userId: string,
    userName: string,
    audience: TermsAudience,
    ipAddress?: string
  ): Promise<TermsAcceptance> {
    const active = await this.getActiveTerms(audience);

    if (!active) {
      throw new Error(`No active terms for audience: ${audience}`);
    }

    const acceptance: TermsAcceptance = {
      id: `acceptance-${Date.now()}`,
      termsId: active.id,
      termsVersion: active.version,
      userId,
      userName,
      acceptedAt: new Date().toISOString(),
      method: "ClickWrap",
      ipAddress
    };

    mockTermsAcceptances.push(acceptance);

    return acceptance;
  }
}
