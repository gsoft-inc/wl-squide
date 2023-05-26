import type { EventBus, EventName } from "../messaging/eventBus.ts";

import { useRuntime } from "./RuntimeContext.ts";

export function useEventBus<TEventNames extends EventName>() {
    const runtime = useRuntime();

    return runtime.eventBus as unknown as EventBus<TEventNames>;
}
