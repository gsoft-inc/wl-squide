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

        return false;
    }

    return activeRoute.$visibility === "protected";
}
