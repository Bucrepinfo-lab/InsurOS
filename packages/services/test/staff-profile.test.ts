import { describe, expect, it } from "vitest";
import { MemoryAuthStore, MemoryPhotoStorage, StaffProfileService, getPersistence } from "../src";

const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);

async function person(tag: string) {
  const db = getPersistence();
  const phone = `+2547${String(Date.now()).slice(-8)}`;
  const userId = `staff-profile-${tag}-${Date.now()}`;
  await db.appointments.insert({
    id: `appointment-${userId}`, userId, userName: "Wanjiru Kamau", email: `${phone}@phone.insuros`, phone,
    regionId: "region-ke", level: "Country", roleId: "agent", appointedBy: "owner", appointedAt: "2026-11-01T00:00:00Z", status: "Active"
  } as never);
  return { userId, userName: "Wanjiru Kamau", phone, regionId: "region-ke" };
}

describe("StaffProfileService (My record)", () => {
  it("lets a person set their own work email and photo at once", async () => {
    const me = await person("self");
    const service = new StaffProfileService(new MemoryPhotoStorage());
    expect(await service.setEmail(me.userId, "Wanjiru@Agency.co.ke")).toEqual({ ok: true, value: "wanjiru@agency.co.ke" });
    expect((await service.setPhoto(me.userId, jpeg)).ok).toBe(true);
    const view = await service.view(me.userId);
    expect(view.email).toBe("wanjiru@agency.co.ke");
    expect(view.photoUrl).toMatch(/^data:image\/jpeg;base64,/);
    expect((await service.setPhoto(me.userId, new TextEncoder().encode("hello"))).ok).toBe(false);
    await service.removePhoto(me.userId);
    expect((await service.view(me.userId)).photoUrl).toBeNull();
  });

  it("changes a name only after someone else approves it, everywhere it appears", async () => {
    const me = await person("name");
    const service = new StaffProfileService(new MemoryPhotoStorage());
    const asked = await service.request(me, "name", "Wanjiru Njoroge", "Married, new ID issued");
    expect(asked.ok).toBe(true);
    if (!asked.ok) return;
    expect((await service.request(me, "name", "Wanjiru N.", "again please")).ok).toBe(false);
    const auth = new MemoryAuthStore();
    expect((await service.decide({ id: asked.value.id, approve: true, decidedBy: "me", deciderUserId: me.userId, regionIds: "all" }, auth)).ok).toBe(false);
    expect((await service.decide({ id: asked.value.id, approve: true, decidedBy: "owner", deciderUserId: "owner", regionIds: ["elsewhere"] }, auth)).ok).toBe(false);
    const done = await service.decide({ id: asked.value.id, approve: true, decidedBy: "owner", deciderUserId: "owner", regionIds: "all" }, auth);
    expect(done).toMatchObject({ ok: true, value: { status: "Approved", decidedBy: "owner" } });
    const [appointment] = await getPersistence().appointments.findWhere((a) => a.userId === me.userId);
    expect(appointment!.userName).toBe("Wanjiru Njoroge");
  });

  it("moves an approved number with the same record and PIN, and signs out old phones", async () => {
    const me = await person("phone");
    const service = new StaffProfileService(new MemoryPhotoStorage());
    const auth = new MemoryAuthStore();
    await auth.putPin({ userId: me.userId, phone: me.phone, pinHash: "hash", failedAttempts: 0, lockedAt: null, updatedAt: "2026-11-01T00:00:00Z" });
    await auth.createDevice({ id: `dev-${me.userId}`, userId: me.userId, phone: me.phone, secretHash: "x", label: "phone", createdAt: "2026-11-01T00:00:00Z", lastUsedAt: "2026-11-01T00:00:00Z", revokedAt: null });
    const asked = await service.request(me, "phone", "0799 000 111", "Old line was stolen");
    expect(asked.ok).toBe(true);
    if (!asked.ok) return;
    const done = await service.decide({ id: asked.value.id, approve: true, decidedBy: "owner", deciderUserId: "owner", regionIds: "all" }, auth);
    expect(done.ok).toBe(true);
    const [appointment] = await getPersistence().appointments.findWhere((a) => a.userId === me.userId);
    expect(appointment!.phone).toBe("+254799000111");
    expect((await auth.getPinByPhone("+254799000111"))?.userId).toBe(me.userId);
    expect((await auth.listDevicesForUser(me.userId)).every((d) => d.revokedAt)).toBe(true);
  });

  it("records a decline with its reason", async () => {
    const me = await person("decline");
    const service = new StaffProfileService(new MemoryPhotoStorage());
    const asked = await service.request(me, "name", "Wanjiru Wambui", "Prefer my middle name");
    if (!asked.ok) throw new Error(asked.error);
    const done = await service.decide({ id: asked.value.id, approve: false, note: "Bring your ID to the office", decidedBy: "owner", deciderUserId: "owner", regionIds: "all" }, new MemoryAuthStore());
    expect(done).toMatchObject({ ok: true, value: { status: "Declined", note: "Bring your ID to the office" } });
    expect((await service.view(me.userId)).requests[0]).toMatchObject({ status: "Declined" });
  });
});
