import { addLocalModuleRegistrationStatusChangedListener, getLocalModuleRegistrationStatus, removeLocalModuleRegistrationStatusChangedListener, useLogger } from "@squide/core";
import { addRemoteModuleRegistrationStatusChangedListener, areModulesReady, areModulesRegistered, getRemoteModuleRegistrationStatus, removeRemoteModuleRegistrationStatusChangedListener } from "@squide/module-federation";
import { addMswStateChangedListener, isMswReady, removeMswStateChangedListener } from "@squide/msw";
import { useCallback, useEffect, useMemo, useReducer, type Dispatch } from "react";

export interface AppRouterState {
    waitForMsw: boolean;
    waitForPublicData: boolean;
    waitForProtectedData: boolean;
    areModulesRegistered: boolean;
    areModulesReady: boolean;
    isMswReady: boolean;
    isPublicDataReady: boolean;
    isProtectedDataReady: boolean;
    publicDataUpdatedAt?: number;
    protectedDataUpdatedAt?: number;
    deferredRegistrationsUpdatedAt?: number;
    isActiveRouteProtected: boolean;
    isUnauthorized: boolean;
}

export type AppRouterActionType =
| "modules-registered"
| "modules-ready"
| "msw-ready"
| "public-data-ready"
| "protected-data-ready"
| "public-data-updated"
| "protected-data-updated"
| "deferred-registrations-updated"
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
                areModulesReady: true,
                // Will be set even if the app is not using deferred registrations.
                deferredRegistrationsUpdatedAt: Date.now()
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
                isPublicDataReady: true,
                publicDataUpdatedAt: Date.now()
            };

            break;
        }
        case "protected-data-ready": {
            newState = {
                ...newState,
                isProtectedDataReady: true,
                protectedDataUpdatedAt: Date.now()
            };

            break;
        }
        case "public-data-updated": {
            newState = {
                ...newState,
                publicDataUpdatedAt: Date.now()
            };

            break;
        }
        case "protected-data-updated": {
            newState = {
                ...newState,
                protectedDataUpdatedAt: Date.now()
            };

            break;
        }
        case "deferred-registrations-updated": {
            newState = {
                ...newState,
                deferredRegistrationsUpdatedAt: Date.now()
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

export function useModuleRegistrationStatusDispatcher(areModulesRegisteredValue: boolean, areModulesReadyValue: boolean, dispatch: AppRouterDispatch) {
    const logger = useLogger();

    return useEffect(() => {
        const handleModulesRegistrationStatusChange = () => {
            if (!areModulesRegisteredValue && getAreModulesRegistered()) {
                dispatch({ type: "modules-registered" });
            }

            if (!areModulesReadyValue && getAreModulesReady()) {
                dispatch({ type: "modules-ready" });

                logger.debug("[squide] %cModules are ready%c.", "color: white; background-color: green;", "");
            }
        };

        addLocalModuleRegistrationStatusChangedListener(handleModulesRegistrationStatusChange);
        addRemoteModuleRegistrationStatusChangedListener(handleModulesRegistrationStatusChange);

        return () => {
            removeLocalModuleRegistrationStatusChangedListener(handleModulesRegistrationStatusChange);
            removeRemoteModuleRegistrationStatusChangedListener(handleModulesRegistrationStatusChange);
        };
    }, [areModulesRegisteredValue, areModulesReadyValue, dispatch, logger]);
}

export function useMswStatusDispatcher(isMswReadyValue: boolean, dispatch: AppRouterDispatch) {
    const logger = useLogger();

    useEffect(() => {
        const handleMswStateChange = () => {
            if (!isMswReadyValue && isMswReady()) {
                dispatch({ type: "msw-ready" });

                logger.debug("[squide] %cMSW is ready%c.", "color: white; background-color: green;", "");
            }
        };

        addMswStateChangedListener(handleMswStateChange);

        return () => {
            removeMswStateChangedListener(handleMswStateChange);
        };
    }, [isMswReadyValue, dispatch, logger]);
}

let dispatchProxyFactory: ((reactDispatch: AppRouterDispatch) => AppRouterDispatch) | undefined;

// This function should only be used by tests.
export function __setAppReducerDispatchProxyFactory(factory: (reactDispatch: AppRouterDispatch) => AppRouterDispatch) {
    dispatchProxyFactory = factory;
}

// This function should only be used by tests.
export function __clearAppReducerDispatchProxy() {
    dispatchProxyFactory = undefined;
}

function useDispatchProxy(reactDispatch: AppRouterDispatch) {
    return useMemo(() => {
        return dispatchProxyFactory ? dispatchProxyFactory(reactDispatch) : reactDispatch;
    }, [reactDispatch]);
}

export function useAppRouterReducer(waitForMsw: boolean, waitForPublicData: boolean, waitForProtectedData: boolean): [AppRouterState, AppRouterDispatch] {
    const [state, reactDispatch] = useReducer(reducer, {
        waitForMsw,
        waitForPublicData,
        waitForProtectedData,
        // When the modules registration functions are awaited, the event listeners are registered after the modules are registered.
        areModulesRegistered: getAreModulesRegistered(),
        areModulesReady: getAreModulesReady(),
        isMswReady: isMswReady(),
        isPublicDataReady: false,
        isProtectedDataReady: false,
        isActiveRouteProtected: false,
        isUnauthorized: false
    });

    const {
        areModulesRegistered: areModulesRegisteredValue,
        areModulesReady: areModulesReadyValue,
        isMswReady: isMswReadyValue
    } = state;

    // The dispatch proxy is strictly an utility allowing tests to mock the useReducer dispatch function. It's easier
    // than mocking the import from React.
    const dispatchProxy = useDispatchProxy(reactDispatch);
    const dispatch = useVerboseDispatch(dispatchProxy);

    useModuleRegistrationStatusDispatcher(areModulesRegisteredValue, areModulesReadyValue, dispatch);
    useMswStatusDispatcher(isMswReadyValue, dispatch);

    return [state, dispatch];
}
