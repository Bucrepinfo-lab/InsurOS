import { mockCustomerWorkflows } from "@insuros/mocks";
import { getPersistence } from "../persistence";

export class CustomerService {
  /** Durable when DATABASE_URL is set (tenant-scoped). */
  async getCustomers() {
    return getPersistence().customers.findAll();
  }

  async getCustomer(id: string) {
    return getPersistence().customers.findById(id);
  }

  async getCustomerWorkflows() {
    return mockCustomerWorkflows;
  }

  async getCustomerWorkflow(customerId: string) {
    return mockCustomerWorkflows.find((workflow) => workflow.customerId === customerId);
  }
}
