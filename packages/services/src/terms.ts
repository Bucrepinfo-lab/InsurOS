import type {
  TermsAcceptance,
  TermsAudience,
  TermsDocument
} from "@insuros/domain";
import { hasAcceptedActiveTerms } from "@insuros/domain";
import { getPersistence } from "./persistence";

export class TermsService {
  private get db() {
    return getPersistence();
  }

  async getTermsDocuments(): Promise<TermsDocument[]> {
    return this.db.termsDocuments.findAll();
  }

  async getActiveTerms(audience: TermsAudience): Promise<TermsDocument | undefined> {
    const [active] = await this.db.termsDocuments.findWhere(
      (document) =>
        document.status === "Active" &&
        (document.audience === audience || document.audience === "All")
    );

    return active;
  }

  async getAcceptances(): Promise<TermsAcceptance[]> {
    return this.db.termsAcceptances.findAll();
  }

  async userHasAccepted(userId: string, audience: TermsAudience): Promise<boolean> {
    return hasAcceptedActiveTerms(
      await this.db.termsDocuments.findAll(),
      await this.db.termsAcceptances.findAll(),
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

    return this.db.termsAcceptances.insert({
      id: `acceptance-${Date.now()}`,
      termsId: active.id,
      termsVersion: active.version,
      userId,
      userName,
      acceptedAt: new Date().toISOString(),
      method: "ClickWrap",
      ipAddress
    });
  }
}
