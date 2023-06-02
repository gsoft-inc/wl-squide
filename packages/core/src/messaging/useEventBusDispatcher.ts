import type { EventName } from "./eventBus.ts";
import { useCallback } from "react";
import { useEventBus } from "../runtime/useEventBus.ts";

export function useEventBusDispatcher<TEventNames extends EventName>() {
    const eventBus = useEventBus<TEventNames>();

    return useCallback((eventName: TEventNames, data?: unknown) => {
        eventBus.dispatch(eventName, data);
    }, [eventBus]);
}
