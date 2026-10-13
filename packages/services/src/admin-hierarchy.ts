import type { AdminAppointment, AdminLevel, AdminRegion } from "@insuros/domain";
import { canAdminister } from "@insuros/domain";
import { getPersistence } from "./persistence";

export interface AppointAdminInput {
  userId: string;
  userName: string;
  email: string;
  regionId: string;
  roleId: string;
  appointedByUserId: string;
}

export interface AppointmentResult {
  ok: boolean;
  error?: string;
  appointment?: AdminAppointment;
}

/**
 * Admin hierarchy service, backed by the persistence ports — the reference
 * pattern for migrating services off direct mock imports.
 */
export class AdminHierarchyService {
  private get db() {
    return getPersistence();
  }

  async getRegions(): Promise<AdminRegion[]> {
    return this.db.regions.findAll();
  }

  async getRegion(id: string): Promise<AdminRegion | undefined> {
    return this.db.regions.findById(id);
  }

  async getChildRegions(parentRegionId: string): Promise<AdminRegion[]> {
    return this.db.regions.findWhere(
      (region) => region.parentRegionId === parentRegionId
    );
  }

  async getRegionsByLevel(level: AdminLevel): Promise<AdminRegion[]> {
    return this.db.regions.findWhere((region) => region.level === level);
  }

  async getJurisdictionChain(regionId: string): Promise<AdminRegion[]> {
    const chain: AdminRegion[] = [];
    let current = await this.db.regions.findById(regionId);

    while (current) {
      chain.push(current);
      current = current.parentRegionId
        ? await this.db.regions.findById(current.parentRegionId)
        : undefined;
    }

    return chain;
  }

  async getAppointments(): Promise<AdminAppointment[]> {
    return this.db.appointments.findAll();
  }

  async getAppointmentsForRegion(regionId: string): Promise<AdminAppointment[]> {
    return this.db.appointments.findWhere(
      (appointment) => appointment.regionId === regionId
    );
  }

  async appointAdmin(input: AppointAdminInput): Promise<AppointmentResult> {
    const region = await this.db.regions.findById(input.regionId);

    if (!region) {
      return { ok: false, error: `Unknown region: ${input.regionId}` };
    }

    const [appointerAppointment] = await this.db.appointments.findWhere(
      (appointment) =>
        appointment.userId === input.appointedByUserId &&
        appointment.status === "Active"
    );

    if (!appointerAppointment) {
      return { ok: false, error: "Appointer has no active appointment." };
    }

    if (!canAdminister(appointerAppointment.level, region.level)) {
      return {
        ok: false,
        error: `A ${appointerAppointment.level} admin cannot appoint a ${region.level} admin.`
      };
    }

    const appointment = await this.db.appointments.insert({
      id: `appointment-${Date.now()}`,
      userId: input.userId,
      userName: input.userName,
      email: input.email,
      regionId: region.id,
      level: region.level,
      roleId: input.roleId,
      appointedBy: input.appointedByUserId,
      appointedAt: new Date().toISOString(),
      status: "Pending"
    });

    return { ok: true, appointment };
  }
}
