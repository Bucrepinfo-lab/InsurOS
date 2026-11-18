import {
  directoryFor,
  type AdminAppointment,
  type DirectoryEntry,
  type FollowUpViewer,
  type Participant,
  type SessionPrincipal
} from '@insuros/domain';
import { getPersistence } from '@insuros/services';
import { followUpViewerFor } from './follow-up-viewer';
import { actorIdFor } from './record-scope';

export interface Messenger {
  viewer: FollowUpViewer;
  me: Participant;
}

/** Who is writing, from the SERVER session only. */
export function messengerFor(principal: SessionPrincipal): Messenger {
  return {
    viewer: followUpViewerFor(principal),
    me: { userId: actorIdFor(principal), name: principal.name || 'Staff member' }
  };
}

/** The colleagues this person may start a conversation with, by the hierarchy. */
export async function directoryForPrincipal(principal: SessionPrincipal): Promise<DirectoryEntry[]> {
  const db = getPersistence();
  const [appointments, regions] = await Promise.all([db.appointments.findAll(), db.regions.findAll()]);
  const { viewer } = messengerFor(principal);
  const mine = appointments
    .filter((appointment: AdminAppointment) => appointment.status === 'Active' && viewer.userIds.includes(appointment.userId))
    .sort((a, b) => b.appointedAt.localeCompare(a.appointedAt));
  return directoryFor(mine[0] ?? null, appointments, regions, { isPlatformOwner: principal.isPlatformOwner === true });
}
