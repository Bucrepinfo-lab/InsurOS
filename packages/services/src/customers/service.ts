import { mockCustomerWorkflows, mockCustomers } from "@insuros/mocks";

export class CustomerService {
  async getCustomers() {
    return mockCustomers;
  }

  async getCustomer(id: string) {
    return mockCustomers.find((customer) => customer.id === id);
  }

  async getCustomerWorkflows() {
    return mockCustomerWorkflows;
  }

  async getCustomerWorkflow(customerId: string) {
    return mockCustomerWorkflows.find((workflow) => workflow.customerId === customerId);
  }
}
