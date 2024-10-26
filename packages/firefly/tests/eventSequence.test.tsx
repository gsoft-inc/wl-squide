import {
    __clearLocalModuleRegistry,
    __setLocalModuleRegistry,
    LocalModuleDeferredRegistrationFailedEvent,
    LocalModuleRegistrationFailedEvent,
    LocalModuleRegistry,
    LocalModulesDeferredRegistrationCompletedEvent,
    LocalModulesDeferredRegistrationStartedEvent,
    LocalModulesRegistrationCompletedEvent,
    LocalModulesRegistrationStartedEvent,
    RuntimeContext
} from "@squide/core";
import {
    __clearRemoteModuleRegistry,
    __setRemoteModuleRegistry,
    RemoteModuleDeferredRegistrationFailedEvent,
    RemoteModuleRegistrationFailedEvent,
    RemoteModuleRegistry,
    RemoteModulesDeferredRegistrationCompletedEvent,
    RemoteModulesDeferredRegistrationStartedEvent,
    RemoteModulesRegistrationCompletedEvent,
    RemoteModulesRegistrationStartedEvent
} from "@squide/module-federation";
import { __clearMswState } from "@squide/msw";
import { ProtectedRoutes } from "@squide/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { createMemoryRouter, Outlet, RouterProvider } from "react-router-dom";
import { AppRouter as FireflyAppRouter } from "../src/AppRouter.tsx";
import { ApplicationBoostrappedEvent, ModulesReadyEvent, ModulesRegisteredEvent, MswReadyEvent, ProtectedDataReadyEvent, PublicDataReadyEvent } from "../src/AppRouterReducer.ts";
import { FireflyRuntime } from "../src/FireflyRuntime.tsx";
import { ApplicationBootstrappingStartedEvent, bootstrap } from "../src/boostrap.ts";
import { useDeferredRegistrations } from "../src/useDeferredRegistrations.ts";
import { useIsBootstrapping } from "../src/useIsBootstrapping.ts";
import { ProtectedDataFetchStartedEvent, useProtectedDataQueries } from "../src/useProtectedDataQueries.ts";
import { PublicDataFetchStartedEvent, usePublicDataQueries } from "../src/usePublicDataQueries.ts";

/*

- with deferred registrations
- without deferred registrations

- with modules & msw already registered at initialization (because of async)

- with only public data
- with only protected data
- without global data

*/

/*

    ApplicationBootstrappingStartedEvent

    LocalModulesRegistrationStartedEvent
    LocalModulesRegistrationCompletedEvent

    RemoteModulesRegistrationStartedEvent
    RemoteModulesRegistrationCompletedEvent

    ModulesRegisteredEvent
    MswReadyEvent

    PublicDataFetchStartedEvent
    PublicDataReadyEvent

    ProtectedDataFetchStartedEvent
    ProtectedDataReadyEvent

    LocalModuleDeferredRegistrationStartedEvent
    LocalModuleDeferredRegistrationCompletedEvent

    RemoteModuleDeferredRegistrationStartedEvent
    RemoteModuleDeferredRegistrationCompletedEvent

    ModulesReadyEvent

    ApplicationBoostrappedEvent


    LocalModuleRegistrationFailedEvent
    LocalModuleDeferredRegistrationFailedEvent
    RemoteModuleRegistrationFailedEvent
    RemoteModuleDeferredRegistrationFailedEvent

    Ajouter dans usePublicDataQueries et useProtectedDataQueries
        un dispatch de PublicDataQueriesFailedEvent et ProtectedDataQueriesFailedEvent

    Devrait aussi ajouter des suites de tests pour usePublicDataQueries et useProtectedDataQueries

    */

function BootstrappingRoute() {
    usePublicDataQueries([{
        queryKey: ["foo"],
        queryFn: async () => ({ foo: "bar" })
    }]);

    const [foo] = useProtectedDataQueries([{
        queryKey: ["john"],
        queryFn: async () => ({ john: "doe" })
    }], () => false);

    useDeferredRegistrations(foo);

    if (useIsBootstrapping()) {
        return <div>Loading...</div>;
    }

    return <Outlet />;
}

interface AppRouterProps {
    waitForMsw: boolean;
    waitForPublicData: boolean;
    waitForProtectedData: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialEntries: any;
    initialIndex: number;
    // bootstrappingRoute: ReactNode;
}

function AppRouter(props: AppRouterProps) {
    const {
        waitForMsw,
        waitForPublicData,
        waitForProtectedData,
        initialEntries,
        initialIndex
    } = props;

    return (
        <FireflyAppRouter waitForMsw={waitForMsw} waitForPublicData={waitForPublicData} waitForProtectedData={waitForProtectedData}>
            {({ rootRoute, registeredRoutes, routerProviderProps }) => {
                return (
                    <RouterProvider
                        router={createMemoryRouter([
                            {
                                element: rootRoute,
                                children: [
                                    {
                                        element: <BootstrappingRoute />,
                                        children: registeredRoutes
                                    }
                                ]
                            }
                        ], {
                            initialEntries,
                            initialIndex
                        })}
                        {...routerProviderProps}
                    />
                );
            }}
        </FireflyAppRouter>
    );
}

async function executeUntilRouteIsRendered(fct: () => void, interval: number = 1) {
    return await new Promise(resolve => {
        const intervalId = setInterval(() => {
            const rendered = !!screen.queryByRole("heading");

            if (rendered) {
                resolve(null);
                clearInterval(intervalId);
            } else {
                fct();
            }
        }, interval);
    });
}

afterEach(() => {
    __clearLocalModuleRegistry();
    __clearRemoteModuleRegistry();
    __clearMswState();
});

test("something", async () => {
    const runtime = new FireflyRuntime({
        useMsw: true
    });

    const onApplicationBootstrappingStarted = jest.fn();
    const onLocalModuleRegistrationStarted = jest.fn();
    const onLocalModuleRegistrationCompleted = jest.fn();
    const onRemoteModuleRegistrationStarted = jest.fn();
    const onRemoteModuleRegistrationCompleted = jest.fn();
    const onModulesRegistered = jest.fn();
    const onMswReady = jest.fn();
    const onPublicDataFetchStarted = jest.fn();
    const onPublicDataReady = jest.fn();
    const onProtectedDataFetchStarted = jest.fn();
    const onProtectedDataReady = jest.fn();
    const onLocalModuleDeferredRegistrationStarted = jest.fn();
    const onLocalModuleDeferredRegistrationCompleted = jest.fn();
    const onRemoteModuleDeferredRegistrationStarted = jest.fn();
    const onRemoteModuleDeferredRegistrationCompleted = jest.fn();
    const onModulesReady = jest.fn();
    const onApplicationBoostrapped = jest.fn();

    runtime.eventBus.addListener(ApplicationBootstrappingStartedEvent, onApplicationBootstrappingStarted);
    runtime.eventBus.addListener(LocalModulesRegistrationStartedEvent, onLocalModuleRegistrationStarted);
    runtime.eventBus.addListener(LocalModulesRegistrationCompletedEvent, onLocalModuleRegistrationCompleted);
    runtime.eventBus.addListener(RemoteModulesRegistrationStartedEvent, onRemoteModuleRegistrationStarted);
    runtime.eventBus.addListener(RemoteModulesRegistrationCompletedEvent, onRemoteModuleRegistrationCompleted);
    runtime.eventBus.addListener(ModulesRegisteredEvent, onModulesRegistered);
    runtime.eventBus.addListener(MswReadyEvent, onMswReady);
    runtime.eventBus.addListener(PublicDataFetchStartedEvent, onPublicDataFetchStarted);
    runtime.eventBus.addListener(PublicDataReadyEvent, onPublicDataReady);
    runtime.eventBus.addListener(ProtectedDataFetchStartedEvent, onProtectedDataFetchStarted);
    runtime.eventBus.addListener(ProtectedDataReadyEvent, onProtectedDataReady);
    runtime.eventBus.addListener(LocalModulesDeferredRegistrationStartedEvent, onLocalModuleDeferredRegistrationStarted);
    runtime.eventBus.addListener(LocalModulesDeferredRegistrationCompletedEvent, onLocalModuleDeferredRegistrationCompleted);
    runtime.eventBus.addListener(RemoteModulesDeferredRegistrationStartedEvent, onRemoteModuleDeferredRegistrationStarted);
    runtime.eventBus.addListener(RemoteModulesDeferredRegistrationCompletedEvent, onRemoteModuleDeferredRegistrationCompleted);
    runtime.eventBus.addListener(ModulesReadyEvent, onModulesReady);
    runtime.eventBus.addListener(ApplicationBoostrappedEvent, onApplicationBoostrapped);

    const localModuleRegistry = new LocalModuleRegistry();

    const loadRemote = jest.fn().mockResolvedValue({
        // Deferred registration
        register: () => () => {}
    });

    const remoteModuleRegistry = new RemoteModuleRegistry(loadRemote);

    __setLocalModuleRegistry(localModuleRegistry);
    __setRemoteModuleRegistry(remoteModuleRegistry);

    await act(async () => {
        await bootstrap(runtime, {
            localModules: [
                x => {
                    x.registerRoute({
                        children: [
                            ProtectedRoutes
                        ]
                    }, {
                        hoist: true
                    });

                    x.registerRoute({
                        path: "/foo",
                        element: (
                            <div>
                                <h1>Foo</h1>
                            </div>
                        )
                    });

                    // Deferred registration.
                    return () => {};
                }
            ],
            remotes: [
                { name: "Dummy-1" }
            ],
            startMsw: jest.fn(() => Promise.resolve())
        });
    });

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                // View: https://tanstack.com/query/latest/docs/framework/react/guides/testing#set-gctime-to-infinity-with-jest.
                gcTime: Infinity
            }
        }
    });

    const props: AppRouterProps = {
        waitForMsw: true,
        waitForPublicData: true,
        waitForProtectedData: true,
        initialEntries: ["/foo"],
        initialIndex: 0
    };

    const { rerender } = render(<AppRouter {...props} />, {
        wrapper: ({ children }: { children?: ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                <RuntimeContext.Provider value={runtime}>
                    {children}
                </RuntimeContext.Provider>
            </QueryClientProvider>
        )
    });

    await executeUntilRouteIsRendered(() => rerender(<AppRouter {...props} />));

    expect(onApplicationBootstrappingStarted).toHaveBeenCalledTimes(1);
    expect(onLocalModuleRegistrationStarted).toHaveBeenCalledTimes(1);
    expect(onLocalModuleRegistrationCompleted).toHaveBeenCalledTimes(1);
    expect(onRemoteModuleRegistrationStarted).toHaveBeenCalledTimes(1);
    expect(onRemoteModuleRegistrationCompleted).toHaveBeenCalledTimes(1);
    expect(onModulesRegistered).toHaveBeenCalledTimes(1);
    expect(onMswReady).toHaveBeenCalledTimes(1);
    expect(onPublicDataFetchStarted).toHaveBeenCalledTimes(1);
    expect(onPublicDataReady).toHaveBeenCalledTimes(1);
    expect(onProtectedDataFetchStarted).toHaveBeenCalledTimes(1);
    expect(onProtectedDataReady).toHaveBeenCalledTimes(1);
    expect(onLocalModuleDeferredRegistrationStarted).toHaveBeenCalledTimes(1);
    expect(onLocalModuleDeferredRegistrationCompleted).toHaveBeenCalledTimes(1);
    expect(onRemoteModuleDeferredRegistrationStarted).toHaveBeenCalledTimes(1);
    expect(onRemoteModuleDeferredRegistrationCompleted).toHaveBeenCalledTimes(1);
    expect(onModulesReady).toHaveBeenCalledTimes(1);
    expect(onApplicationBoostrapped).toHaveBeenCalledTimes(1);

    // expect(onDataFetchingStarted.mock.invocationCallOrder[0]).toBeLessThan(onPublicDataFetchStarted.mock.invocationCallOrder[0]);

    // Expected order is:
    //    ApplicationBootstrappingStartedEvent
    //    LocalsModuleRegistrationStartedEvent
    //    LocalModulesRegistrationCompletedEvent
    //    RemoteModulesRegistrationStartedEvent
    //    RemoteModulesRegistrationCompletedEvent
    //    ModulesRegisteredEvent
    //    MswReadyEvent
    //    PublicDataFetchStartedEvent
    //    PublicDataReadyEvent
    //    ProtectedDataFetchStartedEvent
    //    ProtectedDataReadyEvent
    //    LocalModuleDeferredRegistrationStartedEvent
    //    LocalModuleDeferredRegistrationCompletedEvent
    //    RemoteModuleDeferredRegistrationStartedEvent
    //    RemoteModuleDeferredRegistrationCompletedEvent
    //    ModulesReadyEvent
    //    ApplicationBoostrappedEvent
    expect(onApplicationBootstrappingStarted.mock.invocationCallOrder[0]).toBeLessThan(onLocalModuleRegistrationStarted.mock.invocationCallOrder[0]);
    expect(onLocalModuleRegistrationStarted.mock.invocationCallOrder[0]).toBeLessThan(onLocalModuleRegistrationCompleted.mock.invocationCallOrder[0]);
    expect(onLocalModuleRegistrationCompleted.mock.invocationCallOrder[0]).toBeLessThan(onRemoteModuleRegistrationStarted.mock.invocationCallOrder[0]);
    expect(onRemoteModuleRegistrationStarted.mock.invocationCallOrder[0]).toBeLessThan(onRemoteModuleRegistrationCompleted.mock.invocationCallOrder[0]);
    expect(onRemoteModuleRegistrationCompleted.mock.invocationCallOrder[0]).toBeLessThan(onModulesRegistered.mock.invocationCallOrder[0]);

    // OTHER FOR MSW READY?
    expect(onModulesRegistered.mock.invocationCallOrder[0]).toBeLessThan(onMswReady.mock.invocationCallOrder[0]);
    // expect(onMswReady.mock.invocationCallOrder[0]).toBeLessThan(onPublicDataFetchStarted.mock.invocationCallOrder[0]);
    // expect(onMswReady.mock.invocationCallOrder[0]).toBeLessThan(onProtectedDataFetchStarted.mock.invocationCallOrder[0]);

    // expect(onModulesRegistered.mock.invocationCallOrder[0]).toBeLessThan(onPublicDataFetchStarted.mock.invocationCallOrder[0]);
    expect(onPublicDataFetchStarted.mock.invocationCallOrder[0]).toBeLessThan(onPublicDataReady.mock.invocationCallOrder[0]);
    // expect(onModulesRegistered.mock.invocationCallOrder[0]).toBeLessThan(onProtectedDataFetchStarted.mock.invocationCallOrder[0]);
    expect(onProtectedDataFetchStarted.mock.invocationCallOrder[0]).toBeLessThan(onProtectedDataReady.mock.invocationCallOrder[0]);
    expect(onPublicDataReady.mock.invocationCallOrder[0]).toBeLessThan(onLocalModuleDeferredRegistrationStarted.mock.invocationCallOrder[0]);
    expect(onLocalModuleDeferredRegistrationStarted.mock.invocationCallOrder[0]).toBeLessThan(onLocalModuleDeferredRegistrationCompleted.mock.invocationCallOrder[0]);
    expect(onProtectedDataReady.mock.invocationCallOrder[0]).toBeLessThan(onRemoteModuleDeferredRegistrationStarted.mock.invocationCallOrder[0]);
    expect(onRemoteModuleDeferredRegistrationStarted.mock.invocationCallOrder[0]).toBeLessThan(onRemoteModuleDeferredRegistrationCompleted.mock.invocationCallOrder[0]);
    expect(onLocalModuleDeferredRegistrationCompleted.mock.invocationCallOrder[0]).toBeLessThan(onModulesReady.mock.invocationCallOrder[0]);
    expect(onRemoteModuleDeferredRegistrationCompleted.mock.invocationCallOrder[0]).toBeLessThan(onModulesReady.mock.invocationCallOrder[0]);
    expect(onModulesReady.mock.invocationCallOrder[0]).toBeLessThan(onApplicationBoostrapped.mock.invocationCallOrder[0]);
});
