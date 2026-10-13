import type { IsoDateTime, ModuleScoped, ReferencedEntity } from './base';
import type { PlatformModule } from './modules';

export interface PlatformComment
  extends ReferencedEntity,
    ModuleScoped<PlatformModule> {
  body: string;
  author: string;
  createdAt: IsoDateTime;
}
