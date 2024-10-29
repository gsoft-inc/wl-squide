import type { AppRouterState } from "../src/AppRouterReducer.ts";

export function sleep(delay: number) {
    return new Promise(resolve => setTimeout(resolve, delay));
}

export function createDefaultAppRouterState(): AppRouterState {
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
