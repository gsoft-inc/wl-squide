import { useRuntime } from "@squide/core";
import type { ReactRouterRuntime } from "./reactRouterRuntime.ts";

export function useNavigationItems(menuId?: string) {
    const runtime = useRuntime() as ReactRouterRuntime;

    return runtime.getNavigationItems(menuId);
}
