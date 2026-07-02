import type { ActorStamped, IsoDateTime, ModuleScoped, ReferencedEntity } from './base';
import type { PlatformModule } from './modules';

export type ActivityType =
  | 'Created'
  | 'Updated'
  | 'Submitted'
  | 'Approved'
  | 'Rejected'
  | 'Assigned'
  | 'Escalated'
  | 'Commented'
  | 'DocumentUploaded'
  | 'StatusChanged';

export interface ActivityEvent
  extends ReferencedEntity,
    ModuleScoped<PlatformModule>,
    ActorStamped {
  type: ActivityType;
  title: string;
  description: string;
  occurredAt: IsoDateTime;
}
