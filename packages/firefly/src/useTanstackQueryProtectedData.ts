import { useAppRouterState } from "./AppRouterContext.ts";
import { useProtectedData } from "./useProtectedData.ts";

export type IsUnauthorizedErrorCallback = (error: unknown) => boolean;

export function useTanstackQueryProtectedData(isUnauthorizedError: IsUnauthorizedErrorCallback) {
    const { canFetchProtectedData, setProtectedDataAsReady } = useProtectedData();
    const { isProtectedDataReady } = useAppRouterState();

    const queryOptions = {
        enabled: canFetchProtectedData,
        throwOnError: (error: unknown) => {
            if (isProtectedDataReady) {
                return false;
            }

            // When an error like a 401 is thrown by a query, since "throwOnError" is true, it should be caught by a root error boundary
            // that would redirect to a login page. To render this login page, React will re-render the AppRouter component and the
            // BootstrappingRoute component which will throw an error again if "throwOnError" remains true and cause an infinite loop.
            // To fix this, when an error is thrown, we mark the protected data as ready (which will also allow the app to render another route),
            // and we instruct Tanstack Query to throw the error only if the protected data are not ready yet.
            if (isUnauthorizedError(error)) {
                setProtectedDataAsReady();
            }

            return true;
        }
    };

    return { protectedQueryOptions: queryOptions, canFetchProtectedData, setProtectedDataAsReady };
}
