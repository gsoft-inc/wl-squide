import { useQueries, type QueriesOptions, type QueriesResults, type UseQueryResult } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useAppRouterDispatcher, useAppRouterState } from "./AppRouterContext.ts";
import { useCanFetchPublicData } from "./useCanFetchPublicData.ts";

// This converts an array of UseQueryResult to an array of the data type of each query result.
// For more information, view: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-1.html#mapped-types-on-tuples-and-arrays.
type MapUseQueryResultToData<T> = { [K in keyof T]: T[K] extends UseQueryResult<infer U> ? U : never };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function usePublicDataQueries<T extends Array<any>>(queries: QueriesOptions<T>): MapUseQueryResultToData<QueriesResults<T>> {
    const state = useAppRouterState();
    const canFetchPublicData = useCanFetchPublicData();

    const dispatch = useAppRouterDispatcher();

    const { data, isReady } = useQueries({
        queries: queries.map(x => ({
            enabled: canFetchPublicData,
            throwOnError: !state.isPublicDataReady,
            ...x
        })),
        combine: results => {
            return {
                data: results.map(x => x.data) as MapUseQueryResultToData<QueriesResults<T>>,
                isReady: results.length === queries.length && results.every(x => x.data)
            };
        }
    });

    const isReadyRef = useRef(false);

    useEffect(() => {
        if (isReadyRef.current && data) {
            dispatch({ type: "public-data-updated" });
        }
    }, [data, dispatch]);

    useEffect(() => {
        if (isReady) {
            isReadyRef.current = true;

            dispatch({ type: "public-data-ready" });
        }
    }, [isReady, dispatch]);

    return data;
}
