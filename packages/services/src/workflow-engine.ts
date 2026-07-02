import type {
  WorkflowTransitionAction,
  WorkflowTransitionRule
} from "@insuros/domain";

import { WorkflowValidator } from "./workflow-validator";

export interface WorkflowExecutionResult {
  success: boolean;
  nextStatus?: string;
  reason?: string;
}

export class WorkflowEngine {
  private readonly validator = new WorkflowValidator();

  execute(
    workflowType: string,
    currentStatus: string,
    action: WorkflowTransitionAction,
    rules: WorkflowTransitionRule[]
  ): WorkflowExecutionResult {
    const validation = this.validator.validate(
      workflowType,
      currentStatus,
      action,
      rules
    );

    if (!validation.allowed) {
      return {
        success: false,
        reason: validation.reason
      };
    }

    const rule = rules.find(
      (r) =>
        r.workflowType === workflowType &&
        r.fromStatus === currentStatus &&
        r.action === action
    );

    return {
      success: true,
      nextStatus: rule?.toStatus
    };
  }
}
