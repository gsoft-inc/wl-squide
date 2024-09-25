import { useRuntime } from "@squide/core";
import { getEnvironmentVariablesPlugin } from "./EnvironmentVariablesPlugin.ts";
import type { EnvironmentVariablesRegistryKey } from "./EnvironmentVariablesRegistry.ts";

export function useEnvironmentVariable(key: EnvironmentVariablesRegistryKey) {
    const runtime = useRuntime();
    const plugin = getEnvironmentVariablesPlugin(runtime);

    return plugin.getVariable(key);
}

export function useEnvironmentVariables() {
    const runtime = useRuntime();
    const plugin = getEnvironmentVariablesPlugin(runtime);

    return plugin.getVariables();
}
