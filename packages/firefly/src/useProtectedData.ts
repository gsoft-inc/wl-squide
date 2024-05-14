import { useCallback } from "react";
import { useAppRouterDispatcher, useAppRouterState } from "./AppRouterContext.ts";

export function useProtectedData() {
    const { canFetchProtectedData } = useAppRouterState();

    const dispatch = useAppRouterDispatcher();

    const setProtectedDataAsReady = useCallback(() => {
        dispatch({ type: "protected-data-ready" });
    }, [dispatch]);

    return { canFetchProtectedData, setProtectedDataAsReady };
}
