import { useQueries, type QueriesOptions, type QueriesResults, type UseQueryResult } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAppRouterDispatcher, useAppRouterState } from "./AppRouterContext.ts";

export type IsUnauthorizedErrorCallback2 = (error: unknown) => boolean;

// This converts an array of UseQueryResult to an array of the data type of each query result
type MapUseQueryResultToData<T> = { [K in keyof T]: T[K] extends UseQueryResult<infer U> ? U : never};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useProtectedDataQueries<T extends Array<any>>(queries: QueriesOptions<T>, isUnauthorizedError: IsUnauthorizedErrorCallback2) {
    const {
        canFetchProtectedData,
        isProtectedDataReady,
        isUnauthorized
    } = useAppRouterState();

    const dispatch = useAppRouterDispatcher();

    const { data, isReady } = useQueries({
        queries: queries.map(x => ({
            enabled: canFetchProtectedData,
            throwOnError: (error: unknown) => {
                if (isProtectedDataReady || isUnauthorized) {
                    return false;
                }

                // When a 401 status code is returned by a query, since "throwOnError" is true, it should be caught by a root error boundary
                // that will redirect the user to a login page. To render this login page, React will re-render the AppRouter component and the
                // BootstrappingRoute component which will throw an error again if "throwOnError" remains true and cause an infinite loop.
                // To fix this, when a unauthorized error is thrown, we notify the AppRouter component state reducerm, which will set isUnauthorized to true
                // and instruct Tanstack Query  to throw the error only if isUnauthorized is false.
                if (isUnauthorizedError(error)) {
                    dispatch({ type: "is-unauthorized" });
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

    useEffect(() => {
        if (isReady) {
            dispatch({ type: "protected-data-ready" });
        }
    }, [isReady, dispatch]);

    return data;
}
