import type { WorkflowTransitionAction } from "@insuros/domain";

export interface WorkflowAuthorizationResult {
  authorized: boolean;
  reason?: string;
}

export class WorkflowAuthorizationService {
  authorize(
    userRoles: string[],
    action: WorkflowTransitionAction,
    requiredRoles: string[]
  ): WorkflowAuthorizationResult {
    const authorized = requiredRoles.some((role) => userRoles.includes(role));

    if (!authorized) {
      return {
        authorized: false,
        reason: "User is not authorized to perform this action."
      };
    }

    return {
      authorized: true
    };
  }
}
