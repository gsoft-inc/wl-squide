import { useCallback, useMemo } from "react";
import { useAppRouterDispatcher, useAppRouterState } from "./AppRouterContext.ts";

export function useTanstackQueryProtectedData() {
    const { canFetchProtectedData, isProtectedDataReady } = useAppRouterState();

    const dispatch = useAppRouterDispatcher();

    const setProtectedDataAsReady = useCallback(() => {
        dispatch({ type: "protected-data-ready" });
    }, [dispatch]);

    const queryOptions = useMemo(() => ({
        enabled: canFetchProtectedData,
        throwOnError: () => {
            // When an error like a 401 is thrown by a query, since "throwOnError" is true, it should be caught by a root error boundary
            // that would redirect to a login page. To render this login page, React will re-render the AppRouter component and the
            // BootstrappingRoute component which will throw an error again if "throwOnError" remains true and cause an infinite loop.
            // To fix this, when an error is thrown, we mark the protected data as ready (which will also allow the app to render another route),
            // and we instruct Tanstack Query to throw the error only if the protected data are not ready yet.
            if (isProtectedDataReady) {
                return false;
            }

            // Hackish, but necessary at the moment. Read the previous comment for more information.
            setProtectedDataAsReady();

            return true;
        }
    }), [canFetchProtectedData, isProtectedDataReady, setProtectedDataAsReady]);

    return { queryOptions, setProtectedDataAsReady };
}
