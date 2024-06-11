import type { Route } from "./routeRegistry.ts";

export function useIsRouteProtected(route?: Route) {
    if (!route) {
        return true;
    }

    return route.$visibility === "protected";
}
