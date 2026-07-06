import type {
  CommissionAccrual,
  CommissionSchedule,
  CommissionStatement,
  InsuranceLine
} from "@insuros/domain";
import { buildStatement, computeCommissionAmount } from "@insuros/domain";
import { getPersistence } from "./persistence";

export interface AccruePremiumInput {
  writingAgentId: string;
  policyReference: string;
  insuranceLine: InsuranceLine;
  grossPremium: number;
  currency: string;
  period: string;
}

export class CommissionService {
  private get db() {
    return getPersistence();
  }

  async getSchedules(): Promise<CommissionSchedule[]> {
    return this.db.commissionSchedules.findAll();
  }

  async getAccruals(): Promise<CommissionAccrual[]> {
    return this.db.commissionAccruals.findAll();
  }

  async getAccrualsForAgent(agentId: string): Promise<CommissionAccrual[]> {
    return this.db.commissionAccruals.findWhere(
      (accrual) => accrual.agentId === agentId
    );
  }

  async getStatement(
    agentId: string,
    period: string
  ): Promise<CommissionStatement> {
    return buildStatement(
      agentId,
      period,
      await this.db.commissionAccruals.findAll()
    );
  }

  /**
   * Accrue commissions for a written premium: a Direct accrual for the
   * writing agent plus Override accruals up the supervisor chain, each at
   * the active schedule rate for the holder's rank.
   */
  async accruePremium(input: AccruePremiumInput): Promise<CommissionAccrual[]> {
    const writer = await this.db.salesAgents.findById(input.writingAgentId);

    if (!writer) {
      throw new Error(`Unknown agent: ${input.writingAgentId}`);
    }

    const created: CommissionAccrual[] = [];

    const directSchedule = await this.activeSchedule(
      writer.rank,
      input.insuranceLine
    );

    if (directSchedule && directSchedule.directRatePercent > 0) {
      created.push(
        this.makeAccrual(input, writer.id, writer.id, directSchedule, "Direct",
          directSchedule.directRatePercent)
      );
    }

    let supervisorId = writer.supervisorId;

    while (supervisorId) {
      const supervisor = await this.db.salesAgents.findById(supervisorId);

      if (!supervisor) {
        break;
      }

      const overrideSchedule = await this.activeSchedule(
        supervisor.rank,
        input.insuranceLine
      );

      if (overrideSchedule && overrideSchedule.overrideRatePercent > 0) {
        created.push(
          this.makeAccrual(input, supervisor.id, writer.id, overrideSchedule,
            "Override", overrideSchedule.overrideRatePercent)
        );
      }

      supervisorId = supervisor.supervisorId;
    }

    for (const accrual of created) {
      await this.db.commissionAccruals.insert(accrual);
    }

    return created;
  }

  /** Claw back an accrual, e.g. for lapsed or fraudulent business. */
  async clawBack(accrualId: string, reason: string): Promise<CommissionAccrual> {
    const accrual = await this.db.commissionAccruals.update(accrualId, {
      status: "ClawedBack",
      clawbackReason: reason
    });

    if (!accrual) {
      throw new Error(`Unknown accrual: ${accrualId}`);
    }

    return accrual;
  }

  private async activeSchedule(
    rank: CommissionSchedule["rank"],
    line: InsuranceLine
  ): Promise<CommissionSchedule | undefined> {
    const [schedule] = await this.db.commissionSchedules.findWhere(
      (item) =>
        item.status === "Active" &&
        item.rank === rank &&
        (item.insuranceLine === "All" || item.insuranceLine === line)
    );

    return schedule;
  }

  private makeAccrual(
    input: AccruePremiumInput,
    agentId: string,
    sourceAgentId: string,
    schedule: CommissionSchedule,
    kind: CommissionAccrual["kind"],
    ratePercent: number
  ): CommissionAccrual {
    return {
      id: `accrual-${agentId}-${Date.now()}-${kind.toLowerCase()}`,
      agentId,
      sourceAgentId,
      scheduleId: schedule.id,
      kind,
      policyReference: input.policyReference,
      insuranceLine: input.insuranceLine,
      grossPremium: input.grossPremium,
      ratePercent,
      amount: computeCommissionAmount(input.grossPremium, ratePercent),
      currency: input.currency,
      period: input.period,
      accruedAt: new Date().toISOString(),
      status: "Accrued"
    };
  }
}
