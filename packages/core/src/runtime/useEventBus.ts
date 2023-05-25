import type { EventBus, EventTypes } from "../messaging/eventBus.ts";
import { useRuntime } from "./RuntimeContext.ts";

export function useEventBus<EventNames extends EventTypes>() {
    const runtime = useRuntime();

    return runtime.eventBus as unknown as EventBus<EventNames>;
}
