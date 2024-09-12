import type { NonIndexRoute, Route } from "./routeRegistry.ts";

export const PublicRoutesOutletName = "__squide-public-routes-outlet__";

export const PublicRoutes: NonIndexRoute = {
    $visibility: "public",
    $name: PublicRoutesOutletName
};

export function isPublicRoutesOutletRoute(route: Route) {
    return route.$name === PublicRoutesOutletName;
}

export const ProtectedRoutesOutletName = "__squide-protected-routes-outlet__";

export const ProtectedRoutes: NonIndexRoute = {
    $visibility: "protected",
    $name: ProtectedRoutesOutletName
};

export function isProtectedRoutesOutletRoute(route: Route) {
    return route.$name === ProtectedRoutesOutletName;
}
