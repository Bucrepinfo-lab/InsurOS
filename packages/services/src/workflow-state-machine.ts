import type {
  WorkflowStateMachine,
  WorkflowTransitionRule
} from "@insuros/domain";

export class WorkflowStateMachineService {
  build(
    workflowType: string,
    currentStatus: string,
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
