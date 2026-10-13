import type { PlatformEvent } from "@insuros/domain";

export type PlatformEventHandler = (event: PlatformEvent) => Promise<void> | void;

export class PlatformEventDispatcher {
  private readonly handlers = new Map<string, PlatformEventHandler[]>();

  subscribe(eventType: string, handler: PlatformEventHandler) {
    const handlers = this.handlers.get(eventType) ?? [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }

  async dispatch(event: PlatformEvent) {
    const handlers = this.handlers.get(event.eventType) ?? [];

    for (const handler of handlers) {
      await handler(event);
    }

    return {
      eventId: event.id,
      dispatchedHandlers: handlers.length
    };
  }
}
