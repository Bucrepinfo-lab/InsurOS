import type { JoinCodeRecord, PinRecord, TrustedDevice } from "@insuros/domain";
import type { AuthStore } from "../auth/store";
import type { SqlClient } from "./postgres-adapter";

const iso = (value: unknown): string => new Date(value as string).toISOString();
const isoOrNull = (value: unknown): string | null => (value ? iso(value) : null);

interface DeviceRow {
  id: string;
  user_id: string;
  phone: string;
  secret_hash: string;
  label: string;
  created_at: unknown;
  last_used_at: unknown;
  revoked_at: unknown;
}

function toDevice(row: DeviceRow): TrustedDevice {
  return {
    id: row.id,
    userId: row.user_id,
    phone: row.phone,
    secretHash: row.secret_hash,
    label: row.label,
    createdAt: iso(row.created_at),
    lastUsedAt: iso(row.last_used_at),
    revokedAt: isoOrNull(row.revoked_at)
  };
}

interface PinRow {
  user_id: string;
  phone: string;
  pin_hash: string | null;
  failed_attempts: number;
  locked_at: unknown;
  updated_at: unknown;
}

function toPin(row: PinRow): PinRecord {
  return {
    userId: row.user_id,
    phone: row.phone,
    pinHash: row.pin_hash,
    failedAttempts: Number(row.failed_attempts),
    lockedAt: isoOrNull(row.locked_at),
    updatedAt: iso(row.updated_at)
  };
}

interface JoinCodeRow {
  id: string;
  phone: string;
  code_hash: string;
  issued_by: string;
  created_at: unknown;
  expires_at: unknown;
  used_at: unknown;
  tries: number;
}

function toJoinCode(row: JoinCodeRow): JoinCodeRecord {
  return {
    id: row.id,
    phone: row.phone,
    codeHash: row.code_hash,
    issuedBy: row.issued_by,
    createdAt: iso(row.created_at),
    expiresAt: iso(row.expires_at),
    usedAt: isoOrNull(row.used_at),
    tries: Number(row.tries)
  };
}

/** PostgreSQL sign-in store (tables from migrations v2 and v3). */
export class PostgresAuthStore implements AuthStore {
  constructor(
    private readonly sql: SqlClient,
    private readonly ready: () => Promise<unknown>
  ) {}

  private async q() {
    await this.ready();
    return this.sql;
  }

  async recordEvent(kind: string, key: string, at: string) {
    const sql = await this.q();
    await sql`insert into auth_rate_events (kind, key, created_at) values (${kind}, ${key}, ${at})`;
  }
  async countEvents(kind: string, key: string, sinceIso: string) {
    const sql = await this.q();
    const rows = await sql<{ n: string }>`
      select count(*)::text as n from auth_rate_events
      where kind = ${kind} and key = ${key} and created_at >= ${sinceIso}`;
    return Number(rows[0]?.n ?? 0);
  }
  async lastEventAt(kind: string, key: string) {
    const sql = await this.q();
    const rows = await sql<{ created_at: unknown }>`
      select created_at from auth_rate_events where kind = ${kind} and key = ${key}
      order by created_at desc, id desc limit 1`;
    return rows[0] ? iso(rows[0].created_at) : undefined;
  }

  async pruneEvents(beforeIso: string) {
    const sql = await this.q();
    await sql`delete from auth_rate_events where created_at < ${beforeIso}`;
  }

  async getPin(userId: string) {
    const sql = await this.q();
    const rows = await sql<PinRow>`select * from auth_user_pins where user_id = ${userId}`;
    return rows[0] ? toPin(rows[0]) : undefined;
  }
  async getPinByPhone(phone: string) {
    const sql = await this.q();
    const rows = await sql<PinRow>`select * from auth_user_pins where phone = ${phone} order by updated_at desc limit 1`;
    return rows[0] ? toPin(rows[0]) : undefined;
  }
  async putPin(record: PinRecord) {
    const sql = await this.q();
    await sql`
      insert into auth_user_pins (user_id, phone, pin_hash, failed_attempts, locked_at, updated_at)
      values (${record.userId}, ${record.phone}, ${record.pinHash}, ${record.failedAttempts}, ${record.lockedAt}, ${record.updatedAt})
      on conflict (user_id) do update set
        phone = excluded.phone, pin_hash = excluded.pin_hash, failed_attempts = excluded.failed_attempts,
        locked_at = excluded.locked_at, updated_at = excluded.updated_at`;
  }
  async deletePin(userId: string) {
    const sql = await this.q();
    await sql`delete from auth_user_pins where user_id = ${userId}`;
  }

  async createDevice(device: TrustedDevice) {
    const sql = await this.q();
    await sql`
      insert into auth_trusted_devices (id, user_id, phone, secret_hash, label, created_at, last_used_at, revoked_at)
      values (${device.id}, ${device.userId}, ${device.phone}, ${device.secretHash}, ${device.label},
              ${device.createdAt}, ${device.lastUsedAt}, ${device.revokedAt})`;
  }
  async getDevice(id: string) {
    const sql = await this.q();
    const rows = await sql<DeviceRow>`select * from auth_trusted_devices where id = ${id}`;
    return rows[0] ? toDevice(rows[0]) : undefined;
  }
  async touchDevice(id: string, at: string) {
    const sql = await this.q();
    await sql`update auth_trusted_devices set last_used_at = ${at} where id = ${id} and revoked_at is null`;
  }
  async revokeDevice(id: string, at: string) {
    const sql = await this.q();
    await sql`update auth_trusted_devices set revoked_at = ${at} where id = ${id} and revoked_at is null`;
  }
  async listDevicesForUser(userId: string) {
    const sql = await this.q();
    const rows = await sql<DeviceRow>`select * from auth_trusted_devices where user_id = ${userId} order by created_at`;
    return rows.map(toDevice);
  }
  async listDevicesForPhone(phone: string) {
    const sql = await this.q();
    const rows = await sql<DeviceRow>`select * from auth_trusted_devices where phone = ${phone} order by created_at`;
    return rows.map(toDevice);
  }

  async createJoinCode(record: JoinCodeRecord) {
    const sql = await this.q();
    await sql`
      insert into auth_join_codes (id, phone, code_hash, issued_by, created_at, expires_at, used_at, tries)
      values (${record.id}, ${record.phone}, ${record.codeHash}, ${record.issuedBy}, ${record.createdAt},
              ${record.expiresAt}, ${record.usedAt}, ${record.tries})`;
  }
  async listOpenJoinCodes(phone: string) {
    const sql = await this.q();
    const rows = await sql<JoinCodeRow>`
      select * from auth_join_codes where phone = ${phone} and used_at is null order by created_at desc`;
    return rows.map(toJoinCode);
  }
  async addJoinCodeTry(id: string) {
    const sql = await this.q();
    await sql`update auth_join_codes set tries = tries + 1 where id = ${id}`;
  }
  async useJoinCode(id: string, at: string) {
    const sql = await this.q();
    await sql`update auth_join_codes set used_at = ${at} where id = ${id} and used_at is null`;
  }
  async closeJoinCodes(phone: string, at: string) {
    const sql = await this.q();
    await sql`update auth_join_codes set used_at = ${at} where phone = ${phone} and used_at is null`;
  }
}
