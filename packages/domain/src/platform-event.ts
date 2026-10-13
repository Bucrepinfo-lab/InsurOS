export type PlatformEventStatus =
  | "Pending"
  | "Processing"
  | "Completed"
  | "Failed";

export interface PlatformEvent {
  id: string;
  eventType: string;
  sourceModule: string;
  entityId: string;
  payload: Record<string, unknown>;
  status: PlatformEventStatus;
  createdAt: string;
}
