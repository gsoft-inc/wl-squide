import { useRuntime } from "./RuntimeContext.ts";

export function useRuntimeMode() {
    const runtime = useRuntime();

    return runtime.mode;
}
