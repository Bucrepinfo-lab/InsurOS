import {
  mockWorkflowTasks,
  mockWorkflowTransitions,
  mockWorkflowTransitionRules,
  mockWorkflows
} from "@insuros/mocks";

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

  async getTasks() {
    return mockWorkflowTasks;
  }

  async getTask(id: string) {
    return mockWorkflowTasks.find((task) => task.id === id);
  }

  async getTasksByWorkflow(workflowId: string) {
    return mockWorkflowTasks.filter((task) => task.workflowId === workflowId);
  }

  async getBlockedTasks() {
    return mockWorkflowTasks.filter((task) => task.status === "Blocked");
  }

  async getTransitions() {
    return mockWorkflowTransitions;
  }

  async getTransitionsByWorkflow(workflowId: string) {
    return mockWorkflowTransitions.filter((transition) => transition.workflowId === workflowId);
  }

  async getTransitionRules() {
    return mockWorkflowTransitionRules;
  }

  async getTransitionRulesByWorkflowType(workflowType: string) {
    return mockWorkflowTransitionRules.filter((rule) => rule.workflowType === workflowType);
  }
}
