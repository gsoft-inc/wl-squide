import { AbstractRuntime } from "./abstractRuntime.ts";
import { useRuntime } from "./RuntimeContext.ts";

export function useLogger() {
    const runtime = useRuntime() as AbstractRuntime;

    return runtime.logger;
}
