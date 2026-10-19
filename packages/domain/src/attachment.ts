import type { IsoDateTime, ModuleScoped, ReferencedEntity } from './base';
import type { PlatformModule } from './modules';

export type AttachmentStatus = 'Uploaded' | 'Verified' | 'Rejected';

export interface PlatformAttachment
  extends ReferencedEntity,
    ModuleScoped<PlatformModule> {
  fileName: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: IsoDateTime;
  status: AttachmentStatus;
}
