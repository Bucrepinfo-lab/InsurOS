import type { ActorStamped, IsoDateTime, ModuleScoped, ReferencedEntity } from './base';
import type { PlatformModule } from './modules';

export type AuditAction =
  | 'Create'
  | 'Update'
  | 'Delete'
  | 'Approve'
  | 'Reject'
  | 'Assign'
  | 'Upload'
  | 'Download'
  | 'Login'
  | 'Logout';

export interface AuditRecord
  extends ReferencedEntity,
    ModuleScoped<PlatformModule>,
    ActorStamped {
  action: AuditAction;
  timestamp: IsoDateTime;
  details: string;
}
