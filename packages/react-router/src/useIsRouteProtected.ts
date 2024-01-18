import { Route } from "./routeRegistry.ts";

export function useIsRouteProtected(route?: Route) {
    if (!route) {
        // HACK:
        // An unregistrered route will be considered as "protected" by default to facilitate the implementation of deferred routes.
        // The issue is that when there's a direct hit on a deferred route, it cannot be determined whether or not a deferred route is public or protected
        // because the deferred route hasn't been registered yet (since it's a deferred route).
        // If that deferred route depends on protected data, if we don't return "true" here, the deferred route will be registered without providing the protected data
        // which will cause a runtime error.
        return true;
    }

    if (route.path === "*") {
        // HACK:
        // With the current AppRouter implementation, when there's a direct hit to a deferred route, since the route has not been registered yet to
        // the React Router router instance, the router is trying to render the no match route which confuse this hook as it would return a boolean value
        // for the visibility of the no match route (which is usually public) rather than the visiblity of the route asked by the consumer (which may be
        // protected). To circumvent this issue, true is returned for no match route. Anyway, that would really make sense to direct hit the no match route.
        return true;
    }

    return route.$visibility === "protected";
}
