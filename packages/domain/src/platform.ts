import type { ActorStamped, IsoDateTime, ModuleScoped, ReferencedEntity } from './base';

export type ActivityModule =
  | 'Marketplace'
  | 'Customers'
  | 'Policies'
  | 'Claims'
  | 'Finance'
  | 'Operations'
  | 'Identity';

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
    ModuleScoped<ActivityModule>,
    ActorStamped {
  type: ActivityType;
  title: string;
  description: string;
  occurredAt: IsoDateTime;
}
