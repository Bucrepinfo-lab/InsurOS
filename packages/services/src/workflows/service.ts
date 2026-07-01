import { mockWorkflows } from "@insuros/mocks";

export class WorkflowService {
  async getWorkflows() {
    return mockWorkflows;
  }

  async getWorkflow(id: string) {
    return mockWorkflows.find((workflow) => workflow.id === id);
  }

  async getEscalatedWorkflows() {
    return mockWorkflows.filter((workflow) => workflow.status === "Escalated");
  }
}