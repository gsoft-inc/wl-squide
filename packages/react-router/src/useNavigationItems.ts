import { useRuntime } from "@squide/core";
import type { Runtime } from "./runtime.ts";

export function useNavigationItems(menuPath?: string) {
    const runtime = useRuntime() as Runtime;

    return runtime.getNavigationItems(menuPath);
}
