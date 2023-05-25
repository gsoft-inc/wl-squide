import type { EventBus } from "../index.ts";
import { useRuntime } from "./RuntimeContext.ts";

export function useEventBus<EventTypes extends string>() {
    const runtime = useRuntime();

    return runtime.eventBus as unknown as EventBus<EventTypes>;
}
