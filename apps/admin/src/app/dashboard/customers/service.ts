import { mockCustomers } from "@insuros/mocks";

export class CustomerService {
  async getCustomers() {
    return mockCustomers;
  }

  async getCustomer(id: string) {
    return mockCustomers.find((c) => c.id === id);
  }
}