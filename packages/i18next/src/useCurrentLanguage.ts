import { useRuntime } from "@squide/core";
import { useMemo } from "react";
import { getI18nPlugin2, type i18nextPlugin2 } from "./i18nextPlugin2.ts";

export function useCurrentLanguage() {
    const runtime = useRuntime();

    return useMemo(() => {
        const plugin = getI18nPlugin2(runtime) as i18nextPlugin2;

        return plugin.currentLanguage;
    }, [runtime]);
}
