import { useRuntime } from "@squide/core";
import { useCallback } from "react";
import { getI18nextPlugin, type i18nextPlugin } from "./i18nextPlugin.ts";

export function useChangeLanguage<T extends string>() {
    const runtime = useRuntime();

    return useCallback((language: T) => {
        const plugin = getI18nextPlugin(runtime) as i18nextPlugin<T>;

        return plugin.changeLanguage(language);
    }, [runtime]);
}
