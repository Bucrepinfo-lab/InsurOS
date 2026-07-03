import { mockFinance, mockFinanceWorkflows } from "@insuros/mocks";

export class FinanceService {
  async getFinanceOverview() {
    return mockFinance;
  }

  async getFinanceWorkflows() {
    return mockFinanceWorkflows;
  }

  async getFinanceWorkflow(financeId: string) {
    return mockFinanceWorkflows.find((workflow) => workflow.financeId === financeId);
  }
}
