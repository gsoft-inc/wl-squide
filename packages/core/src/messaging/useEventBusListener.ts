import type { AddListenerOptions, EventBusListener } from "./eventBus.ts";
import { useEffect } from "react";
import { useEventBus } from "../runtime/useEventBus.ts";

export function useEventBusListener<EventNames extends string = string>(eventName: EventNames, callback: EventBusListener, { once }: AddListenerOptions = {}) {
    const eventBus = useEventBus<EventNames>();

    return useEffect(() => {
        eventBus.addListener(eventName, callback, { once });

        return () => {
            eventBus.removeListener(eventName, callback, { once });
        };
    }, [eventName, callback, once]);
}
