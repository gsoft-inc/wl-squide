import { useEventBus } from "../runtime/useEventBus.ts";
import type { ValidEventTypes } from "./eventBus.ts";

export function useEventBusDispatcher<EventTypes extends ValidEventTypes>() {
    const eventBus = useEventBus<EventTypes>();

    return eventBus.dispatch;
}
