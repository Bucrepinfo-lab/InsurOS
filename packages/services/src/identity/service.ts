import { mockIdentityWorkflows } from "@insuros/mocks";

export class IdentityService {
  async getIdentityWorkflows() {
    return mockIdentityWorkflows;
  }

  async getIdentityWorkflow(identityId: string) {
    return mockIdentityWorkflows.find((workflow) => workflow.identityId === identityId);
  }
}
