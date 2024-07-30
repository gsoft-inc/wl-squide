import { renderHook, type RenderHookOptions } from "@testing-library/react";
import type { ReactNode } from "react";
import { AppRouterStateContext } from "../src/AppRouterContext.ts";
import type { AppRouterState } from "../src/AppRouterReducer.ts";
import { useIsBootstrapping } from "../src/useIsBootstrapping.ts";

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

function renderUseIsBootstrappingHook<TProps>(state: AppRouterState, additionalProps: RenderHookOptions<TProps> = {}) {
    return renderHook(() => useIsBootstrapping(), {
        wrapper: ({ children }: { children?: ReactNode }) => (
            <AppRouterStateContext.Provider value={state}>
                {children}
            </AppRouterStateContext.Provider>
        ),
        ...additionalProps
    });
}

test("when modules are ready, and msw is ready, and public data is ready, and protected data is ready, return false", () => {
    const state = createDefaultAppRouterState();
    state.areModulesReady = true;
    state.isMswReady = true;
    state.isPublicDataReady = true;
    state.isProtectedDataReady = true;

    const { result } = renderUseIsBootstrappingHook(state);

    expect(result.current).toBeFalsy();
});

test("when msw is not ready but it's not required to wait for msw, return false", () => {
    const state = createDefaultAppRouterState();
    state.areModulesReady = true;
    state.waitForMsw = false;
    state.isMswReady = false;
    state.isPublicDataReady = true;
    state.isProtectedDataReady = true;

    const { result } = renderUseIsBootstrappingHook(state);

    expect(result.current).toBeFalsy();
});

test("when public data is not ready but it's not required to wait for public data, return false", () => {
    const state = createDefaultAppRouterState();
    state.areModulesReady = true;
    state.isMswReady = true;
    state.waitForPublicData = false;
    state.isPublicDataReady = false;
    state.isProtectedDataReady = true;

    const { result } = renderUseIsBootstrappingHook(state);

    expect(result.current).toBeFalsy();
});

test("when protected data is not ready but it's not required to wait for protected data, return false", () => {
    const state = createDefaultAppRouterState();
    state.areModulesReady = true;
    state.isMswReady = true;
    state.isPublicDataReady = true;
    state.waitForProtectedData = false;
    state.isProtectedDataReady = false;

    const { result } = renderUseIsBootstrappingHook(state);

    expect(result.current).toBeFalsy();
});

test("when protected data is not ready but the active route is public, return false", () => {
    const state = createDefaultAppRouterState();
    state.areModulesReady = true;
    state.isMswReady = true;
    state.isPublicDataReady = true;
    state.isActiveRouteProtected = false;
    state.isProtectedDataReady = false;

    const { result } = renderUseIsBootstrappingHook(state);

    expect(result.current).toBeFalsy();
});

test("when modules are not ready, return true", () => {
    const state = createDefaultAppRouterState();
    state.areModulesReady = false;
    state.isMswReady = true;
    state.isPublicDataReady = true;
    state.isProtectedDataReady = true;

    const { result } = renderUseIsBootstrappingHook(state);

    expect(result.current).toBeTruthy();
});

test("when msw is not ready, return true", () => {
    const state = createDefaultAppRouterState();
    state.areModulesReady = true;
    state.waitForMsw = true;
    state.isMswReady = false;
    state.isPublicDataReady = true;
    state.isProtectedDataReady = true;

    const { result } = renderUseIsBootstrappingHook(state);

    expect(result.current).toBeTruthy();
});

test("when public data is not ready, return true", () => {
    const state = createDefaultAppRouterState();
    state.areModulesReady = true;
    state.isMswReady = true;
    state.waitForPublicData = true;
    state.isPublicDataReady = false;
    state.isProtectedDataReady = true;

    const { result } = renderUseIsBootstrappingHook(state);

    expect(result.current).toBeTruthy();
});

test("when protected data is not ready, return true", () => {
    const state = createDefaultAppRouterState();
    state.areModulesReady = true;
    state.isMswReady = true;
    state.isPublicDataReady = true;
    state.waitForProtectedData = true;
    state.isActiveRouteProtected = true;
    state.isProtectedDataReady = false;

    const { result } = renderUseIsBootstrappingHook(state);

    expect(result.current).toBeTruthy();
});

test("when the session is unauthorized, return false", () => {
    const state = createDefaultAppRouterState();
    state.areModulesReady = false;
    state.isUnauthorized = true;

    const { result } = renderUseIsBootstrappingHook(state);

    expect(result.current).toBeFalsy();
});
