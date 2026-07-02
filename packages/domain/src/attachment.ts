import type { IsoDateTime, ModuleScoped, ReferencedEntity } from './base';

export type AttachmentModule =
  | 'Marketplace'
  | 'Customers'
  | 'Policies'
  | 'Claims'
  | 'Finance'
  | 'Operations'
  | 'Identity';

export type AttachmentStatus = 'Uploaded' | 'Verified' | 'Rejected';

export interface PlatformAttachment
  extends ReferencedEntity,
    ModuleScoped<AttachmentModule> {
  fileName: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: IsoDateTime;
  status: AttachmentStatus;
}
