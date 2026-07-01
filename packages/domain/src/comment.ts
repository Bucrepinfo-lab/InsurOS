export type CommentModule =
  | 'Marketplace'
  | 'Customers'
  | 'Policies'
  | 'Claims'
  | 'Finance'
  | 'Operations'
  | 'Identity';

export interface PlatformComment {
  id: string;
  module: CommentModule;
  entityId: string;
  entityReference: string;
  body: string;
  author: string;
  createdAt: string;
}