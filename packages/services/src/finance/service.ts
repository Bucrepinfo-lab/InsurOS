import { mockFinanceTransactions } from "@insuros/mocks";

export class FinanceService {
  async getTransactions() {
    return mockFinanceTransactions;
  }

  async getTransaction(id: string) {
    return mockFinanceTransactions.find((transaction) => transaction.id === id);
  }
}
