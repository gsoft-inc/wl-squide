import { useCallback } from "react";
import { useAppRouterDispatcher, useAppRouterState } from "./AppRouterContext.ts";

export function usePublicData() {
    const { canFetchPublicData } = useAppRouterState();

    const dispatch = useAppRouterDispatcher();

    const setPublicDataAsReady = useCallback(() => {
        dispatch({ type: "public-data-ready" });
    }, [dispatch]);

    return { canFetchPublicData, setPublicDataAsReady };
}
