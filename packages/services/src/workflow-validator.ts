import type {
  WorkflowTransitionAction,
  WorkflowTransitionRule
} from "@insuros/domain";

export interface WorkflowValidationResult {
  allowed: boolean;
  reason?: string;
}

export class WorkflowValidator {
  validate(
    workflowType: string,
    currentStatus: string,
    action: WorkflowTransitionAction,
    rules: WorkflowTransitionRule[]
  ): WorkflowValidationResult {
    const rule = rules.find(
      (r) =>
        r.workflowType === workflowType &&
        r.fromStatus === currentStatus &&
        r.action === action
    );

    if (!rule) {
      return {
        allowed: false,
        reason: "Transition is not permitted."
      };
    }

    return {
      allowed: true
    };
  }
}
