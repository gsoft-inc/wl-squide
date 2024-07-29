import { useAppRouterState } from "./AppRouterContext.ts";

export function useCanFetchProtectedData() {
    const {
        waitForMsw,
        areModulesRegistered,
        areModulesReady,
        isMswReady,
        isProtectedDataReady,
        isActiveRouteProtected
    } = useAppRouterState();

    return (
        // Always return true when the protected data has already been fetched sucessfully so TanStack Query can update the data in the background.
        isProtectedDataReady
        || (
            // Wait until the modules has been registered, but do not wait for the deferred registrations to be registered as they will probably
            // depends on the protected data.
            (areModulesRegistered || areModulesReady)
            // Only fetch the protected data for protected routes, aka do not fetch the protected data for public routes.
            && isActiveRouteProtected
            // Wait for MSW since the endpoints for the protected data might be an MSW endpoint when in development.
            && (!waitForMsw || isMswReady)
        )
    );
}
