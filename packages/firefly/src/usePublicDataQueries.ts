import { useEventBus } from "@squide/core";
import { useQueries, type QueriesOptions, type QueriesResults, type UseQueryResult } from "@tanstack/react-query";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useAppRouterDispatcher } from "./AppRouterContext.ts";
import { GlobalDataQueriesError } from "./GlobalDataQueriesError.ts";
import { useCanFetchPublicData } from "./useCanFetchPublicData.ts";

export const PublicDataFetchStartedEvent = "squide-public-data-fetch-started";
export const PublicDataFetchFailedEvent = "squide-public-data-fetch-failed";

// This converts an array of UseQueryResult to an array of the data type of each query result.
// For more information, view: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-1.html#mapped-types-on-tuples-and-arrays.
type MapUseQueryResultToData<T> = { [K in keyof T]: T[K] extends UseQueryResult<infer U> ? U : never };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function usePublicDataQueries<T extends Array<any>>(queries: QueriesOptions<T>): MapUseQueryResultToData<QueriesResults<T>> {
    const canFetchPublicData = useCanFetchPublicData();
    const eventBus = useEventBus();

    const dispatch = useAppRouterDispatcher();

    // TODO: Add a comment explaining why useLayoutEffect
    useLayoutEffect(() => {
        if (canFetchPublicData) {
            eventBus.dispatch(PublicDataFetchStartedEvent);
        }
    }, [canFetchPublicData, eventBus]);

    const combineResults = useCallback((results: UseQueryResult<unknown, Error>[]) => {
        const errors = results.filter(x => x.error).map(x => x.error) as Error[];

        return {
            data: results.map(x => x.data) as MapUseQueryResultToData<QueriesResults<T>>,
            errors,
            hasErrors: errors.length > 0,
            isReady: results.length === queries.length && results.every(x => x.data)
        };
    }, [queries.length]);

    const { data, errors: queriesErrors, hasErrors, isReady } = useQueries({
        queries: queries.map(x => ({
            enabled: canFetchPublicData,
            ...x
        })),
        combine: combineResults
    });

    // useEffect(() => {
    //     if (canFetchPublicData) {
    //         eventBus.dispatch(PublicDataFetchStartedEvent);
    //     }
    // }, [canFetchPublicData, eventBus]);

    useEffect(() => {
        if (hasErrors) {
            queriesErrors.forEach(x => {
                eventBus.dispatch(PublicDataFetchFailedEvent, x);
            });

            throw new GlobalDataQueriesError("[squide] Global public data queries failed.", queriesErrors);
        }
    }, [hasErrors, queriesErrors, eventBus]);

    const isReadyRef = useRef(false);

    useEffect(() => {
        if (isReadyRef.current && data) {
            dispatch({ type: "public-data-updated" });
        }
    }, [data, dispatch]);

    useEffect(() => {
        if (isReady && !isReadyRef.current) {
            isReadyRef.current = true;

            dispatch({ type: "public-data-ready" });
        }
    }, [isReady, dispatch]);

    return data;
}
