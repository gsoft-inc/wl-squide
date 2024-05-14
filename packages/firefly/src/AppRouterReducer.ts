import { addLocalModuleRegistrationStatusChangedListener, getLocalModuleRegistrationStatus, removeLocalModuleRegistrationStatusChangedListener, useLogger } from "@squide/core";
import { addRemoteModuleRegistrationStatusChangedListener, areModulesReady, areModulesRegistered, getRemoteModuleRegistrationStatus, removeRemoteModuleRegistrationStatusChangedListener } from "@squide/module-federation";
import { addMswStateChangedListener, isMswReady, removeMswStateChangedListener } from "@squide/msw";
import { useCallback, useEffect, useReducer, type Dispatch } from "react";

export interface AppRouterState {
    waitForMsw: boolean;
    waitForPublicData: boolean;
    waitForProtectedData: boolean;
    areModulesRegistered: boolean;
    areModulesReady: boolean;
    isMswReady: boolean;
    canFetchPublicData: boolean;
    canFetchProtectedData: boolean;
    canCompleteRegistrations: boolean;
    isPublicDataReady: boolean;
    isProtectedDataReady: boolean;
    isActiveRouteProtected: boolean;
    isAppReady: boolean;
}

export type AppRouterActionType =
| "modules-registered"
| "modules-ready"
| "msw-ready"
| "public-data-ready"
| "protected-data-ready"
| "active-route-is-public"
| "active-route-is-protected";

export interface AppRouterAction {
    type: AppRouterActionType;
}

function useVerboseDispatch(dispatch: Dispatch<AppRouterAction>) {
    const logger = useLogger();

    return useCallback((action: AppRouterAction) => {
        logger.debug("[squide] The following action has been dispatched to the AppRouter reducer:", action);

        dispatch(action);
    }, [dispatch, logger]);
}

function evaluateCanFetchPublicData(state: AppRouterState): AppRouterState {
    const {
        areModulesRegistered: areModulesRegisteredValue,
        areModulesReady: areModulesReadyValue,
        isMswReady: isMswReadyValue,
        isPublicDataReady
    } = state;

    const canFetch = isPublicDataReady || ((areModulesRegisteredValue || areModulesReadyValue) && isMswReadyValue);

    // This is an optimization to keep the same state object if the state hasn't changed.
    if (state.canFetchPublicData !== canFetch) {
        return {
            ...state,
            canFetchPublicData: canFetch
        };
    }

    return state;
}

function evaluateCanFetchProtectedData(state: AppRouterState): AppRouterState {
    const {
        areModulesRegistered: areModulesRegisteredValue,
        areModulesReady: areModulesReadyValue,
        isMswReady: isMswReadyValue,
        isProtectedDataReady,
        isActiveRouteProtected
    } = state;

    const canFetch = isProtectedDataReady || ((areModulesRegisteredValue || areModulesReadyValue) && isMswReadyValue && isActiveRouteProtected);

    // This is an optimization to keep the same state object if the state hasn't changed.
    if (state.canFetchProtectedData !== canFetch) {
        return {
            ...state,
            canFetchProtectedData: canFetch
        };
    }

    return state;
}

function evaluateCanCompleteRegistrations(state: AppRouterState): AppRouterState {
    const {
        waitForMsw,
        waitForPublicData,
        waitForProtectedData,
        areModulesRegistered: areModulesRegisteredValue,
        areModulesReady: areModulesReadyValue,
        isMswReady: isMswReadyValue,
        isPublicDataReady,
        isProtectedDataReady,
        isActiveRouteProtected
    } = state;

    const canCompleteRegistrations = !areModulesReadyValue && areModulesRegisteredValue
        && (!waitForMsw || isMswReadyValue)
        && (!waitForPublicData || isPublicDataReady)
        && (!waitForProtectedData || !isActiveRouteProtected || isProtectedDataReady);

    // This is an optimization to keep the same state object if the state hasn't changed.
    if (state.canCompleteRegistrations !== canCompleteRegistrations) {
        return {
            ...state,
            canCompleteRegistrations
        };
    }

    return state;
}

function evaluateIsAppReady(state: AppRouterState): AppRouterState {
    const {
        waitForMsw,
        waitForPublicData,
        waitForProtectedData,
        areModulesReady: areModulesReadyValue,
        isMswReady: isMswReadyValue,
        isPublicDataReady,
        isProtectedDataReady,
        isActiveRouteProtected
    } = state;

    const isReady = areModulesReadyValue
        && (!waitForMsw || isMswReadyValue)
        && (!waitForPublicData || isPublicDataReady)
        && (!waitForProtectedData || !isActiveRouteProtected || isProtectedDataReady);

    // This is an optimization to keep the same state object if the state hasn't changed.
    if (state.isAppReady !== isReady) {
        return {
            ...state,
            isAppReady: isReady
        };
    }

    return state;
}

function reducer(state: AppRouterState, action: AppRouterAction) {
    let newState = state;

    switch (action.type) {
        case "modules-registered": {
            newState = {
                ...newState,
                areModulesRegistered: true
            };

            break;
        }
        case "modules-ready": {
            newState = {
                ...newState,
                areModulesReady: true
            };

            break;
        }
        case "msw-ready": {
            newState = {
                ...newState,
                isMswReady: true
            };

            break;
        }
        case "public-data-ready": {
            newState = {
                ...newState,
                isPublicDataReady: true
            };

            break;
        }
        case "protected-data-ready": {
            newState = {
                ...newState,
                isProtectedDataReady: true
            };

            break;
        }
        case "active-route-is-public": {
            newState = {
                ...newState,
                isActiveRouteProtected: false
            };

            break;
        }
        case "active-route-is-protected": {
            newState = {
                ...newState,
                isActiveRouteProtected: true
            };

            break;
        }
        default: {
            throw new Error(`[squide] The AppRouter component state reducer doesn't support action type "${action.type}".`);
        }
    }

    // Compute derived states.
    newState = evaluateCanFetchPublicData(newState);
    newState = evaluateCanFetchProtectedData(newState);
    newState = evaluateCanCompleteRegistrations(newState);
    newState = evaluateIsAppReady(newState);

    return newState;
}

function getAreModulesRegistered() {
    const localModuleStatus = getLocalModuleRegistrationStatus();
    const remoteModuleStatus = getRemoteModuleRegistrationStatus();

    return areModulesRegistered(localModuleStatus, remoteModuleStatus);
}

function getAreModulesReady() {
    const localModuleStatus = getLocalModuleRegistrationStatus();
    const remoteModuleStatus = getRemoteModuleRegistrationStatus();

    return areModulesReady(localModuleStatus, remoteModuleStatus);
}

export function useAppRouterReducer(waitForMsw: boolean, waitForPublicData: boolean, waitForProtectedData: boolean): [AppRouterState, Dispatch<AppRouterAction>] {
    const [state, originalDispatch] = useReducer(reducer, {
        waitForMsw,
        waitForPublicData,
        waitForProtectedData,
        // There could be a race-condition where the modules are registered before the event listener has been registered.
        areModulesRegistered: getAreModulesRegistered(),
        // There could be a race-condition where the modules are ready before the event listener has been registered.
        areModulesReady: getAreModulesReady(),
        // There could be a race-condition where MSW is ready before the event listener has been registered.
        isMswReady: isMswReady(),
        canFetchPublicData: false,
        canFetchProtectedData: false,
        canCompleteRegistrations: false,
        isPublicDataReady: false,
        isProtectedDataReady: false,
        isActiveRouteProtected: false,
        isAppReady: false
    });

    const {
        areModulesRegistered: areModulesRegisteredValue,
        areModulesReady: areModulesReadyValue,
        isMswReady: isMswReadyValue
    } = state;

    const dispatch = useVerboseDispatch(originalDispatch);

    const handleModulesRegistrationStatusChange = useCallback(() => {
        if (!areModulesRegisteredValue && getAreModulesRegistered()) {
            dispatch({ type: "modules-registered" });
        }

        if (!areModulesReadyValue && getAreModulesReady()) {
            dispatch({ type: "modules-ready" });
        }
    }, [areModulesRegisteredValue, areModulesReadyValue, dispatch]);

    const handleMswStateChange = useCallback(() => {
        if (!isMswReadyValue && isMswReady()) {
            dispatch({ type: "msw-ready" });
        }
    }, [isMswReadyValue, dispatch]);

    useEffect(() => {
        addLocalModuleRegistrationStatusChangedListener(handleModulesRegistrationStatusChange);

        return () => removeLocalModuleRegistrationStatusChangedListener(handleModulesRegistrationStatusChange);
    }, [handleModulesRegistrationStatusChange]);

    useEffect(() => {
        addRemoteModuleRegistrationStatusChangedListener(handleModulesRegistrationStatusChange);

        return () => removeRemoteModuleRegistrationStatusChangedListener(handleModulesRegistrationStatusChange);
    }, [handleModulesRegistrationStatusChange]);

    useEffect(() => {
        addMswStateChangedListener(handleMswStateChange);

        return () => removeMswStateChangedListener(handleMswStateChange);
    }, [handleMswStateChange]);

    return [state, dispatch];
}
