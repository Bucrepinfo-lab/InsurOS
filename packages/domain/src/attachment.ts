export type AttachmentModule =
  | 'Marketplace'
  | 'Customers'
  | 'Policies'
  | 'Claims'
  | 'Finance'
  | 'Operations'
  | 'Identity';

export type AttachmentStatus = 'Uploaded' | 'Verified' | 'Rejected';

export interface PlatformAttachment {
  id: string;
  module: AttachmentModule;
  entityId: string;
  entityReference: string;
  fileName: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  status: AttachmentStatus;
}