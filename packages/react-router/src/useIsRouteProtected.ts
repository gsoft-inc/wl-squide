import { Route } from "./routeRegistry.ts";

export function useIsRouteProtected(route?: Route) {
    if (!route) {
        // HACK:
        // An unregistrered route is considered as "protected" by default to facilitate the implementation of deferred routes.
        // The issue is that when there's a direct hit on a deferred route, it cannot be determined whether or not a deferred route is public or protected
        // because the deferred route hasn't been registered yet (since it's a deferred route).
        // If that deferred route depends on protected data, if we don't return "true" here, the deferred route will be registered before the protected data
        // is loaded which will probably cause a runtime error.
        return true;
    }

    if (route.path === "*") {
        // HACK:
        // With the current AppRouter component implementation, when there's a direct hit to a deferred route, since the route has not been registered yet to
        // the React Router router instance, the router is trying to render the no match route. Therefore this hook returns the a boolean value based
        // on the visibility status of the no match route instead of the actual page request by the user.
        // To circumvent this issue, "true" is returned for the no match route.
        return true;
    }

    return route.$visibility === "protected";
}
