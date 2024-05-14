import { useAppRouterState } from "./AppRouterContext.ts";

export function useIsAppReady() {
    const { isAppReady } = useAppRouterState();

    return isAppReady;
}
