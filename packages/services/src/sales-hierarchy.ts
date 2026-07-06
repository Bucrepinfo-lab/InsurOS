import type { SalesAgent, SalesAssignment } from "@insuros/domain";
import { canAssignSales } from "@insuros/domain";
import { mockSalesAgents, mockSalesAssignments } from "@insuros/mocks";

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
  async getAgents(): Promise<SalesAgent[]> {
    return mockSalesAgents;
  }

  async getAgent(id: string): Promise<SalesAgent | undefined> {
    return mockSalesAgents.find((agent) => agent.id === id);
  }

  /** Direct reports of a supervisor. */
  async getTeam(supervisorId: string): Promise<SalesAgent[]> {
    return mockSalesAgents.filter((agent) => agent.supervisorId === supervisorId);
  }

  async getAssignments(): Promise<SalesAssignment[]> {
    return mockSalesAssignments;
  }

  async getAssignmentsForAgent(agentId: string): Promise<SalesAssignment[]> {
    return mockSalesAssignments.filter(
      (assignment) => assignment.agentId === agentId
    );
  }

  /**
   * Create an assignment. The assigner must outrank the assignee and the
   * assignee must be in the assigner's reporting line.
   */
  async createAssignment(input: CreateAssignmentInput): Promise<AssignmentResult> {
    const superior = mockSalesAgents.find(
      (agent) => agent.id === input.assignedByAgentId
    );
    const subordinate = mockSalesAgents.find(
      (agent) => agent.id === input.agentId
    );

    if (!superior || !subordinate) {
      return { ok: false, error: "Unknown superior or subordinate agent." };
    }

    if (!canAssignSales(superior.rank, subordinate.rank)) {
      return {
        ok: false,
        error: `A ${superior.rank} cannot assign a ${subordinate.rank}.`
      };
    }

    if (!this.isInReportingLine(subordinate, superior.id)) {
      return {
        ok: false,
        error: "Agent is not in the assigner's reporting line."
      };
    }

    const assignment: SalesAssignment = {
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
    };

    mockSalesAssignments.push(assignment);

    return { ok: true, assignment };
  }

  private isInReportingLine(agent: SalesAgent, superiorId: string): boolean {
    let current: SalesAgent | undefined = agent;

    while (current?.supervisorId) {
      if (current.supervisorId === superiorId) {
        return true;
      }
      current = mockSalesAgents.find((item) => item.id === current?.supervisorId);
    }

    return false;
  }
}
