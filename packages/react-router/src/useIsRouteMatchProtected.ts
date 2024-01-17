import { useRouteMatch } from "./useRouteMatch.ts";

export interface UseIsRouteMatchProtectedOptions {
    throwWhenThereIsNoMatch?: boolean;
}

export function useIsRouteMatchProtected(locationArg: Partial<Location>, { throwWhenThereIsNoMatch = true } = {}) {
    const activeRoute = useRouteMatch(locationArg);

    if (!activeRoute) {
        if (throwWhenThereIsNoMatch) {
            throw new Error(`[squide] There's no matching route for the location: "${locationArg.pathname}". Did you add routes to React Router without using the runtime.registerRoute() function?`);
        }

        // An unregistrered route will be considered as "protected" by default to facilitate the implementation of deferred routes.
        // The issue is that when there's a direct hit on a deferred route, it cannot be determined whether or not a deferred route is public or protected
        // because the deferred route hasn't been registered yet (since it's a deferred route).
        // If that deferred route depends on protected data, if we don't return "true" here, the deferred route will be registered without providing the protected data
        // which will cause a runtime error.
        return true;
    }

    return activeRoute.$visibility === "protected";
}
