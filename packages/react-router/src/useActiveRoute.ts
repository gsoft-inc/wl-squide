import { matchRoutes } from "react-router-dom";
import { useRoutes } from "./useRoutes.ts";

export function useActiveRoute(locationArg: Partial<Location>) {
    const routes = useRoutes();

    const matchingRoutes = matchRoutes(routes, locationArg) ?? [];

    if (matchingRoutes.length > 0) {
        // When a route is nested, it also returns all the parts that constituate the whole route (for example the layouts and the boundaries).
        // We only want to know the visiblity of the actual route that has been requested, which is always the last entry.
        return matchingRoutes[matchingRoutes.length - 1]!.route;
    }

    return undefined;
}

export function useIsActiveRouteProtected(locationArg: Partial<Location>) {
    const activeRoute = useActiveRoute(locationArg);

    if (!activeRoute) {
        throw new Error(`[squide] There's no matching route for the location: "${locationArg.pathname}". Did you add routes to React Router without using the runtime.registerRoute() function?`);
    }

    return activeRoute.visibility === "authenticated";
}
