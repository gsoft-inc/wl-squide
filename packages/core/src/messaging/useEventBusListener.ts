import type { AddListenerOptions, EventListener, EventNames, ValidEventTypes } from "./eventBus.ts";
import { useEffect } from "react";
import { useEventBus } from "../runtime/useEventBus.ts";

export function useEventBusListener<EventTypes extends ValidEventTypes = string | symbol>(eventName: EventNames<EventTypes>, callback: EventListener<EventTypes>, { once }: AddListenerOptions = {}) {
    const eventBus = useEventBus<EventTypes>();

    return useEffect(() => {
        eventBus.addListener(eventName, callback, { once });

        return () => {
            eventBus.removeListener(eventName, callback, { once });
        };
    }, [eventName, callback, once]);
}
