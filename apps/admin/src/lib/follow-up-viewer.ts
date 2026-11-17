import { principalStaffIds, type FollowUpViewer, type SessionPrincipal } from "@insuros/domain";
import { actorIdFor } from "./record-scope";

/** Who is looking at the follow-up queue, from the SERVER session only. */
export function followUpViewerFor(principal: SessionPrincipal): FollowUpViewer {
  return {
    userIds: [...new Set([...principalStaffIds(principal), actorIdFor(principal)])].filter(Boolean),
    roleIds: [
      ...new Set(
        principal.assignments.filter((assignment) => assignment.status === "Active").map((assignment) => assignment.roleId)
      )
    ],
    isPlatformOwner: principal.isPlatformOwner === true
  };
}
