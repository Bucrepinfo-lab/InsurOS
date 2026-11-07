import { mockCustomerWorkflows } from "@insuros/mocks";
import { canSeeCustomer, type OwnedCustomer, type RecordReach } from "@insuros/domain";
import { getPersistence } from "../persistence";

export class CustomerService {
  /** Durable when DATABASE_URL is set (tenant-scoped). */
  async getCustomers() {
    return getPersistence().customers.findAll();
  }

  async getCustomer(id: string) {
    return getPersistence().customers.findById(id);
  }

  /** Customers this user may see (an Agent: only the customers they captured). */
  async getCustomersFor(reach: RecordReach): Promise<OwnedCustomer[]> {
    if (reach.kind === "none") return [];
    const customers = (await getPersistence().customers.findAll()) as OwnedCustomer[];
    return customers.filter((customer) => canSeeCustomer(reach, customer));
  }

  /** One customer, or undefined when it does not exist OR the user may not see it. */
  async getCustomerFor(reach: RecordReach, id: string): Promise<OwnedCustomer | undefined> {
    if (reach.kind === "none") return undefined;
    const customer = (await getPersistence().customers.findById(id)) as OwnedCustomer | undefined;
    return customer && canSeeCustomer(reach, customer) ? customer : undefined;
  }

  async getCustomerWorkflows() {
    return mockCustomerWorkflows;
  }

  async getCustomerWorkflow(customerId: string) {
    return mockCustomerWorkflows.find((workflow) => workflow.customerId === customerId);
  }
}
