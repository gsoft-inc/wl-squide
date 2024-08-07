import { useRuntime } from "@squide/core";
import type { ReactRouterRuntime } from "./reactRouterRuntime.ts";

export interface UseNavigationItemsOptions {
    menuId?: string;
}

// This hook has been renamed from useNavigationItems to useRuntimeNavigationItems to free up the name for the
// use useNavigationItems hook of the @squide/firefly package.
export function useRuntimeNavigationItems({ menuId }: UseNavigationItemsOptions = {}) {
    const runtime = useRuntime() as ReactRouterRuntime;

    return runtime.getNavigationItems(menuId);
}
