import type { AdminAppointment, AdminLevel, AdminRegion } from "@insuros/domain";
import { canAdminister } from "@insuros/domain";
import { mockAdminAppointments, mockAdminRegions } from "@insuros/mocks";

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

export class AdminHierarchyService {
  async getRegions(): Promise<AdminRegion[]> {
    return mockAdminRegions;
  }

  async getRegion(id: string): Promise<AdminRegion | undefined> {
    return mockAdminRegions.find((region) => region.id === id);
  }

  async getChildRegions(parentRegionId: string): Promise<AdminRegion[]> {
    return mockAdminRegions.filter(
      (region) => region.parentRegionId === parentRegionId
    );
  }

  /** Regions by level, e.g. all counties. */
  async getRegionsByLevel(level: AdminLevel): Promise<AdminRegion[]> {
    return mockAdminRegions.filter((region) => region.level === level);
  }

  /** The full ancestor chain of a region, from itself up to Global. */
  async getJurisdictionChain(regionId: string): Promise<AdminRegion[]> {
    const chain: AdminRegion[] = [];
    let current = mockAdminRegions.find((region) => region.id === regionId);

    while (current) {
      chain.push(current);
      current = current.parentRegionId
        ? mockAdminRegions.find((region) => region.id === current?.parentRegionId)
        : undefined;
    }

    return chain;
  }

  async getAppointments(): Promise<AdminAppointment[]> {
    return mockAdminAppointments;
  }

  async getAppointmentsForRegion(regionId: string): Promise<AdminAppointment[]> {
    return mockAdminAppointments.filter(
      (appointment) => appointment.regionId === regionId
    );
  }

  /**
   * Appoint an admin to a region. The appointer must hold an active
   * appointment at a strictly higher level than the target region.
   */
  async appointAdmin(input: AppointAdminInput): Promise<AppointmentResult> {
    const region = mockAdminRegions.find((item) => item.id === input.regionId);

    if (!region) {
      return { ok: false, error: `Unknown region: ${input.regionId}` };
    }

    const appointerAppointment = mockAdminAppointments.find(
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

    const appointment: AdminAppointment = {
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
    };

    mockAdminAppointments.push(appointment);

    return { ok: true, appointment };
  }
}
