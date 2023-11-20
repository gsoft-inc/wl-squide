import { useRuntime } from "@squide/core";
import { useMemo } from "react";
import { getI18nextPlugin } from "./i18nextPlugin.ts";

export function useI18nextPlugin() {
    const runtime = useRuntime();

    return useMemo(() => {
        return getI18nextPlugin(runtime);
    }, [runtime]);
}
