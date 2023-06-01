import { useRuntime } from "./RuntimeContext.ts";

export function useServices() {
    const runtime = useRuntime();

    return runtime.services;
}
