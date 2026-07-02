import type { IsoDateTime, ModuleScoped, ReferencedEntity } from './base';

export type CommentModule =
  | 'Marketplace'
  | 'Customers'
  | 'Policies'
  | 'Claims'
  | 'Finance'
  | 'Operations'
  | 'Identity';

export interface PlatformComment
  extends ReferencedEntity,
    ModuleScoped<CommentModule> {
  body: string;
  author: string;
  createdAt: IsoDateTime;
}
