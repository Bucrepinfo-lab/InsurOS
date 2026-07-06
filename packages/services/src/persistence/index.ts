import { createMemoryAdapter } from "./memory-adapter";
import type { PersistenceAdapter } from "./ports";

export * from "./ports";
export { createMemoryAdapter } from "./memory-adapter";

let adapter: PersistenceAdapter | undefined;

const env = (
  globalThis as { process?: { env?: Record<string, string | undefined> } }
).process?.env;

/**
 * Persistence factory. Returns the process-wide adapter:
 *
 * - `DATABASE_URL` unset -> in-memory adapter over mock datasets (default).
 * - `DATABASE_URL` set -> PostgreSQL via Drizzle (adapter lands with the
 *   DigitalOcean provisioning step; schema in `persistence/schema.sql`).
 *
 * Services must obtain repositories through this factory so backends can
 * be swapped without touching business logic.
 */
export function getPersistence(): PersistenceAdapter {
  if (!adapter) {
    if (env?.DATABASE_URL) {
      console.warn(
        "[insuros] DATABASE_URL is set but the postgres adapter is not yet wired; using memory adapter."
      );
    }

    adapter = createMemoryAdapter();
  }

  return adapter;
}
