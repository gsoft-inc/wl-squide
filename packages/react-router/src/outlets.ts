import type { Route } from "./routeRegistry.ts";

export const ManagedRoutesOutletName = "__squide-managed-routes-outlet__";

export const ManagedRoutes: Route = {
    $name: ManagedRoutesOutletName
};

export function isManagedRoutesOutletRoute(route: Route) {
    return route.$name === ManagedRoutesOutletName;
}
