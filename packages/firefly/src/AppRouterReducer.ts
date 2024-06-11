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
    isUnauthorized: boolean;
    isAppReady: boolean;
    isAppReadyForUnauthorizedRequest: boolean;
}

export type AppRouterActionType =
| "modules-registered"
| "modules-ready"
| "msw-ready"
| "public-data-ready"
| "protected-data-ready"
| "active-route-is-protected"
| "is-unauthorized";

export interface AppRouterAction {
    type: AppRouterActionType;
}

export type AppRouterDispatch = Dispatch<AppRouterAction>;

function useVerboseDispatch(dispatch: AppRouterDispatch) {
    const logger = useLogger();

    return useCallback((action: AppRouterAction) => {
        logger.debug("[squide] The following action has been dispatched to the AppRouter reducer:", action);

        dispatch(action);
    }, [dispatch, logger]);
}

function computeCanFetchPublicData(state: AppRouterState): AppRouterState {
    const {
        areModulesRegistered: areModulesRegisteredValue,
        areModulesReady: areModulesReadyValue,
        isMswReady: isMswReadyValue,
        isPublicDataReady
    } = state;

    const canFetch = isPublicDataReady || ((areModulesRegisteredValue || areModulesReadyValue) && isMswReadyValue);

    // This is an optimization to keep the same state object if the state hasn't changed.
    if (canFetch && !state.canFetchPublicData) {
        return {
            ...state,
            canFetchPublicData: canFetch
        };
    }

    return state;
}

function computeCanFetchProtectedData(state: AppRouterState): AppRouterState {
    const {
        areModulesRegistered: areModulesRegisteredValue,
        areModulesReady: areModulesReadyValue,
        isMswReady: isMswReadyValue,
        isProtectedDataReady,
        isActiveRouteProtected
    } = state;

    const canFetch = isProtectedDataReady || ((areModulesRegisteredValue || areModulesReadyValue) && isMswReadyValue && isActiveRouteProtected);

    // This is an optimization to keep the same state object if the state hasn't changed.
    if (canFetch && !state.canFetchProtectedData) {
        return {
            ...state,
            canFetchProtectedData: canFetch
        };
    }

    return state;
}

function computeCanCompleteRegistrations(state: AppRouterState): AppRouterState {
    const {
        waitForMsw,
        waitForPublicData,
        waitForProtectedData,
        areModulesRegistered: areModulesRegisteredValue,
        isMswReady: isMswReadyValue,
        isPublicDataReady,
        isProtectedDataReady,
        isActiveRouteProtected,
        isUnauthorized
    } = state;

    const canCompleteRegistrations = !isUnauthorized && areModulesRegisteredValue
        && (!waitForMsw || isMswReadyValue)
        && (!waitForPublicData || isPublicDataReady)
        && (!waitForProtectedData || !isActiveRouteProtected || isProtectedDataReady);

    // This is an optimization to keep the same state object if the state hasn't changed.
    if (canCompleteRegistrations && !state.canCompleteRegistrations) {
        return {
            ...state,
            canCompleteRegistrations
        };
    }

    return state;
}

function computeIsAppReady(state: AppRouterState): AppRouterState {
    const {
        waitForMsw,
        waitForPublicData,
        waitForProtectedData,
        areModulesReady: areModulesReadyValue,
        isMswReady: isMswReadyValue,
        isPublicDataReady,
        isProtectedDataReady,
        isActiveRouteProtected,
        isUnauthorized
    } = state;

    const isAppReady = !isUnauthorized && areModulesReadyValue
        && (!waitForMsw || isMswReadyValue)
        && (!waitForPublicData || isPublicDataReady)
        && (!waitForProtectedData || !isActiveRouteProtected || isProtectedDataReady);

    // This is an optimization to keep the same state object if the state hasn't changed.
    if (isAppReady && !state.isAppReady) {
        return {
            ...state,
            isAppReady
        };
    }

    return state;
}

function computeIsAppReadyForUnauthorizedUser(state: AppRouterState): AppRouterState {
    const {
        waitForMsw,
        waitForPublicData,
        isMswReady: isMswReadyValue,
        isPublicDataReady,
        isUnauthorized
    } = state;

    const isAppReadyForUnauthorizedRequest = isUnauthorized
        && (!waitForMsw || isMswReadyValue)
        && (!waitForPublicData || isPublicDataReady);

    // This is an optimization to keep the same state object if the state hasn't changed.
    if (isAppReadyForUnauthorizedRequest && !state.isAppReadyForUnauthorizedRequest) {
        return {
            ...state,
            isAppReadyForUnauthorizedRequest
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
        case "active-route-is-protected": {
            newState = {
                ...newState,
                isActiveRouteProtected: true
            };

            break;
        }
        case "is-unauthorized": {
            newState = {
                ...newState,
                isUnauthorized: true
            };

            break;
        }
        default: {
            throw new Error(`[squide] The AppRouter component state reducer doesn't support action type "${action.type}".`);
        }
    }

    // Compute derived states.
    newState = computeCanFetchPublicData(newState);
    newState = computeCanFetchProtectedData(newState);
    newState = computeCanCompleteRegistrations(newState);
    newState = computeIsAppReady(newState);
    newState = computeIsAppReadyForUnauthorizedUser(newState);

    return newState;
}

export function getAreModulesRegistered() {
    const localModuleStatus = getLocalModuleRegistrationStatus();
    const remoteModuleStatus = getRemoteModuleRegistrationStatus();

    return areModulesRegistered(localModuleStatus, remoteModuleStatus);
}

export function getAreModulesReady() {
    const localModuleStatus = getLocalModuleRegistrationStatus();
    const remoteModuleStatus = getRemoteModuleRegistrationStatus();

    return areModulesReady(localModuleStatus, remoteModuleStatus);
}

export function useAppRouterReducer(waitForMsw: boolean, waitForPublicData: boolean, waitForProtectedData: boolean): [AppRouterState, AppRouterDispatch] {
    const [state, originalDispatch] = useReducer(reducer, {
        waitForMsw,
        waitForPublicData,
        waitForProtectedData,
        // When the modules registration functions are awaited, the event listeners are registered after the modules are registered.
        areModulesRegistered: getAreModulesRegistered(),
        areModulesReady: getAreModulesReady(),
        isMswReady: isMswReady(),
        canFetchPublicData: false,
        canFetchProtectedData: false,
        canCompleteRegistrations: false,
        isPublicDataReady: false,
        isProtectedDataReady: false,
        isActiveRouteProtected: false,
        isUnauthorized: false,
        isAppReady: false,
        isAppReadyForUnauthorizedRequest: false
    });

    const {
        areModulesRegistered: areModulesRegisteredValue,
        areModulesReady: areModulesReadyValue,
        isMswReady: isMswReadyValue
    } = state;

    const dispatch = useVerboseDispatch(originalDispatch);

    useEffect(() => {
        const handleModulesRegistrationStatusChange = () => {
            if (!areModulesRegisteredValue && getAreModulesRegistered()) {
                dispatch({ type: "modules-registered" });
            }

            if (!areModulesReadyValue && getAreModulesReady()) {
                dispatch({ type: "modules-ready" });
            }
        };

        addLocalModuleRegistrationStatusChangedListener(handleModulesRegistrationStatusChange);
        addRemoteModuleRegistrationStatusChangedListener(handleModulesRegistrationStatusChange);

        return () => {
            removeLocalModuleRegistrationStatusChangedListener(handleModulesRegistrationStatusChange);
            removeRemoteModuleRegistrationStatusChangedListener(handleModulesRegistrationStatusChange);
        };
    }, [areModulesRegisteredValue, areModulesReadyValue, dispatch]);

    useEffect(() => {
        const handleMswStateChange = () => {
            if (!isMswReadyValue && isMswReady()) {
                dispatch({ type: "msw-ready" });
            }
        };

        addMswStateChangedListener(handleMswStateChange);

        return () => {
            removeMswStateChangedListener(handleMswStateChange);
        };
    }, [isMswReadyValue, dispatch]);

    useEffect(() => {});

    return [state, dispatch];
}
