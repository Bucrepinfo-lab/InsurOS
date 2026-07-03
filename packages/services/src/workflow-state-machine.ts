import type {
  WorkflowStateMachine,
  WorkflowStatus,
  WorkflowTransitionRule,
  WorkflowType
} from "@insuros/domain";

export class WorkflowStateMachineService {
  build(
    workflowType: WorkflowType,
    currentStatus: WorkflowStatus,
    rules: WorkflowTransitionRule[]
  ): WorkflowStateMachine {
    const allowedActions = rules
      .filter(
        (rule) =>
          rule.workflowType === workflowType &&
          rule.fromStatus === currentStatus
      )
      .map((rule) => rule.action);

    return {
      workflowType,
      currentStatus,
      allowedActions
    };
  }
}
