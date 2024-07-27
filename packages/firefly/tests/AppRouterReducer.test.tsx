import { __setLocalModuleRegistry, RuntimeContext, type ModuleRegistrationError, type ModuleRegistrationStatus, type ModuleRegistrationStatusChangedListener, type ModuleRegistry } from "@squide/core";
import { __setRemoteModuleRegistry } from "@squide/module-federation";
import type { ReactRouterRuntime } from "@squide/react-router";
import { act, renderHook, type RenderHookOptions } from "@testing-library/react";
import type { ReactNode } from "react";
import { useAppRouterReducer, useModuleRegistrationStatusDispatcher } from "../src/AppRouterReducer.ts";
import { FireflyRuntime } from "../src/FireflyRuntime.tsx";

/*

- Something related to
        areModulesRegistered: getAreModulesRegistered(),
        areModulesReady: getAreModulesReady(),
        isMswReady: isMswReady(),

- when local modules are registered but remote modules are not registered, "areModulesRegistered" is false

- when local modules are not registered but remote modules are registered, "areModulesRegistered" is false

- when local modules and remote modules are registered, "areModulesRegistered" is true

- when local modules are ready but remote modules are not ready, "areModulesReady" is false

- when local modules are not ready but remote modules are ready, "areModulesReady" is false

- when local modules and remote modules are ready, "areModulesReady" is true


-> Ajouter les autres actions aux test du dispatcher

-> The strategy could be to extract the "modules-registered", "modules-ready" and "msw-ready" pieces to standalone hooks and test them
    independently

*/

describe("useAppRouterReducer", () => {
    function renderWithRuntime<TProps>(runtime: ReactRouterRuntime, waitForMsw: boolean, waitForPublicData: boolean, waitForProtectedData: boolean, additionalProps: RenderHookOptions<TProps> = {}) {
        return renderHook(() => useAppRouterReducer(waitForMsw, waitForPublicData, waitForProtectedData), {
            wrapper: ({ children }: { children?: ReactNode }) => (
                <RuntimeContext.Provider value={runtime}>
                    {children}
                </RuntimeContext.Provider>
            ),
            ...additionalProps
        });
    }

    test("the reducer is initialized with the provided values for \"waitForMsw\", \"waitForPublicData\" and \"waitForProtectedData\" 1", () => {
        const runtime = new FireflyRuntime();

        const { result } = renderWithRuntime(runtime, true, true, true);

        const [state] = result.current;

        expect(state.waitForMsw).toBeTruthy();
        expect(state.waitForPublicData).toBeTruthy();
        expect(state.waitForProtectedData).toBeTruthy();
    });

    test("the reducer is initialized with the provided values for \"waitForMsw\", \"waitForPublicData\" and \"waitForProtectedData\" 2", () => {
        const runtime = new FireflyRuntime();

        const { result } = renderWithRuntime(runtime, false, false, false);

        const [state] = result.current;

        expect(state.waitForMsw).toBeFalsy();
        expect(state.waitForPublicData).toBeFalsy();
        expect(state.waitForProtectedData).toBeFalsy();
    });

    test("when \"public-data-ready\" is dispatched, \"isPublicDataReady\" is true", () => {
        const runtime = new FireflyRuntime();

        const { result } = renderWithRuntime(runtime, false, false, false);

        expect(result.current[0].isPublicDataReady).toBeFalsy();

        act(() => {
            // dispatch
            result.current[1]({ type: "public-data-ready" });
        });

        expect(result.current[0].isPublicDataReady).toBeTruthy();
    });

    test("when \"public-data-ready\" is dispatched, \"publicDataUpdatedAt\" is set to the current timestamp", () => {
        jest.spyOn(global.Date, "now")
            .mockImplementationOnce(() => Date.parse("2020-02-14"));

        const runtime = new FireflyRuntime();

        const { result } = renderWithRuntime(runtime, false, false, false);

        expect(result.current[0].publicDataUpdatedAt).toBeUndefined();

        act(() => {
            // dispatch
            result.current[1]({ type: "public-data-ready" });
        });

        expect(result.current[0].publicDataUpdatedAt).toEqual(Date.parse("2020-02-14"));
    });

    test("when \"protected-data-ready\" is dispatched, \"isProtectedDataReady\" is true", () => {
        const runtime = new FireflyRuntime();

        const { result } = renderWithRuntime(runtime, false, false, false);

        expect(result.current[0].isProtectedDataReady).toBeFalsy();

        act(() => {
            // dispatch
            result.current[1]({ type: "protected-data-ready" });
        });

        expect(result.current[0].isProtectedDataReady).toBeTruthy();
    });

    test("when \"protected-data-ready\" is dispatched, \"protectedDataUpdatedAt\" is set to the current timestamp", () => {
        jest.spyOn(global.Date, "now")
            .mockImplementationOnce(() => Date.parse("2020-02-14"));

        const runtime = new FireflyRuntime();

        const { result } = renderWithRuntime(runtime, false, false, false);

        expect(result.current[0].protectedDataUpdatedAt).toBeUndefined();

        act(() => {
            // dispatch
            result.current[1]({ type: "protected-data-ready" });
        });

        expect(result.current[0].protectedDataUpdatedAt).toEqual(Date.parse("2020-02-14"));
    });

    test("when \"public-data-updated\" is dispatched, \"publicDataUpdatedAt\" is set to the current timestamp", () => {
        jest.spyOn(global.Date, "now")
            .mockImplementationOnce(() => Date.parse("2020-02-14"))
            .mockImplementationOnce(() => Date.parse("2021-02-14"));

        const runtime = new FireflyRuntime();

        const { result } = renderWithRuntime(runtime, false, false, false);

        act(() => {
            // dispatch
            result.current[1]({ type: "public-data-ready" });
        });

        expect(result.current[0].publicDataUpdatedAt).toEqual(Date.parse("2020-02-14"));

        act(() => {
            // dispatch
            result.current[1]({ type: "public-data-updated" });
        });

        expect(result.current[0].publicDataUpdatedAt).toEqual(Date.parse("2021-02-14"));
    });

    test("when \"protected-data-updated\" is dispatched, \"protectedDataUpdatedAt\" is set to the current timestamp", () => {
        jest.spyOn(global.Date, "now")
            .mockImplementationOnce(() => Date.parse("2020-02-14"))
            .mockImplementationOnce(() => Date.parse("2021-02-14"));

        const runtime = new FireflyRuntime();

        const { result } = renderWithRuntime(runtime, false, false, false);

        act(() => {
            // dispatch
            result.current[1]({ type: "protected-data-ready" });
        });

        expect(result.current[0].protectedDataUpdatedAt).toEqual(Date.parse("2020-02-14"));

        act(() => {
            // dispatch
            result.current[1]({ type: "protected-data-updated" });
        });

        expect(result.current[0].protectedDataUpdatedAt).toEqual(Date.parse("2021-02-14"));
    });

    test("when \"deferred-registrations-updated\" is dispatched, \"deferredRegistrationsUpdatedAt\" is set to the current timestamp", () => {
        jest.spyOn(global.Date, "now")
            .mockImplementationOnce(() => Date.parse("2020-02-14"));

        const runtime = new FireflyRuntime();

        const { result } = renderWithRuntime(runtime, false, false, false);

        expect(result.current[0].deferredRegistrationsUpdatedAt).toBeUndefined();

        act(() => {
            // dispatch
            result.current[1]({ type: "deferred-registrations-updated" });
        });

        expect(result.current[0].deferredRegistrationsUpdatedAt).toEqual(Date.parse("2020-02-14"));
    });

    test("when \"active-route-is-protected\" is dispatched, \"isActiveRouteProtected\" is true", () => {
        const runtime = new FireflyRuntime();

        const { result } = renderWithRuntime(runtime, false, false, false);

        expect(result.current[0].isActiveRouteProtected).toBeFalsy();

        act(() => {
            // dispatch
            result.current[1]({ type: "active-route-is-protected" });
        });

        expect(result.current[0].isActiveRouteProtected).toBeTruthy();
    });

    test("when \"is-unauthorized\" is dispatched, \"isUnauthorized\" is true", () => {
        const runtime = new FireflyRuntime();

        const { result } = renderWithRuntime(runtime, false, false, false);

        expect(result.current[0].isUnauthorized).toBeFalsy();

        act(() => {
            // dispatch
            result.current[1]({ type: "is-unauthorized" });
        });

        expect(result.current[0].isUnauthorized).toBeTruthy();
    });
});

describe("useModuleRegistrationStatusDispatcher", () => {
    class DummyModuleRegistry implements ModuleRegistry {
        readonly #registrationStatus: ModuleRegistrationStatus;
        readonly #statusChangedListeners = new Set<ModuleRegistrationStatusChangedListener>();

        constructor(registrationStatus: ModuleRegistrationStatus) {
            this.#registrationStatus = registrationStatus;
        }

        registerModules(): Promise<ModuleRegistrationError[]> {
            throw new Error("Method not implemented.");
        }

        registerDeferredRegistrations(): Promise<ModuleRegistrationError[]> {
            throw new Error("Method not implemented.");
        }

        updateDeferredRegistrations(): Promise<ModuleRegistrationError[]> {
            throw new Error("Method not implemented.");
        }

        registerStatusChangedListener(callback: ModuleRegistrationStatusChangedListener) {
            this.#statusChangedListeners.add(callback);
        }

        removeStatusChangedListener(callback: ModuleRegistrationStatusChangedListener) {
            this.#statusChangedListeners.delete(callback);
        }

        get registrationStatus(): ModuleRegistrationStatus {
            return this.#registrationStatus;
        }

        invokeEventListeners() {
            this.#statusChangedListeners.forEach(x => {
                x();
            });
        }
    }

    test("when local modules and remote modules are not registered, do not dispatch the \"modules-registered\" action", () => {
        const localModuleRegistry = new DummyModuleRegistry("registering-modules");
        const remoteModuleRegistry = new DummyModuleRegistry("registering-modules");

        __setLocalModuleRegistry(localModuleRegistry);
        __setRemoteModuleRegistry(remoteModuleRegistry);

        const dispatch = jest.fn();

        renderHook(() => useModuleRegistrationStatusDispatcher(false, false, dispatch));

        localModuleRegistry.invokeEventListeners();
        remoteModuleRegistry.invokeEventListeners();

        expect(dispatch).not.toHaveBeenCalled();
    });

    test("when local modules are registered but remote modules are not registered, do not dispatch the \"modules-registered\" action", async () => {
        const localModuleRegistry = new DummyModuleRegistry("modules-registered");
        const remoteModuleRegistry = new DummyModuleRegistry("registering-modules");

        __setLocalModuleRegistry(localModuleRegistry);
        __setRemoteModuleRegistry(remoteModuleRegistry);

        const dispatch = jest.fn();

        renderHook(() => useModuleRegistrationStatusDispatcher(false, false, dispatch));

        localModuleRegistry.invokeEventListeners();
        remoteModuleRegistry.invokeEventListeners();

        expect(dispatch).not.toHaveBeenCalled();
    });

    test("when local modules are not registered but remote modules are registered, do not dispatch the \"modules-registered\" action", async () => {
        const localModuleRegistry = new DummyModuleRegistry("registering-modules");
        const remoteModuleRegistry = new DummyModuleRegistry("modules-registered");

        __setLocalModuleRegistry(localModuleRegistry);
        __setRemoteModuleRegistry(remoteModuleRegistry);

        const dispatch = jest.fn();

        renderHook(() => useModuleRegistrationStatusDispatcher(false, false, dispatch));

        localModuleRegistry.invokeEventListeners();
        remoteModuleRegistry.invokeEventListeners();

        expect(dispatch).not.toHaveBeenCalled();
    });

    test("when local modules and remote modules are registered, dispatch the \"modules-registered\" action", async () => {
        const localModuleRegistry = new DummyModuleRegistry("modules-registered");
        const remoteModuleRegistry = new DummyModuleRegistry("modules-registered");

        __setLocalModuleRegistry(localModuleRegistry);
        __setRemoteModuleRegistry(remoteModuleRegistry);

        const dispatch = jest.fn();

        renderHook(() => useModuleRegistrationStatusDispatcher(false, false, dispatch));

        localModuleRegistry.invokeEventListeners();
        remoteModuleRegistry.invokeEventListeners();

        expect(dispatch).toHaveBeenCalledWith({ type: "modules-registered" });
    });
});
