import { useAppRouterState } from "./AppRouterContext.ts";

export function useCanCompleteRegistrations() {
    const { canCompleteRegistrations } = useAppRouterState();

    return canCompleteRegistrations;
}
