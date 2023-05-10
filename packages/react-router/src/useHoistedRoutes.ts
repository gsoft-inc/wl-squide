import type { RootRoute, Route } from "./routeRegistry.ts";
import { useMemo, useState } from "react";

import { isNil } from "@squide/core";

export interface UseHoistedRoutesOptions {
    wrapManagedRoutes?: (routes: Route[]) => Route;
    allowedPaths?: string[];
}

function getAllRoutePaths(route: Route) {
    const current = route.path;

    if (!isNil(route.children)) {
        const childPaths = route.children.reduce((acc: string[], x: Route) => {
            acc.push(...getAllRoutePaths(x));

            return acc;
        }, []);

        if (!isNil(current)) {
            return [current, ...childPaths];
        }

        return childPaths;
    }

    return !isNil(current) ? [current] : [];
}

export function useHoistedRoutes(routes: RootRoute[], { wrapManagedRoutes, allowedPaths }: UseHoistedRoutesOptions = {}) {
    // Hack to reuse the same array reference through re-renders.
    const [memoizedAllowedPaths] = useState(allowedPaths);

    return useMemo(() => {
        const hoistedRoutes: Route[] = [];
        const managedRoutes: Route[] = [];

        routes.forEach(({ hoist, ...route }) => {
            if (hoist === true) {
                hoistedRoutes.push(route);
            } else {
                managedRoutes.push(route);
            }
        });

        if (memoizedAllowedPaths) {
            // Find hoisted routes which are not included in allowedPaths.
            hoistedRoutes.forEach(x => {
                const allRoutePaths = getAllRoutePaths(x);
                const restrictedPaths = allRoutePaths.filter(y => !memoizedAllowedPaths.includes(y));

                if (restrictedPaths.length > 0) {
                    throw new Error(`[squide] A module is hoisting the following routes [${restrictedPaths.map(y => `"${y}"`).join(", ")}] which are not included in the provided "allowedRoutes" option.`);
                }
            });
        }

        const allRoutes = [
            ...hoistedRoutes,
            ...(wrapManagedRoutes ? [wrapManagedRoutes(managedRoutes)] : managedRoutes)
        ];

        return allRoutes;
    }, [routes, wrapManagedRoutes, memoizedAllowedPaths]);
}
