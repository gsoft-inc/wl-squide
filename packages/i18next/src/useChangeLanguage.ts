import { useRuntime } from "@squide/core";
import { useCallback } from "react";
import { getI18nPlugin2, type i18nextPlugin2 } from "./i18nextPlugin2.ts";

export function useChangeLanguage<T extends string>() {
    const runtime = useRuntime();

    return useCallback((language: T) => {
        const plugin = getI18nPlugin2(runtime) as i18nextPlugin2<T>;

        return plugin.changeLanguage(language);
    }, [runtime]);
}
