import {
  checkProfileChange,
  checkWorkEmail,
  hasOpenRequest,
  sniffImage,
  toE164,
  type ProfileChangeField,
  type ProfileChangeRequest,
  type StaffProfile
} from "@insuros/domain";
import { getPersistence, resolveTenantId } from "./persistence";
import { photoStorage, type PhotoStorage } from "./photo-storage";
import type { AuthStore } from "./auth/store";

/**
 * My record (owner 27/11/26). The person changes their own photo and work
 * email at once. Their name and sign-in number change through a request with
 * a reason, decided at Governance by someone who manages access, and recorded.
 */

const MAX_PHOTO_BYTES = 2_000_000;
type Result<T = undefined> = { ok: true; value: T } | { ok: false; error: string };

export interface ProfilePerson {
  userId: string;
  userName: string;
  phone: string;
  regionId: string;
}

export interface MyProfileView {
  email: string | null;
  photoUrl: string | null;
  requests: ProfileChangeRequest[];
}

export class StaffProfileService {
  constructor(private readonly storage: PhotoStorage = photoStorage()) {}

  private get db() {
    return getPersistence();
  }

  private async profile(userId: string): Promise<StaffProfile | undefined> {
    return (await this.db.staffProfiles.findById(userId)) ?? undefined;
  }

  private async save(userId: string, patch: Partial<StaffProfile>, now: Date): Promise<void> {
    const existing = await this.profile(userId);
    const updatedAt = now.toISOString();
    if (existing) await this.db.staffProfiles.update(userId, { ...patch, updatedAt });
    else await this.db.staffProfiles.insert({ id: userId, ...patch, updatedAt });
  }

  async view(userId: string): Promise<MyProfileView> {
    const [profile, requests] = await Promise.all([
      this.profile(userId),
      this.db.profileChangeRequests.findWhere((r) => r.userId === userId)
    ]);
    const photoUrl = profile?.photoPath ? await this.storage.link(profile.photoPath, 900) : null;
    return {
      email: profile?.email ?? null,
      photoUrl,
      requests: requests.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)).slice(0, 5)
    };
  }

  async setEmail(userId: string, raw: string, now: Date = new Date()): Promise<Result<string | null>> {
    const checked = checkWorkEmail(raw);
    if (!checked.ok) return checked;
    await this.save(userId, { email: checked.value ?? undefined }, now);
    return { ok: true, value: checked.value };
  }

  /** A JPEG already shrunk on the phone. Old photos are kept privately; the newest is shown. */
  async setPhoto(userId: string, bytes: Uint8Array, now: Date = new Date()): Promise<Result> {
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_PHOTO_BYTES) return { ok: false, error: "Choose a photo under 2 MB." };
    if (sniffImage(bytes) !== "image/jpeg") return { ok: false, error: "That file is not a photo. Choose a JPG photo." };
    if (!/^[A-Za-z0-9_-]{1,80}$/.test(userId)) return { ok: false, error: "Your record could not be found." };
    const tenantId = await resolveTenantId();
    const path = `staff-photos/${tenantId}/${userId}/${now.getTime()}.jpg`;
    await this.storage.put(path, bytes, "image/jpeg");
    await this.save(userId, { photoPath: path }, now);
    return { ok: true, value: undefined };
  }

  async removePhoto(userId: string, now: Date = new Date()): Promise<void> {
    if (await this.profile(userId)) await this.save(userId, { photoPath: undefined }, now);
  }

  async request(person: ProfilePerson, field: ProfileChangeField, to: string, reason: string, now: Date = new Date()): Promise<Result<ProfileChangeRequest>> {
    const current = field === "name" ? person.userName : person.phone;
    const checked = checkProfileChange(field, current, to, reason);
    if (!checked.ok) return checked;
    const all = await this.db.profileChangeRequests.findAll();
    if (hasOpenRequest(all, person.userId, field)) return { ok: false, error: "You already have a request waiting. It will be answered at Governance." };
    if (field === "phone") {
      const taken = await this.db.appointments.findWhere((a) => a.phone === checked.value.to && a.status !== "Revoked");
      if (taken.length) return { ok: false, error: "That number already signs in to InsurOS. Ask the person who manages access." };
    }
    const request: ProfileChangeRequest = {
      id: `profile-change-${person.userId}-${field}-${now.getTime()}`,
      userId: person.userId,
      userName: person.userName,
      phone: person.phone,
      regionId: person.regionId,
      field,
      from: current,
      to: checked.value.to,
      reason: checked.value.reason,
      status: "Pending",
      requestedAt: now.toISOString()
    };
    await this.db.profileChangeRequests.insert(request);
    return { ok: true, value: request };
  }

  /** Requests waiting in the regions this person may administer (all, for a platform owner). */
  async pending(regionIds: string[] | "all"): Promise<ProfileChangeRequest[]> {
    const rows = await this.db.profileChangeRequests.findWhere(
      (r) => r.status === "Pending" && (regionIds === "all" || regionIds.includes(r.regionId))
    );
    return rows.sort((a, b) => a.requestedAt.localeCompare(b.requestedAt));
  }

  /**
   * Decide a request. Approving a name renames every appointment and grant of
   * that person. Approving a number moves their appointments and PIN to the
   * new number (same record, same PIN) and signs out every phone they used.
   */
  async decide(
    input: { id: string; approve: boolean; decidedBy: string; deciderUserId: string; note?: string; regionIds: string[] | "all" },
    auth: AuthStore,
    now: Date = new Date()
  ): Promise<Result<ProfileChangeRequest>> {
    const request = await this.db.profileChangeRequests.findById(input.id);
    if (!request || request.status !== "Pending") return { ok: false, error: "That request is no longer waiting." };
    if (input.regionIds !== "all" && !input.regionIds.includes(request.regionId)) return { ok: false, error: "That request is not in your regions." };
    if (request.userId === input.deciderUserId) return { ok: false, error: "Someone else decides your own request." };
    const at = now.toISOString();

    if (!input.approve) {
      const note = (input.note ?? "").trim().slice(0, 300) || undefined;
      await this.db.profileChangeRequests.update(request.id, { status: "Declined", decidedBy: input.decidedBy, decidedAt: at, note });
      return { ok: true, value: { ...request, status: "Declined", decidedBy: input.decidedBy, decidedAt: at, note } };
    }

    const appointments = await this.db.appointments.findWhere((a) => a.userId === request.userId && a.status !== "Revoked");
    if (request.field === "name") {
      for (const a of appointments) await this.db.appointments.update(a.id, { userName: request.to });
      const grants = await this.db.jurisdictionAssignments.findWhere((g) => g.userId === request.userId);
      for (const g of grants) await this.db.jurisdictionAssignments.update(g.id, { userName: request.to });
    } else {
      const to = toE164(request.to);
      if (!to) return { ok: false, error: "The new number is not valid." };
      const taken = await this.db.appointments.findWhere((a) => a.phone === to && a.status !== "Revoked" && a.userId !== request.userId);
      if (taken.length) return { ok: false, error: "That number now signs in for someone else. Decline and ask them for another number." };
      for (const a of appointments) await this.db.appointments.update(a.id, { phone: to, email: `${to}@phone.insuros` });
      const pin = await auth.getPin(request.userId);
      if (pin) await auth.putPin({ ...pin, phone: to, updatedAt: at });
      for (const device of await auth.listDevicesForUser(request.userId)) {
        if (!device.revokedAt) await auth.revokeDevice(device.id, at);
      }
    }
    await this.db.profileChangeRequests.update(request.id, { status: "Approved", decidedBy: input.decidedBy, decidedAt: at });
    return { ok: true, value: { ...request, status: "Approved", decidedBy: input.decidedBy, decidedAt: at } };
  }
}
