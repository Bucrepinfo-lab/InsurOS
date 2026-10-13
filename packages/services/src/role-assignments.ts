import { mockRoleAssignments } from "@insuros/mocks";

export class RoleAssignmentService {
  async getRoleAssignments() {
    return mockRoleAssignments;
  }

  async getAssignmentsForUser(userId: string) {
    return mockRoleAssignments.filter(
      (assignment) => assignment.userId === userId
    );
  }

  async getAssignmentsForRole(roleId: string) {
    return mockRoleAssignments.filter(
      (assignment) => assignment.roleId === roleId
    );
  }
}
