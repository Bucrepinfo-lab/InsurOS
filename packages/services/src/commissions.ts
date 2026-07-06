import type {
  CommissionAccrual,
  CommissionSchedule,
  CommissionStatement,
  InsuranceLine
} from "@insuros/domain";
import { buildStatement, computeCommissionAmount } from "@insuros/domain";
import {
  mockCommissionAccruals,
  mockCommissionSchedules,
  mockSalesAgents
} from "@insuros/mocks";

export interface AccruePremiumInput {
  writingAgentId: string;
  policyReference: string;
  insuranceLine: InsuranceLine;
  grossPremium: number;
  currency: string;
  period: string;
}

export class CommissionService {
  async getSchedules(): Promise<CommissionSchedule[]> {
    return mockCommissionSchedules;
  }

  async getAccruals(): Promise<CommissionAccrual[]> {
    return mockCommissionAccruals;
  }

  async getAccrualsForAgent(agentId: string): Promise<CommissionAccrual[]> {
    return mockCommissionAccruals.filter(
      (accrual) => accrual.agentId === agentId
    );
  }

  async getStatement(
    agentId: string,
    period: string
  ): Promise<CommissionStatement> {
    return buildStatement(agentId, period, mockCommissionAccruals);
  }

  /**
   * Accrue commissions for a written premium: a Direct accrual for the
   * writing agent plus Override accruals up the supervisor chain, each at
   * the active schedule rate for the holder's rank.
   */
  async accruePremium(input: AccruePremiumInput): Promise<CommissionAccrual[]> {
    const writer = mockSalesAgents.find(
      (agent) => agent.id === input.writingAgentId
    );

    if (!writer) {
      throw new Error(`Unknown agent: ${input.writingAgentId}`);
    }

    const created: CommissionAccrual[] = [];

    const directSchedule = this.activeSchedule(writer.rank, input.insuranceLine);

    if (directSchedule && directSchedule.directRatePercent > 0) {
      created.push(
        this.makeAccrual(input, writer.id, writer.id, directSchedule, "Direct",
          directSchedule.directRatePercent)
      );
    }

    let supervisorId = writer.supervisorId;

    while (supervisorId) {
      const supervisor = mockSalesAgents.find(
        (agent) => agent.id === supervisorId
      );

      if (!supervisor) {
        break;
      }

      const overrideSchedule = this.activeSchedule(
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

    mockCommissionAccruals.push(...created);

    return created;
  }

  /** Claw back an accrual, e.g. for lapsed or fraudulent business. */
  async clawBack(accrualId: string, reason: string): Promise<CommissionAccrual> {
    const accrual = mockCommissionAccruals.find(
      (item) => item.id === accrualId
    );

    if (!accrual) {
      throw new Error(`Unknown accrual: ${accrualId}`);
    }

    accrual.status = "ClawedBack";
    accrual.clawbackReason = reason;

    return accrual;
  }

  private activeSchedule(
    rank: CommissionSchedule["rank"],
    line: InsuranceLine
  ): CommissionSchedule | undefined {
    return mockCommissionSchedules.find(
      (schedule) =>
        schedule.status === "Active" &&
        schedule.rank === rank &&
        (schedule.insuranceLine === "All" || schedule.insuranceLine === line)
    );
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
