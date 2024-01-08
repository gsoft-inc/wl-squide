import { useRuntime } from "./RuntimeContext.ts";

export function usePlugin(pluginName: string) {
    const runtime = useRuntime();

    return runtime.getPlugin(pluginName);
}
