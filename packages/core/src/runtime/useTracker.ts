import { useRuntime } from "./RuntimeContext.ts";

export function useTracker() {
    const runtime = useRuntime();

    return runtime.tracker;
}

export function useTrackers(names: string[]) {
    const runtime = useRuntime();

    return runtime.tracker.use(names);
}
