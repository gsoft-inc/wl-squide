import { useEventBus } from "@squide/core";
import { useQueries, type QueriesOptions, type QueriesResults, type UseQueryResult } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { useAppRouterDispatcher, useAppRouterState } from "./AppRouterContext.ts";
import { GlobalDataQueriesError } from "./GlobalDataQueriesError.ts";
import { useCanFetchProtectedData } from "./useCanFetchProtectedData.ts";

export const ProtectedDataFetchStartedEvent = "squide-protected-data-fetch-started";
export const ProtectedDataFetchFailedEvent = "squide-protected-data-fetch-failed";

export type IsUnauthorizedErrorCallback = (error: unknown) => boolean;

// This converts an array of UseQueryResult to an array of the data type of each query result.
// For more information, view: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-1.html#mapped-types-on-tuples-and-arrays.
type MapUseQueryResultToData<T> = { [K in keyof T]: T[K] extends UseQueryResult<infer U> ? U : never };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useProtectedDataQueries<T extends Array<any>>(queries: QueriesOptions<T>, isUnauthorizedError: IsUnauthorizedErrorCallback): MapUseQueryResultToData<QueriesResults<T>> {
    const canFetchProtectedData = useCanFetchProtectedData();
    const eventBus = useEventBus();

    const dispatch = useAppRouterDispatcher();

    const combineResults = useCallback((results: UseQueryResult<unknown, Error>[]) => {
        const errors = results.filter(x => x.error).map(x => x.error) as Error[];

        return {
            data: results.map(x => x.data) as MapUseQueryResultToData<QueriesResults<T>>,
            errors,
            hasErrors: errors.length > 0,
            isReady: !results.some(x => x.isPending)
        };
    }, []);

    const { data, errors: queriesErrors, hasErrors, isReady } = useQueries({
        queries: queries.map(x => ({
            enabled: canFetchProtectedData,
            ...x
        })),
        combine: combineResults
    });

    useEffect(() => {
        if (canFetchProtectedData) {
            eventBus.dispatch(ProtectedDataFetchStartedEvent);
        }
    }, [canFetchProtectedData, eventBus]);

    const {
        isProtectedDataReady,
        isUnauthorized
    } = useAppRouterState();

    useEffect(() => {
        if (hasErrors) {
            if (!isProtectedDataReady && !isUnauthorized && queriesErrors.some(x => isUnauthorizedError(x))) {
                // Will transition the state to allow the routes to render even if the bootstrapping is not complete, because otherwise
                // a login page for example could not be rendered.
                dispatch({ type: "is-unauthorized" });
            }

            // Otherwise, when a user is logged off, a refetch might throws a 401.
            if (!queriesErrors.every(x => isUnauthorizedError(x))) {
                queriesErrors.forEach(x => {
                    eventBus.dispatch(ProtectedDataFetchFailedEvent, x);
                });

                throw new GlobalDataQueriesError("[squide] Global protected data queries failed.", queriesErrors);
            }
        }
    }, [hasErrors, queriesErrors, isProtectedDataReady, isUnauthorized, isUnauthorizedError, dispatch, eventBus]);

    const isReadyRef = useRef(false);

    useEffect(() => {
        if (isReadyRef.current && data) {
            dispatch({ type: "protected-data-updated" });
        }
    }, [data, dispatch]);

    useEffect(() => {
        if (isReady) {
            isReadyRef.current = true;

            dispatch({ type: "protected-data-ready" });
        }
    }, [isReady, dispatch]);

    return data;
}
