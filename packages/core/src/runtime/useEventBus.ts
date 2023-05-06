import { AbstractRuntime } from "./abstractRuntime.ts";
import { useRuntime } from "./RuntimeContext.ts";

export function useEventBus() {
    const runtime = useRuntime() as AbstractRuntime;

    return runtime.eventBus;
}
