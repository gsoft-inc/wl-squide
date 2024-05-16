import { useQueries, type QueriesOptions } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAppRouterDispatcher, useAppRouterState } from "./AppRouterContext.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function usePublicDataQueries<T extends Array<any>>(queries: QueriesOptions<T>) {
    const { canFetchPublicData, isPublicDataReady } = useAppRouterState();

    const dispatch = useAppRouterDispatcher();

    const { data, isReady } = useQueries({
        queries: queries.map(x => ({
            enabled: canFetchPublicData,
            throwOnError: !isPublicDataReady,
            ...x
        })),
        combine: results => {
            return {
                data: results.map(x => x.data),
                isReady: results.length === queries.length && results.every(x => x.data)
            };
        }
    });

    useEffect(() => {
        if (isReady) {
            dispatch({ type: "public-data-ready" });
        }
    }, [isReady, dispatch]);

    return data;
}
