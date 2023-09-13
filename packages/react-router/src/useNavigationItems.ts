import { useRuntime } from "@squide/core";
import type { Runtime } from "./runtime.ts";

export function useNavigationItems(menuId?: string) {
    const runtime = useRuntime() as Runtime;

    return runtime.getNavigationItems(menuId);
}
