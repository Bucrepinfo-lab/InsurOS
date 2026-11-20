import type { JoinCodeRecord, PinRecord, TrustedDevice } from "@insuros/domain";

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
  /** The PIN record for a sign-in phone (newest if a number was reused). */
  getPinByPhone(phone: string): Promise<PinRecord | undefined>;
  putPin(record: PinRecord): Promise<void>;
  deletePin(userId: string): Promise<void>;

  createDevice(device: TrustedDevice): Promise<void>;
  getDevice(id: string): Promise<TrustedDevice | undefined>;
  touchDevice(id: string, at: string): Promise<void>;
  revokeDevice(id: string, at: string): Promise<void>;
  listDevicesForUser(userId: string): Promise<TrustedDevice[]>;
  listDevicesForPhone(phone: string): Promise<TrustedDevice[]>;

  /** Joining codes (owner 20/11/26: no SMS). */
  createJoinCode(record: JoinCodeRecord): Promise<void>;
  /** Open (unused) codes for a phone, newest first. */
  listOpenJoinCodes(phone: string): Promise<JoinCodeRecord[]>;
  addJoinCodeTry(id: string): Promise<void>;
  useJoinCode(id: string, at: string): Promise<void>;
  /** Close every unused code for a phone (a new code replaces them). */
  closeJoinCodes(phone: string, at: string): Promise<void>;
}

export class MemoryAuthStore implements AuthStore {
  private readonly events: { kind: string; key: string; at: string }[] = [];
  private readonly pins = new Map<string, PinRecord>();
  private readonly devices = new Map<string, TrustedDevice>();
  private readonly codes = new Map<string, JoinCodeRecord>();

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
  async getPinByPhone(phone: string) {
    const hits = [...this.pins.values()].filter((p) => p.phone === phone).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return hits[0] ? { ...hits[0] } : undefined;
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
  async createJoinCode(record: JoinCodeRecord) {
    this.codes.set(record.id, { ...record });
  }
  async listOpenJoinCodes(phone: string) {
    return [...this.codes.values()]
      .filter((c) => c.phone === phone && !c.usedAt)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((c) => ({ ...c }));
  }
  async addJoinCodeTry(id: string) {
    const code = this.codes.get(id);
    if (code) code.tries += 1;
  }
  async useJoinCode(id: string, at: string) {
    const code = this.codes.get(id);
    if (code && !code.usedAt) code.usedAt = at;
  }
  async closeJoinCodes(phone: string, at: string) {
    for (const code of this.codes.values()) if (code.phone === phone && !code.usedAt) code.usedAt = at;
  }
}
