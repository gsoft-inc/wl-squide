import { useEventBus } from "../runtime/useEventBus.ts";
import type { EventTypes } from "./eventBus.ts";

export function useEventBusDispatcher<EventNames extends EventTypes>() {
    const eventBus = useEventBus<EventNames>();

    return eventBus.dispatch;
}
