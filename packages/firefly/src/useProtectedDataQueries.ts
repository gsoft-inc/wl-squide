import { useQueries, type QueriesOptions, type QueriesResults, type UseQueryResult } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useAppRouterDispatcher, useAppRouterState } from "./AppRouterContext.ts";
import { useCanFetchProtectedData } from "./useCanFetchProtectedData.ts";

export type IsUnauthorizedErrorCallback = (error: unknown) => boolean;

// This converts an array of UseQueryResult to an array of the data type of each query result.
// For more information, view: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-1.html#mapped-types-on-tuples-and-arrays.
type MapUseQueryResultToData<T> = { [K in keyof T]: T[K] extends UseQueryResult<infer U> ? U : never };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useProtectedDataQueries<T extends Array<any>>(queries: QueriesOptions<T>, isUnauthorizedError: IsUnauthorizedErrorCallback): MapUseQueryResultToData<QueriesResults<T>> {
    const {
        isProtectedDataReady,
        isUnauthorized
    } = useAppRouterState();

    const canFetchProtectedData = useCanFetchProtectedData();

    const dispatch = useAppRouterDispatcher();

    const { data, isReady } = useQueries({
        queries: queries.map(x => ({
            enabled: canFetchProtectedData,
            throwOnError: (error: unknown) => {
                if (isProtectedDataReady || isUnauthorized) {
                    return false;
                }

                if (isUnauthorizedError(error)) {
                    // Will transition the state to allow the routes to render even if the bootstrapping is not complete, because otherwise
                    // a login page for example could not be rendered.
                    dispatch({ type: "is-unauthorized" });

                    // A React Router error boundary cannot redirect to a page. Therefore, the redirection should be done by a custom
                    // Aunthentication Boundary in consumer code, so there's no need to throw for 401 errors.
                    return false;
                }

                return true;
            },
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
