import { type EventName } from "./eventBus.ts";
import { useEventBus } from "../runtime/useEventBus.ts";

export function useEventBusDispatcher() {
    const eventBus = useEventBus();

    return (eventName: EventName, data?: unknown) => {
        eventBus.dispatch(eventName, data);
    };
}
