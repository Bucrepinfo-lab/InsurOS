import { mockFinanceTransactions, mockFinanceWorkflows } from "@insuros/mocks";

export class FinanceService {
  async getFinanceTransactions() {
    return mockFinanceTransactions;
  }

  async getFinanceWorkflows() {
    return mockFinanceWorkflows;
  }

  async getFinanceWorkflow(financeId: string) {
    return mockFinanceWorkflows.find((workflow) => workflow.financeId === financeId);
  }
}
