import type { AddListenerOptions, EventCallbackFunction, EventTypes } from "./eventBus.ts";
import { useEffect } from "react";
import { useEventBus } from "../runtime/useEventBus.ts";

export function useEventBusListener<EventNames extends EventTypes = EventTypes>(eventName: EventNames, callback: EventCallbackFunction, { once }: AddListenerOptions = {}) {
    const eventBus = useEventBus<EventNames>();

    return useEffect(() => {
        eventBus.addListener(eventName, callback, { once });

        return () => {
            eventBus.removeListener(eventName, callback, { once });
        };
    }, [eventName, callback, once]);
}
