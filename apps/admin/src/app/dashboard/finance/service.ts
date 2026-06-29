import { mockFinanceTransactions } from "@insuros/mocks";

export class FinanceService {
  async getTransactions() {
    return mockFinanceTransactions;
  }
}