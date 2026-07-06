import type { SalesAgent, SalesAssignment } from "@insuros/domain";
import { canAssignSales } from "@insuros/domain";
import { getPersistence } from "./persistence";

export interface CreateAssignmentInput {
  agentId: string;
  assignedByAgentId: string;
  regionId: string;
  targetPremium: number;
  currency: string;
  period: string;
  notes?: string;
}

export interface AssignmentResult {
  ok: boolean;
  error?: string;
  assignment?: SalesAssignment;
}

export class SalesHierarchyService {
  private get db() {
    return getPersistence();
  }

  async getAgents(): Promise<SalesAgent[]> {
    return this.db.salesAgents.findAll();
  }

  async getAgent(id: string): Promise<SalesAgent | undefined> {
    return this.db.salesAgents.findById(id);
  }

  /** Direct reports of a supervisor. */
  async getTeam(supervisorId: string): Promise<SalesAgent[]> {
    return this.db.salesAgents.findWhere(
      (agent) => agent.supervisorId === supervisorId
    );
  }

  async getAssignments(): Promise<SalesAssignment[]> {
    return this.db.salesAssignments.findAll();
  }

  async getAssignmentsForAgent(agentId: string): Promise<SalesAssignment[]> {
    return this.db.salesAssignments.findWhere(
      (assignment) => assignment.agentId === agentId
    );
  }

  /**
   * Create an assignment. The assigner must outrank the assignee and the
   * assignee must be in the assigner's reporting line.
   */
  async createAssignment(input: CreateAssignmentInput): Promise<AssignmentResult> {
    const superior = await this.db.salesAgents.findById(input.assignedByAgentId);
    const subordinate = await this.db.salesAgents.findById(input.agentId);

    if (!superior || !subordinate) {
      return { ok: false, error: "Unknown superior or subordinate agent." };
    }

    if (!canAssignSales(superior.rank, subordinate.rank)) {
      return {
        ok: false,
        error: `A ${superior.rank} cannot assign a ${subordinate.rank}.`
      };
    }

    if (!(await this.isInReportingLine(subordinate, superior.id))) {
      return {
        ok: false,
        error: "Agent is not in the assigner's reporting line."
      };
    }

    const assignment = await this.db.salesAssignments.insert({
      id: `sales-assign-${Date.now()}`,
      agentId: subordinate.id,
      assignedBy: superior.id,
      regionId: input.regionId,
      targetPremium: input.targetPremium,
      currency: input.currency,
      period: input.period,
      assignedAt: new Date().toISOString(),
      status: "Assigned",
      notes: input.notes
    });

    return { ok: true, assignment };
  }

  private async isInReportingLine(
    agent: SalesAgent,
    superiorId: string
  ): Promise<boolean> {
    let current: SalesAgent | undefined = agent;

    while (current?.supervisorId) {
      if (current.supervisorId === superiorId) {
        return true;
      }
      current = await this.db.salesAgents.findById(current.supervisorId);
    }

    return false;
  }
}
