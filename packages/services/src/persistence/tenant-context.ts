import { DEFAULT_TENANT_ID } from "@insuros/domain";

/**
 * Which tenant the current request acts for. The app registers a resolver that
 * reads the SERVER session (never client input); services stay unaware.
 * Stored on globalThis so every server bundle shares one resolver.
 */
export type TenantResolver = () => Promise<string>;

const KEY = Symbol.for("insuros.tenantResolver");
type Holder = { [KEY]?: TenantResolver };

export function setTenantResolver(resolver: TenantResolver | undefined): void {
  (globalThis as Holder)[KEY] = resolver;
}

export async function resolveTenantId(): Promise<string> {
  const resolver = (globalThis as Holder)[KEY];
  if (!resolver) return DEFAULT_TENANT_ID;
  try {
    const tenantId = await resolver();
    return tenantId || DEFAULT_TENANT_ID;
  } catch {
    return DEFAULT_TENANT_ID;
  }
}
