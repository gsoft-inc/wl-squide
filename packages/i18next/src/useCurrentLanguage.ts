import { useRuntime } from "@squide/core";
import { useMemo } from "react";
import { getI18nextPlugin, type i18nextPlugin } from "./i18nextPlugin.ts";

export function useCurrentLanguage() {
    const runtime = useRuntime();

    return useMemo(() => {
        const plugin = getI18nextPlugin(runtime) as i18nextPlugin;

        return plugin.currentLanguage;
    }, [runtime]);
}
