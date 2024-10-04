import { useRuntime } from "./RuntimeContext.ts";

export function useLogger() {
    const runtime = useRuntime();

    return runtime.logger;
}

export function useLoggers(names: string[]) {
    const runtime = useRuntime();

    return runtime.logger.use(names);
}
