import { isApiError } from "@endpoints/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { PropsWithChildren } from "react";

// const queryCache = new QueryCache({
//     onError: (error: Error) => {
//         if (isApiError(error) && error.status === 403) {
//             console.log("************************************************** will rethrow 403");

//             throw error;
//         }
//     }
// });

const queryClient = new QueryClient({
    // queryCache,
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
                if (isApiError(error) && (error.status === 401 || error.status === 403)) {
                    return false;
                }

                return failureCount <= 2;
            },
            refetchInterval: 5 * 1000
        }
    }
});

export function QueryProvider({ children }: PropsWithChildren) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.ISOLATED && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    );
}
