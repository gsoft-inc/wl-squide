import { isNil, useRuntime } from "@squide/core";
import { useMemo } from "react";
import { getI18nextPlugin } from "./i18nextPlugin.ts";

export function useI18nextPlugin() {
    const runtime = useRuntime();

    return useMemo(() => {
        const plugin = getI18nextPlugin(runtime);

        if (isNil(plugin)) {
            throw new Error("[squide] The i18nextPlugin is not registered. Did you forget to register the i18nextPlugin with the runtime?");
        }

        return plugin;
    }, [runtime]);
}
