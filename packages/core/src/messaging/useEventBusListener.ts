import { type AddListenerOptions, type EventCallbackFunction, type EventName } from "./eventBus.ts";

import { useEffect } from "react";
import { useEventBus } from "../runtime/useEventBus.ts";

export function useEventBusListener(eventName: EventName, callback: EventCallbackFunction, { once }: AddListenerOptions = {}) {
    const eventBus = useEventBus();

    return useEffect(() => {
        eventBus.addListener(eventName, callback, { once });

        return () => {
            eventBus.removeListener(eventName, callback, { once });
        };
    }, [eventName, callback, once]);
}
