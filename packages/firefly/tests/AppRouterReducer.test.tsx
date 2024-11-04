import { __clearLocalModuleRegistry, __setLocalModuleRegistry, RuntimeContext, type ModuleRegistrationError, type ModuleRegistrationStatus, type ModuleRegistrationStatusChangedListener, type ModuleRegistry, type Runtime } from "@squide/core";
import { __clearRemoteModuleRegistry, __setRemoteModuleRegistry } from "@squide/module-federation";
import { __clearMswState, __setMswState, MswState, type MswStateChangedListener } from "@squide/msw";
import { act, renderHook, type RenderHookOptions } from "@testing-library/react";
import type { ReactNode } from "react";
import { ModulesReadyEvent, ModulesRegisteredEvent, MswReadyEvent, ProtectedDataReadyEvent, PublicDataReadyEvent, useAppRouterReducer, useModuleRegistrationStatusDispatcher, useMswStatusDispatcher, type AppRouterDispatch } from "../src/AppRouterReducer.ts";
import { FireflyRuntime } from "../src/FireflyRuntime.tsx";

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

class DummyMswState extends MswState {
    #isReady = false;

    readonly #stateChangedListeners = new Set<MswStateChangedListener>();

    constructor(isReady: boolean) {
        super();

        this.#isReady = isReady;
    }

    addStateChangedListener(callback: MswStateChangedListener) {
        this.#stateChangedListeners.add(callback);
    }

    removeStateChangedListener(callback: MswStateChangedListener) {
        this.#stateChangedListeners.delete(callback);
    }

    invokeEventListeners() {
        this.#stateChangedListeners.forEach(x => {
            x();
        });
    }

    get isReady() {
        return this.#isReady;
    }
}

afterEach(() => {
    __clearLocalModuleRegistry();
    __clearRemoteModuleRegistry();
    __clearMswState();
});

describe("useAppRouterReducer", () => {
    function renderUseAppRouterReducerHook<TProps>(runtime: Runtime, waitForMsw: boolean, waitForPublicData: boolean, waitForProtectedData: boolean, additionalProps: RenderHookOptions<TProps> = {}) {
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

        const { result } = renderUseAppRouterReducerHook(runtime, true, true, true);

        const [state] = result.current;

        expect(state.waitForMsw).toBeTruthy();
        expect(state.waitForPublicData).toBeTruthy();
        expect(state.waitForProtectedData).toBeTruthy();
    });

    test("the reducer is initialized with the provided values for \"waitForMsw\", \"waitForPublicData\" and \"waitForProtectedData\" 2", () => {
        const runtime = new FireflyRuntime();

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        const [state] = result.current;

        expect(state.waitForMsw).toBeFalsy();
        expect(state.waitForPublicData).toBeFalsy();
        expect(state.waitForProtectedData).toBeFalsy();
    });

    test("when \"modules-registered\" is dispatched, \"areModulesRegistered\" is true", () => {
        const runtime = new FireflyRuntime();

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].areModulesRegistered).toBeFalsy();

        act(() => {
            // dispatch
            result.current[1]({ type: "modules-registered" });
        });

        expect(result.current[0].areModulesRegistered).toBeTruthy();
    });

    test("when \"modules-registered\" is dispatched, ModulesRegisteredEvent is dispatched", () => {
        const runtime = new FireflyRuntime();

        const listener = jest.fn();

        runtime.eventBus.addListener(ModulesRegisteredEvent, listener);

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].areModulesRegistered).toBeFalsy();

        act(() => {
            // dispatch
            result.current[1]({ type: "modules-registered" });
        });

        expect(listener).toHaveBeenCalledTimes(1);
    });

    test("when \"modules-ready\" is dispatched, \"areModulesReady\" is true", () => {
        const runtime = new FireflyRuntime();

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].areModulesReady).toBeFalsy();

        act(() => {
            // dispatch
            result.current[1]({ type: "modules-ready" });
        });

        expect(result.current[0].areModulesReady).toBeTruthy();
    });

    test("when \"modules-ready\" is dispatched, ModulesReadyEvent is dispatched", () => {
        const runtime = new FireflyRuntime();

        const listener = jest.fn();

        runtime.eventBus.addListener(ModulesReadyEvent, listener);

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].areModulesReady).toBeFalsy();

        act(() => {
            // dispatch
            result.current[1]({ type: "modules-ready" });
        });

        expect(listener).toHaveBeenCalledTimes(1);
    });

    test("when \"modules-ready\" is dispatched, \"deferredRegistrationsUpdatedAt\" is set to the current timestamp", () => {
        jest.spyOn(global.Date, "now")
            .mockImplementationOnce(() => Date.parse("2020-02-14"));

        const runtime = new FireflyRuntime();

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].deferredRegistrationsUpdatedAt).toBeUndefined();

        act(() => {
            // dispatch
            result.current[1]({ type: "modules-ready" });
        });

        expect(result.current[0].deferredRegistrationsUpdatedAt).toEqual(Date.parse("2020-02-14"));
    });

    test("when \"msw-ready\" is dispatched, \"isMswReady\" is true", () => {
        const runtime = new FireflyRuntime();

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].isMswReady).toBeFalsy();

        act(() => {
            // dispatch
            result.current[1]({ type: "msw-ready" });
        });

        expect(result.current[0].isMswReady).toBeTruthy();
    });

    test("when \"msw-ready\" is dispatched, MswReadyEvent is dispatched", () => {
        const runtime = new FireflyRuntime();

        const listener = jest.fn();

        runtime.eventBus.addListener(MswReadyEvent, listener);

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].isMswReady).toBeFalsy();

        act(() => {
            // dispatch
            result.current[1]({ type: "msw-ready" });
        });

        expect(listener).toHaveBeenCalledTimes(1);
    });

    test("when \"public-data-ready\" is dispatched, \"isPublicDataReady\" is true", () => {
        const runtime = new FireflyRuntime();

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].isPublicDataReady).toBeFalsy();

        act(() => {
            // dispatch
            result.current[1]({ type: "public-data-ready" });
        });

        expect(result.current[0].isPublicDataReady).toBeTruthy();
    });

    test("when \"public-data-ready\" is dispatched, PublicDataReadyEvent is dispatched", () => {
        const runtime = new FireflyRuntime();

        const listener = jest.fn();

        runtime.eventBus.addListener(PublicDataReadyEvent, listener);

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].isPublicDataReady).toBeFalsy();

        act(() => {
            // dispatch
            result.current[1]({ type: "public-data-ready" });
        });

        expect(listener).toHaveBeenCalledTimes(1);
    });

    test("when \"public-data-ready\" is dispatched, \"publicDataUpdatedAt\" is set to the current timestamp", () => {
        jest.spyOn(global.Date, "now")
            .mockImplementationOnce(() => Date.parse("2020-02-14"));

        const runtime = new FireflyRuntime();

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].publicDataUpdatedAt).toBeUndefined();

        act(() => {
            // dispatch
            result.current[1]({ type: "public-data-ready" });
        });

        expect(result.current[0].publicDataUpdatedAt).toEqual(Date.parse("2020-02-14"));
    });

    test("when \"protected-data-ready\" is dispatched, \"isProtectedDataReady\" is true", () => {
        const runtime = new FireflyRuntime();

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].isProtectedDataReady).toBeFalsy();

        act(() => {
            // dispatch
            result.current[1]({ type: "protected-data-ready" });
        });

        expect(result.current[0].isProtectedDataReady).toBeTruthy();
    });

    test("when \"protected-data-ready\" is dispatched, ProtectedDataReadyEvent is dispatched", () => {
        const runtime = new FireflyRuntime();

        const listener = jest.fn();

        runtime.eventBus.addListener(ProtectedDataReadyEvent, listener);

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].isProtectedDataReady).toBeFalsy();

        act(() => {
            // dispatch
            result.current[1]({ type: "protected-data-ready" });
        });

        expect(listener).toHaveBeenCalledTimes(1);
    });

    test("when \"protected-data-ready\" is dispatched, \"protectedDataUpdatedAt\" is set to the current timestamp", () => {
        jest.spyOn(global.Date, "now")
            .mockImplementationOnce(() => Date.parse("2020-02-14"));

        const runtime = new FireflyRuntime();

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

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

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

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

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

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

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].deferredRegistrationsUpdatedAt).toBeUndefined();

        act(() => {
            // dispatch
            result.current[1]({ type: "deferred-registrations-updated" });
        });

        expect(result.current[0].deferredRegistrationsUpdatedAt).toEqual(Date.parse("2020-02-14"));
    });

    test("when \"active-route-is-public\" is dispatched, \"activeRouteVisiblity\" is \"public\"", () => {
        const runtime = new FireflyRuntime();

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].activeRouteVisibility).toBe("unknown");

        act(() => {
            // dispatch
            result.current[1]({ type: "active-route-is-public" });
        });

        expect(result.current[0].activeRouteVisibility).toBe("public");
    });

    test("when \"active-route-is-protected\" is dispatched, \"activeRouteVisiblity\" is \"protected\"", () => {
        const runtime = new FireflyRuntime();

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].activeRouteVisibility).toBe("unknown");

        act(() => {
            // dispatch
            result.current[1]({ type: "active-route-is-protected" });
        });

        expect(result.current[0].activeRouteVisibility).toBe("protected");
    });

    test("when \"is-unauthorized\" is dispatched, \"isUnauthorized\" is true", () => {
        const runtime = new FireflyRuntime();

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].isUnauthorized).toBeFalsy();

        act(() => {
            // dispatch
            result.current[1]({ type: "is-unauthorized" });
        });

        expect(result.current[0].isUnauthorized).toBeTruthy();
    });

    test("when local modules and remote modules are registered, \"areModulesRegistered\" is true at initialization", () => {
        const localModuleRegistry = new DummyModuleRegistry("modules-registered");
        const remoteModuleRegistry = new DummyModuleRegistry("modules-registered");

        __setLocalModuleRegistry(localModuleRegistry);
        __setRemoteModuleRegistry(remoteModuleRegistry);

        const runtime = new FireflyRuntime();

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].areModulesRegistered).toBeTruthy();
    });

    test("when local modules and remote modules are registered, ModulesRegisteredEvent is dispatched at initialization", () => {
        const localModuleRegistry = new DummyModuleRegistry("modules-registered");
        const remoteModuleRegistry = new DummyModuleRegistry("modules-registered");

        __setLocalModuleRegistry(localModuleRegistry);
        __setRemoteModuleRegistry(remoteModuleRegistry);

        const runtime = new FireflyRuntime();

        const listener = jest.fn();

        runtime.eventBus.addListener(ModulesRegisteredEvent, listener);

        renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(listener).toHaveBeenCalledTimes(1);
    });

    test("when local modules are registered and no remote modules has been provided, \"areModulesRegistered\" is true at initialization", () => {
        const localModuleRegistry = new DummyModuleRegistry("modules-registered");
        const remoteModuleRegistry = new DummyModuleRegistry("none");

        __setLocalModuleRegistry(localModuleRegistry);
        __setRemoteModuleRegistry(remoteModuleRegistry);

        const runtime = new FireflyRuntime();

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].areModulesRegistered).toBeTruthy();
    });

    test("when local modules are registered and no remote modules has been provided, ModulesRegisteredEvent is dispatched at initialization", () => {
        const localModuleRegistry = new DummyModuleRegistry("modules-registered");
        const remoteModuleRegistry = new DummyModuleRegistry("none");

        __setLocalModuleRegistry(localModuleRegistry);
        __setRemoteModuleRegistry(remoteModuleRegistry);

        const runtime = new FireflyRuntime();

        const listener = jest.fn();

        runtime.eventBus.addListener(ModulesRegisteredEvent, listener);

        renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(listener).toHaveBeenCalledTimes(1);
    });

    test("when no local modules has been provided and remote modules are registered, \"areModulesRegistered\" is true at initialization", () => {
        const localModuleRegistry = new DummyModuleRegistry("none");
        const remoteModuleRegistry = new DummyModuleRegistry("modules-registered");

        __setLocalModuleRegistry(localModuleRegistry);
        __setRemoteModuleRegistry(remoteModuleRegistry);

        const runtime = new FireflyRuntime();

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].areModulesRegistered).toBeTruthy();
    });

    test("when no local modules are registered and remote modules are registered, ModulesRegisteredEvent is dispatched at initialization", () => {
        const localModuleRegistry = new DummyModuleRegistry("none");
        const remoteModuleRegistry = new DummyModuleRegistry("modules-registered");

        __setLocalModuleRegistry(localModuleRegistry);
        __setRemoteModuleRegistry(remoteModuleRegistry);

        const runtime = new FireflyRuntime();

        const listener = jest.fn();

        runtime.eventBus.addListener(ModulesRegisteredEvent, listener);

        renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(listener).toHaveBeenCalledTimes(1);
    });

    test("when local modules are registered and remote modules are registering, \"areModulesRegistered\" is false at initialization", () => {
        const localModuleRegistry = new DummyModuleRegistry("modules-registered");
        const remoteModuleRegistry = new DummyModuleRegistry("registering-modules");

        __setLocalModuleRegistry(localModuleRegistry);
        __setRemoteModuleRegistry(remoteModuleRegistry);

        const runtime = new FireflyRuntime();

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].areModulesRegistered).toBeFalsy();
    });

    test("when local modules are registering and remote modules are registered, \"areModulesRegistered\" is false at initialization", () => {
        const localModuleRegistry = new DummyModuleRegistry("registering-modules");
        const remoteModuleRegistry = new DummyModuleRegistry("modules-registered");

        __setLocalModuleRegistry(localModuleRegistry);
        __setRemoteModuleRegistry(remoteModuleRegistry);

        const runtime = new FireflyRuntime();

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].areModulesRegistered).toBeFalsy();
    });

    test("when local modules and remote modules are ready, \"areModulesReady\" is true at initialization", () => {
        const localModuleRegistry = new DummyModuleRegistry("ready");
        const remoteModuleRegistry = new DummyModuleRegistry("ready");

        __setLocalModuleRegistry(localModuleRegistry);
        __setRemoteModuleRegistry(remoteModuleRegistry);

        const runtime = new FireflyRuntime();

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].areModulesReady).toBeTruthy();
    });

    test("when local modules and remote modules are ready, ModulesReadyEvent is dispatched at initialization", () => {
        const localModuleRegistry = new DummyModuleRegistry("ready");
        const remoteModuleRegistry = new DummyModuleRegistry("ready");

        __setLocalModuleRegistry(localModuleRegistry);
        __setRemoteModuleRegistry(remoteModuleRegistry);

        const runtime = new FireflyRuntime();

        const listener = jest.fn();

        runtime.eventBus.addListener(ModulesRegisteredEvent, listener);

        renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(listener).toHaveBeenCalledTimes(1);
    });

    test("when local modules are ready and no remote modules has been provided, \"areModulesReady\" is true at initialization", () => {
        const localModuleRegistry = new DummyModuleRegistry("ready");
        const remoteModuleRegistry = new DummyModuleRegistry("none");

        __setLocalModuleRegistry(localModuleRegistry);
        __setRemoteModuleRegistry(remoteModuleRegistry);

        const runtime = new FireflyRuntime();

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].areModulesReady).toBeTruthy();
    });

    test("when local modules are ready and no remote modules has been provided, ModulesReadyEvent is dispatched at initialization", () => {
        const localModuleRegistry = new DummyModuleRegistry("ready");
        const remoteModuleRegistry = new DummyModuleRegistry("none");

        __setLocalModuleRegistry(localModuleRegistry);
        __setRemoteModuleRegistry(remoteModuleRegistry);

        const runtime = new FireflyRuntime();

        const listener = jest.fn();

        runtime.eventBus.addListener(ModulesRegisteredEvent, listener);

        renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(listener).toHaveBeenCalledTimes(1);
    });

    test("when no local modules has been provided and remote modules are ready, \"areModulesReady\" is true at initialization", () => {
        const localModuleRegistry = new DummyModuleRegistry("none");
        const remoteModuleRegistry = new DummyModuleRegistry("ready");

        __setLocalModuleRegistry(localModuleRegistry);
        __setRemoteModuleRegistry(remoteModuleRegistry);

        const runtime = new FireflyRuntime();

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].areModulesReady).toBeTruthy();
    });

    test("when no local modules has been provided and remote modules are ready, ModulesReadyEvent is dispatched at initialization", () => {
        const localModuleRegistry = new DummyModuleRegistry("none");
        const remoteModuleRegistry = new DummyModuleRegistry("ready");

        __setLocalModuleRegistry(localModuleRegistry);
        __setRemoteModuleRegistry(remoteModuleRegistry);

        const runtime = new FireflyRuntime();

        const listener = jest.fn();

        runtime.eventBus.addListener(ModulesRegisteredEvent, listener);

        renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(listener).toHaveBeenCalledTimes(1);
    });

    test("when local modules are ready and remote modules are not ready, \"areModulesReady\" is false at initialization", () => {
        const localModuleRegistry = new DummyModuleRegistry("ready");
        const remoteModuleRegistry = new DummyModuleRegistry("modules-registered");

        __setLocalModuleRegistry(localModuleRegistry);
        __setRemoteModuleRegistry(remoteModuleRegistry);

        const runtime = new FireflyRuntime();

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].areModulesReady).toBeFalsy();
    });

    test("when local modules are not ready and remote modules are ready, \"areModulesReady\" is false at initialization", () => {
        const localModuleRegistry = new DummyModuleRegistry("modules-registered");
        const remoteModuleRegistry = new DummyModuleRegistry("ready");

        __setLocalModuleRegistry(localModuleRegistry);
        __setRemoteModuleRegistry(remoteModuleRegistry);

        const runtime = new FireflyRuntime();

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].areModulesReady).toBeFalsy();
    });

    test("when msw is ready, \"isMswReady\" is true at initialization", () => {
        const mswState = new DummyMswState(true);

        __setMswState(mswState);

        const runtime = new FireflyRuntime();

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].isMswReady).toBeTruthy();
    });

    test("when msw is ready, MswReadyEvent is dispatched at initialization", () => {
        const mswState = new DummyMswState(true);

        __setMswState(mswState);

        const runtime = new FireflyRuntime();

        const listener = jest.fn();

        runtime.eventBus.addListener(MswReadyEvent, listener);

        renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(listener).toHaveBeenCalledTimes(1);
    });

    test("when msw is not ready, \"isMswReady\" is false at initialization", () => {
        const mswState = new DummyMswState(false);

        __setMswState(mswState);

        const runtime = new FireflyRuntime();

        const { result } = renderUseAppRouterReducerHook(runtime, false, false, false);

        expect(result.current[0].isMswReady).toBeFalsy();
    });
});

describe("useModuleRegistrationStatusDispatcher", () => {
    function renderUseModuleRegistrationStatusDispatcherHook<TProps>(areModulesRegistered: boolean, areModulesReady: boolean, dispatch: AppRouterDispatch, additionalProps: RenderHookOptions<TProps> = {}) {
        const runtime = new FireflyRuntime();

        return renderHook(() => useModuleRegistrationStatusDispatcher(areModulesRegistered, areModulesReady, dispatch), {
            wrapper: ({ children }: { children?: ReactNode }) => (
                <RuntimeContext.Provider value={runtime}>
                    {children}
                </RuntimeContext.Provider>
            ),
            ...additionalProps
        });
    }

    test("when local modules and remote modules are not registered, do not dispatch the \"modules-registered\" action", () => {
        const localModuleRegistry = new DummyModuleRegistry("registering-modules");
        const remoteModuleRegistry = new DummyModuleRegistry("registering-modules");

        __setLocalModuleRegistry(localModuleRegistry);
        __setRemoteModuleRegistry(remoteModuleRegistry);

        const dispatch = jest.fn();

        renderUseModuleRegistrationStatusDispatcherHook(false, false, dispatch);

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

        renderUseModuleRegistrationStatusDispatcherHook(false, false, dispatch);

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

        renderUseModuleRegistrationStatusDispatcherHook(false, false, dispatch);

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

        renderUseModuleRegistrationStatusDispatcherHook(false, false, dispatch);

        localModuleRegistry.invokeEventListeners();
        remoteModuleRegistry.invokeEventListeners();

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({ type: "modules-registered" });
    });

    test("when local modules and remote modules are registered and \"areModulesRegistered\" is already true, do not dispatch the \"modules-registered\" action", () => {
        const localModuleRegistry = new DummyModuleRegistry("modules-registered");
        const remoteModuleRegistry = new DummyModuleRegistry("modules-registered");

        __setLocalModuleRegistry(localModuleRegistry);
        __setRemoteModuleRegistry(remoteModuleRegistry);

        const dispatch = jest.fn();

        renderUseModuleRegistrationStatusDispatcherHook(true, false, dispatch);

        localModuleRegistry.invokeEventListeners();
        remoteModuleRegistry.invokeEventListeners();

        expect(dispatch).not.toHaveBeenCalled();
    });

    test("when local modules and remote modules are not ready, do not dispatch the \"modules-ready\" action", () => {
        const localModuleRegistry = new DummyModuleRegistry("modules-registered");
        const remoteModuleRegistry = new DummyModuleRegistry("modules-registered");

        __setLocalModuleRegistry(localModuleRegistry);
        __setRemoteModuleRegistry(remoteModuleRegistry);

        const dispatch = jest.fn();

        renderUseModuleRegistrationStatusDispatcherHook(true, false, dispatch);

        localModuleRegistry.invokeEventListeners();
        remoteModuleRegistry.invokeEventListeners();

        expect(dispatch).not.toHaveBeenCalled();
    });

    test("when local modules are ready but remote modules are not ready, do not dispatch the \"modules-ready\" action", () => {
        const localModuleRegistry = new DummyModuleRegistry("ready");
        const remoteModuleRegistry = new DummyModuleRegistry("modules-registered");

        __setLocalModuleRegistry(localModuleRegistry);
        __setRemoteModuleRegistry(remoteModuleRegistry);

        const dispatch = jest.fn();

        renderUseModuleRegistrationStatusDispatcherHook(true, false, dispatch);

        localModuleRegistry.invokeEventListeners();
        remoteModuleRegistry.invokeEventListeners();

        expect(dispatch).not.toHaveBeenCalled();
    });

    test("when local modules are not ready but remote modules are ready, do not dispatch the \"modules-ready\" action", () => {
        const localModuleRegistry = new DummyModuleRegistry("modules-registered");
        const remoteModuleRegistry = new DummyModuleRegistry("ready");

        __setLocalModuleRegistry(localModuleRegistry);
        __setRemoteModuleRegistry(remoteModuleRegistry);

        const dispatch = jest.fn();

        renderUseModuleRegistrationStatusDispatcherHook(true, false, dispatch);

        localModuleRegistry.invokeEventListeners();
        remoteModuleRegistry.invokeEventListeners();

        expect(dispatch).not.toHaveBeenCalled();
    });

    test("when local modules and remote modules are ready, dispatch the \"modules-ready\" action", async () => {
        const localModuleRegistry = new DummyModuleRegistry("ready");
        const remoteModuleRegistry = new DummyModuleRegistry("ready");

        __setLocalModuleRegistry(localModuleRegistry);
        __setRemoteModuleRegistry(remoteModuleRegistry);

        const dispatch = jest.fn();

        renderUseModuleRegistrationStatusDispatcherHook(true, false, dispatch);

        localModuleRegistry.invokeEventListeners();
        remoteModuleRegistry.invokeEventListeners();

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({ type: "modules-ready" });
    });

    test("when local modules and remote modules are ready and \"areModulesReady\" is already true, do not dispatch the \"modules-ready\" action", async () => {
        const localModuleRegistry = new DummyModuleRegistry("ready");
        const remoteModuleRegistry = new DummyModuleRegistry("ready");

        __setLocalModuleRegistry(localModuleRegistry);
        __setRemoteModuleRegistry(remoteModuleRegistry);

        const dispatch = jest.fn();

        renderUseModuleRegistrationStatusDispatcherHook(true, true, dispatch);

        localModuleRegistry.invokeEventListeners();
        remoteModuleRegistry.invokeEventListeners();

        expect(dispatch).not.toHaveBeenCalled();
    });
});

describe("useMswStatusDispatcher", () => {
    function renderUseMswStatusDispatcherHook<TProps>(isMswReady: boolean, dispatch: AppRouterDispatch, additionalProps: RenderHookOptions<TProps> = {}) {
        const runtime = new FireflyRuntime();

        return renderHook(() => useMswStatusDispatcher(isMswReady, dispatch), {
            wrapper: ({ children }: { children?: ReactNode }) => (
                <RuntimeContext.Provider value={runtime}>
                    {children}
                </RuntimeContext.Provider>
            ),
            ...additionalProps
        });
    }

    test("when msw is not ready, do not dispatch the \"msw-ready\" action", () => {
        const mswState = new DummyMswState(false);

        __setMswState(mswState);

        const dispatch = jest.fn();

        renderUseMswStatusDispatcherHook(false, dispatch);

        mswState.invokeEventListeners();

        expect(dispatch).not.toHaveBeenCalled();
    });

    test("when msw is ready, dispatch the \"msw-ready\" action", () => {
        const mswState = new DummyMswState(true);

        __setMswState(mswState);

        const dispatch = jest.fn();

        renderUseMswStatusDispatcherHook(false, dispatch);

        mswState.invokeEventListeners();

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({ type: "msw-ready" });
    });

    test("when msw is ready and \"isMswReady\" is already true, do not dispatch the \"msw-ready\" action", () => {
        const mswState = new DummyMswState(true);

        __setMswState(mswState);

        const dispatch = jest.fn();

        renderUseMswStatusDispatcherHook(true, dispatch);

        mswState.invokeEventListeners();

        expect(dispatch).not.toHaveBeenCalled();
    });
});
