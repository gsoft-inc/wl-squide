import { useRuntime } from "./RuntimeContext.ts";

export function useService(name: string) {
    const runtime = useRuntime();

    return runtime.getService(name);
}
