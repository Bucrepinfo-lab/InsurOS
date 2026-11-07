import type { PinRecord, TrustedDevice } from "@insuros/domain";

/**
 * Sign-in store — PLATFORM-LEVEL data (one identity can belong to any tenant),
 * so these tables carry no tenant_id/RLS by design (reviewed: identity, not
 * tenant business data). Never exposed to tenant queries.
 */
export interface AuthStore {
  recordEvent(kind: string, key: string, at: string): Promise<void>;
  countEvents(kind: string, key: string, sinceIso: string): Promise<number>;
  lastEventAt(kind: string, key: string): Promise<string | undefined>;
  /** Delete rate-limit/code events older than this time (retention). */
  pruneEvents(beforeIso: string): Promise<void>;

  getPin(userId: string): Promise<PinRecord | undefined>;
  putPin(record: PinRecord): Promise<void>;
  deletePin(userId: string): Promise<void>;

  createDevice(device: TrustedDevice): Promise<void>;
  getDevice(id: string): Promise<TrustedDevice | undefined>;
  touchDevice(id: string, at: string): Promise<void>;
  revokeDevice(id: string, at: string): Promise<void>;
  listDevicesForUser(userId: string): Promise<TrustedDevice[]>;
  listDevicesForPhone(phone: string): Promise<TrustedDevice[]>;
}

export class MemoryAuthStore implements AuthStore {
  private readonly events: { kind: string; key: string; at: string }[] = [];
  private readonly pins = new Map<string, PinRecord>();
  private readonly devices = new Map<string, TrustedDevice>();

  async recordEvent(kind: string, key: string, at: string) {
    this.events.push({ kind, key, at });
  }
  async countEvents(kind: string, key: string, sinceIso: string) {
    const since = new Date(sinceIso).getTime();
    return this.events.filter((e) => e.kind === kind && e.key === key && new Date(e.at).getTime() >= since).length;
  }
  async lastEventAt(kind: string, key: string) {
    const hits = this.events.filter((e) => e.kind === kind && e.key === key);
    return hits[hits.length - 1]?.at;
  }
  async pruneEvents(beforeIso: string) {
    const before = new Date(beforeIso).getTime();
    for (let i = this.events.length - 1; i >= 0; i -= 1) {
      if (new Date(this.events[i].at).getTime() < before) this.events.splice(i, 1);
    }
  }
  async getPin(userId: string) {
    const record = this.pins.get(userId);
    return record ? { ...record } : undefined;
  }
  async putPin(record: PinRecord) {
    this.pins.set(record.userId, { ...record });
  }
  async deletePin(userId: string) {
    this.pins.delete(userId);
  }
  async createDevice(device: TrustedDevice) {
    this.devices.set(device.id, { ...device });
  }
  async getDevice(id: string) {
    const device = this.devices.get(id);
    return device ? { ...device } : undefined;
  }
  async touchDevice(id: string, at: string) {
    const device = this.devices.get(id);
    if (device) device.lastUsedAt = at;
  }
  async revokeDevice(id: string, at: string) {
    const device = this.devices.get(id);
    if (device && !device.revokedAt) device.revokedAt = at;
  }
  async listDevicesForUser(userId: string) {
    return [...this.devices.values()].filter((d) => d.userId === userId).map((d) => ({ ...d }));
  }
  async listDevicesForPhone(phone: string) {
    return [...this.devices.values()].filter((d) => d.phone === phone).map((d) => ({ ...d }));
  }
}
