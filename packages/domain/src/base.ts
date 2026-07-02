export type EntityId = string;
export type IsoDateTime = string;

export interface BaseEntity {
  id: EntityId;
}

export interface TimestampedEntity extends BaseEntity {
  createdAt: IsoDateTime;
  updatedAt?: IsoDateTime;
}

export interface ReferencedEntity extends BaseEntity {
  entityId: EntityId;
  entityReference: string;
}

export interface ActorStamped {
  actor: string;
}

export interface ModuleScoped<TModule extends string = string> {
  module: TModule;
}
