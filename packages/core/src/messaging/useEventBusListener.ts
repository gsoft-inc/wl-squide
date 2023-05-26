import type { AddListenerOptions, EventCallbackFunction, EventName } from "./eventBus.ts";

import { useEffect } from "react";
import { useEventBus } from "../runtime/useEventBus.ts";

export function useEventBusListener<TEventNames extends EventName = EventName>(eventName: TEventNames, callback: EventCallbackFunction, { once }: AddListenerOptions = {}) {
    const eventBus = useEventBus<TEventNames>();

    return useEffect(() => {
        eventBus.addListener(eventName, callback, { once });

        return () => {
            eventBus.removeListener(eventName, callback, { once });
        };
    }, [eventName, callback, once]);
}
