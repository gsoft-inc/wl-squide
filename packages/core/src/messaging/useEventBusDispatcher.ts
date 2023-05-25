import { useEventBus } from "../runtime/useEventBus.ts";

export function useEventBusDispatcher<EventTypes extends string>() {
    const eventBus = useEventBus<EventTypes>();

    return eventBus.dispatch;
}
