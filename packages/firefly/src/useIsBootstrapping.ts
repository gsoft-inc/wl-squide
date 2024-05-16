import { useAppRouterState } from "./AppRouterContext.ts";

export function useIsBootstrapping() {
    const { isAppReady, isUnauthorized } = useAppRouterState();

    return !isAppReady && !isUnauthorized;
}
