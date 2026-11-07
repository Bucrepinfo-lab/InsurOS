import { createMemoryAdapter } from "../src";
import { persistenceContract } from "./persistence-contract";

persistenceContract("memory", (tenantId) => createMemoryAdapter({ tenantId, shareMocks: false }));
