import type {
  WorkflowTransitionAction,
  WorkflowTransitionRule
} from "@insuros/domain";

import { WorkflowAuthorizationService } from "./workflow-authorization";
import { WorkflowValidator } from "./workflow-validator";

export interface WorkflowExecutionResult {
  success: boolean;
  nextStatus?: string;
  reason?: string;
}

export class WorkflowEngine {
  private readonly validator = new WorkflowValidator();
  private readonly authorization = new WorkflowAuthorizationService();

  execute(
    workflowType: string,
    currentStatus: string,
    action: WorkflowTransitionAction,
    rules: WorkflowTransitionRule[],
    userRoles: string[] = [],
    requiredRoles: string[] = []
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

    if (requiredRoles.length > 0) {
      const authorization = this.authorization.authorize(
        userRoles,
        action,
        requiredRoles
      );

      if (!authorization.authorized) {
        return {
          success: false,
          reason: authorization.reason
        };
      }
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
