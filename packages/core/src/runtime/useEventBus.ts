import type { EventBus, ValidEventTypes } from "../index.ts";
import { useRuntime } from "./RuntimeContext.ts";

export function useEventBus<EventTypes extends ValidEventTypes>() {
    const runtime = useRuntime();

    return runtime.eventBus as unknown as EventBus<EventTypes>;
}
