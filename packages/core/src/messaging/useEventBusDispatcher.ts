import { useCallback } from "react";
import { useEventBus } from "../runtime/useEventBus.ts";
import type { EventName } from "./eventBus.ts";

export function useEventBusDispatcher<TEventNames extends EventName>() {
    const eventBus = useEventBus<TEventNames>();

    return useCallback((eventName: TEventNames, data?: unknown) => {
        eventBus.dispatch(eventName, data);
    }, [eventBus]);
}
