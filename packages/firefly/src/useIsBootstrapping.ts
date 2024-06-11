import { useAppRouterState } from "./AppRouterContext.ts";

export function useIsBootstrapping() {
    const {
        isAppReady,
        isAppReadyForUnauthorizedRequest
    } = useAppRouterState();

    return !isAppReady && !isAppReadyForUnauthorizedRequest;
}
