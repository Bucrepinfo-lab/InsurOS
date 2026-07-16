import type {
  AdjudicationDecision,
  AdjudicationRule,
  FnolSubmission,
  FraudAssessment
} from "@insuros/domain";
import { adjudicate, assessFraud } from "@insuros/domain";
import { getPersistence } from "./persistence";

export interface SubmitFnolInput {
  claimReference: string;
  policyReference: string;
  insuranceLine: FnolSubmission["insuranceLine"];
  channel: FnolSubmission["channel"];
  description: string;
  incidentAt: string;
  amountClaimed: number;
  currency: string;
  documentsComplete: boolean;
  policyAgeDays: number;
  priorClaimsCount: number;
}

export interface StpResult {
  fnol: FnolSubmission;
  assessment: FraudAssessment;
  decision: AdjudicationDecision;
}

export class ClaimsAutomationService {
  private get db() {
    return getPersistence();
  }

  async getFnols(): Promise<FnolSubmission[]> {
    return this.db.fnolSubmissions.findAll();
  }

  async getRules(): Promise<AdjudicationRule[]> {
    return this.db.adjudicationRules.findAll();
  }

  async getDecisions(): Promise<AdjudicationDecision[]> {
    return this.db.adjudicationDecisions.findAll();
  }

  /** Percent of decisions made without human touch. */
  async getStpRate(): Promise<number> {
    const decisions = await this.db.adjudicationDecisions.findAll();

    if (decisions.length === 0) {
      return 0;
    }

    const auto = decisions.filter(
      (decision) => decision.outcome === "AutoApproved"
    ).length;

    return Math.round((auto / decisions.length) * 1000) / 10;
  }

  /**
   * Straight-through pipeline: intake → fraud score → rules adjudication,
   * all in one call. Legitimate small claims resolve in seconds; only
   * risk-flagged or large claims reach a human.
   */
  async submitFnol(input: SubmitFnolInput): Promise<StpResult> {
    const fnol: FnolSubmission = {
      id: `fnol-${Date.now()}`,
      ...input,
      reportedAt: new Date().toISOString(),
      status: "Received"
    };

    const assessment = assessFraud(fnol);
    fnol.status = "Scored";

    const rules = await this.db.adjudicationRules.findAll();
    const decisionData = adjudicate(fnol, assessment, rules);

    const decision = await this.db.adjudicationDecisions.insert({
      id: `adj-dec-${Date.now()}`,
      ...decisionData
    });

    fnol.status = "Adjudicated";
    await this.db.fnolSubmissions.insert(fnol);

    return { fnol, assessment, decision };
  }
}
