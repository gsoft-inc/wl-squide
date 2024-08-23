import { useAppRouterState } from "./AppRouterContext.ts";

export function useIsBootstrapping() {
    const {
        waitForMsw,
        waitForPublicData,
        waitForProtectedData,
        areModulesReady,
        isMswReady,
        isPublicDataReady,
        isProtectedDataReady,
        isActiveRouteProtected,
        isUnauthorized
    } = useAppRouterState();

    const isAppReady = (
        !isUnauthorized
        // Wait until the modules has been registered and the deferred registrations has been registered if any.
        && areModulesReady
        // Not required but can sometimes prevent a re-render when the state value is somehow updated after the initial data is ready.
        && (!waitForMsw || isMswReady)
        // Wait for the initial data to be ready.
        && (!waitForPublicData || isPublicDataReady)
        && (!waitForProtectedData || !isActiveRouteProtected || isProtectedDataReady)
    );

    // When an API request returns a 401, the bootstrapping should be bypassed to render the login page.
    const flush = (
        // Only applicable when there's a unauthorized request while fetching the initial data.
        isUnauthorized
        // Not required but can sometimes prevent a re-render when the state value is somehow updated after the public data is ready.
        && (!waitForMsw || isMswReady)
        // If the application is loading public data, we want to wait for this data to be ready to prevent a re-render.
        && (!waitForPublicData || isPublicDataReady)
    );

    return !isAppReady && !flush;
}
