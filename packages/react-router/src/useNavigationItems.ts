import { useRuntime } from "@squide/core";
import type { ReactRouterRuntime } from "./reactRouterRuntime.ts";

export interface UseNavigationItemsOptions {
    menuId?: string;
}

export function useNavigationItems({ menuId }: UseNavigationItemsOptions = {}) {
    const runtime = useRuntime() as ReactRouterRuntime;

    return runtime.getNavigationItems(menuId);
}
