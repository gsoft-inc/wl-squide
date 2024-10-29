/*


- when a query fail, an error is thrown

- when a query fail, PublicDataFetchFailedEvent is dispatched

*/

import { RuntimeContext, type Runtime } from "@squide/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { AppRouterDispatcherContext, AppRouterStateContext } from "../src/AppRouterContext.ts";
import type { AppRouterDispatch, AppRouterState } from "../src/AppRouterReducer.ts";
import { FireflyRuntime } from "../src/FireflyRuntime.tsx";
import { PublicDataFetchStartedEvent, usePublicDataQueries } from "../src/usePublicDataQueries.ts";
import { createDefaultAppRouterState } from "./utils.ts";

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                // View: https://tanstack.com/query/latest/docs/framework/react/guides/testing#set-gctime-to-infinity-with-jest.
                gcTime: Infinity
            }
        }
    });
}

function renderAppRouter(appRouter: ReactNode, runtime: Runtime, state: AppRouterState, dispatch: AppRouterDispatch, queryClient?: QueryClient) {
    const client = queryClient ?? createQueryClient();

    return render(appRouter, {
        wrapper: ({ children }: { children?: ReactNode }) => (
            <RuntimeContext.Provider value={runtime}>
                <AppRouterDispatcherContext.Provider value={dispatch}>
                    <AppRouterStateContext.Provider value={state}>
                        <QueryClientProvider client={client}>
                            {children}
                        </QueryClientProvider>
                    </AppRouterStateContext.Provider>
                </AppRouterDispatcherContext.Provider>
            </RuntimeContext.Provider>
        )
    });
}

test("when queries are executed, PublicDataFetchStartedEvent is dispatched", async () => {
    const runtime = new FireflyRuntime();

    const dispatch = jest.fn();
    const listener = jest.fn();

    runtime.eventBus.addListener(PublicDataFetchStartedEvent, listener);

    const state = createDefaultAppRouterState();
    state.isPublicDataReady = true;
    state.areModulesReady = true;
    state.isMswReady = true;

    function AppRouter() {
        const [data] = usePublicDataQueries([{
            queryKey: ["foo"],
            queryFn: () => "bar"
        }]);

        return data;
    }

    renderAppRouter(<AppRouter />, runtime, state, dispatch);

    await waitFor(() => screen.findByText("bar"));

    expect(listener).toHaveBeenCalledTimes(1);
});

test("when data is ready, \"public-data-ready\" is dispatched", async () => {
    const runtime = new FireflyRuntime();

    const dispatch = jest.fn();

    const state = createDefaultAppRouterState();
    state.isPublicDataReady = true;
    state.areModulesReady = true;
    state.isMswReady = true;

    function AppRouter() {
        const [data] = usePublicDataQueries([{
            queryKey: ["foo"],
            queryFn: () => "bar"
        }]);

        return data;
    }

    renderAppRouter(<AppRouter />, runtime, state, dispatch);

    await waitFor(() => screen.findByText("bar"));

    expect(dispatch).toHaveBeenCalledTimes(2);

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: "public-data-ready"
    }));

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: "public-data-updated"
    }));
});

test("when data is updated, \"public-data-updated\" is dispatched", async () => {
    const runtime = new FireflyRuntime();

    const dispatch = jest.fn();

    const state = createDefaultAppRouterState();
    state.isPublicDataReady = true;
    state.areModulesReady = true;
    state.isMswReady = true;

    const queryClient = createQueryClient();

    const queryFn = jest.fn()
        .mockResolvedValueOnce("bar")
        .mockResolvedValueOnce("toto");

    function AppRouter() {
        const [data] = usePublicDataQueries([{
            queryKey: ["foo"],
            queryFn
        }]);

        return data;
    }

    renderAppRouter(<AppRouter />, runtime, state, dispatch, queryClient);

    await waitFor(() => screen.findByText("bar"));

    queryClient.refetchQueries({
        queryKey: ["foo"]
    });

    await waitFor(() => screen.findByText("toto"));

    expect(dispatch).toHaveBeenCalledTimes(3);

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: "public-data-ready"
    }));

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: "public-data-updated"
    }));
});

// test.only("when a query fail, an error is thrown", async () => {
//     const runtime = new FireflyRuntime();

//     const dispatch = jest.fn();

//     const state = createDefaultAppRouterState();
//     state.isPublicDataReady = true;
//     state.areModulesReady = true;
//     state.isMswReady = true;

//     function AppRouter() {
//         const [data] = usePublicDataQueries([{
//             queryKey: ["foo"],
//             queryFn: () => { throw new Error("Query failed."); }
//         }]);

//         return data;
//     }

//     expect(() => renderAppRouter(<AppRouter />, runtime, state, dispatch)).toThrow();
// });
