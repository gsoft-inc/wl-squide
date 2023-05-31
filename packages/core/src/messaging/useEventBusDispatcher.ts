import type { EventName } from "./eventBus.ts";
import { useEventBus } from "../runtime/useEventBus.ts";

export function useEventBusDispatcher<TEventNames extends EventName>() {
    const eventBus = useEventBus<TEventNames>();

    return eventBus.dispatch;
}