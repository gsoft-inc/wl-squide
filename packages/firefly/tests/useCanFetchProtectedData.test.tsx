import { renderHook, type RenderHookOptions } from "@testing-library/react";
import type { ReactNode } from "react";
import { AppRouterStateContext } from "../src/AppRouterContext.ts";
import type { AppRouterState } from "../src/AppRouterReducer.ts";
import { useCanFetchProtectedData } from "../src/useCanFetchProtectedData.ts";

function createDefaultAppRouterState(): AppRouterState {
    return {
        areModulesReady: false,
        areModulesRegistered: false,
        isActiveRouteProtected: false,
        isMswReady: false,
        isProtectedDataReady: false,
        isPublicDataReady: false,
        isUnauthorized: false,
        waitForMsw: false,
        waitForProtectedData: false,
        waitForPublicData: false
    };
}

function renderUseCanFetchProtectedDataHook<TProps>(state: AppRouterState, additionalProps: RenderHookOptions<TProps> = {}) {
    return renderHook(() => useCanFetchProtectedData(), {
        wrapper: ({ children }: { children?: ReactNode }) => (
            <AppRouterStateContext.Provider value={state}>
                {children}
            </AppRouterStateContext.Provider>
        ),
        ...additionalProps
    });
}

test("when the protected data has already been fetched, return true", () => {
    const state = createDefaultAppRouterState();
    state.isProtectedDataReady = true;

    const { result } = renderUseCanFetchProtectedDataHook(state);

    expect(result.current).toBeTruthy();
});

test("when the modules are registered, the active route is protected, and msw is ready, return true", () => {
    const state = createDefaultAppRouterState();
    state.areModulesRegistered = true;
    state.isActiveRouteProtected = true;
    state.isMswReady = true;

    const { result } = renderUseCanFetchProtectedDataHook(state);

    expect(result.current).toBeTruthy();
});

test("when the modules are ready, and the active route is protected, and msw is ready, return true", () => {
    const state = createDefaultAppRouterState();
    state.areModulesReady = true;
    state.isActiveRouteProtected = true;
    state.isMswReady = true;

    const { result } = renderUseCanFetchProtectedDataHook(state);

    expect(result.current).toBeTruthy();
});

test("when the modules are registered or ready, the active route is protected, and msw is not ready but it's not required to wait for msw, return true", () => {
    const state = createDefaultAppRouterState();
    state.areModulesReady = true;
    state.isActiveRouteProtected = true;
    state.waitForMsw = false;

    const { result } = renderUseCanFetchProtectedDataHook(state);

    expect(result.current).toBeTruthy();
});

test("when the modules are not registered, return false", () => {
    const state = createDefaultAppRouterState();
    state.areModulesRegistered = false;
    state.isActiveRouteProtected = true;
    state.isMswReady = true;

    const { result } = renderUseCanFetchProtectedDataHook(state);

    expect(result.current).toBeFalsy();
});

test("when the modules are not ready, return false", () => {
    const state = createDefaultAppRouterState();
    state.areModulesReady = false;
    state.isActiveRouteProtected = true;
    state.isMswReady = true;

    const { result } = renderUseCanFetchProtectedDataHook(state);

    expect(result.current).toBeFalsy();
});

test("when the active route is not protected, return false", () => {
    const state = createDefaultAppRouterState();
    state.areModulesReady = true;
    state.isActiveRouteProtected = false;
    state.isMswReady = true;

    const { result } = renderUseCanFetchProtectedDataHook(state);

    expect(result.current).toBeFalsy();
});

test("when it's required to wait for msw and msw is not ready, return false", () => {
    const state = createDefaultAppRouterState();
    state.areModulesReady = true;
    state.isActiveRouteProtected = true;
    state.waitForMsw = true;
    state.isMswReady = false;

    const { result } = renderUseCanFetchProtectedDataHook(state);

    expect(result.current).toBeFalsy();
});
