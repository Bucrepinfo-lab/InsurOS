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

export interface ActivityEvent {
  id: string;
  module: ActivityModule;
  entityId: string;
  entityReference: string;
  type: ActivityType;
  title: string;
  description: string;
  actor: string;
  occurredAt: string;
}
