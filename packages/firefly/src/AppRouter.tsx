import { isNil, useLogger } from "@squide/core";
import { useIsMswStarted } from "@squide/msw";
import { useIsRouteMatchProtected, useRoutes, type Route } from "@squide/react-router";
import { useAreModulesReady, useAreModulesRegistered } from "@squide/webpack-module-federation";
import { cloneElement, useCallback, useEffect, useMemo, useState, type ReactElement } from "react";
import { ErrorBoundary, useErrorBoundary } from "react-error-boundary";
import { Outlet, useLocation, type RouterProviderProps } from "react-router-dom";

export type OnLoadPublicDataFunction = () => Promise<unknown>;

export type OnLoadProtectedDataFunction = () => Promise<unknown>;

export type OnCompleteRegistrationsFunction = () => Promise<unknown>;

interface BootstrappingRouteProps {
    fallbackElement: ReactElement;
    onLoadPublicData?: OnLoadPublicDataFunction;
    onLoadProtectedData?: OnLoadProtectedDataFunction;
    onCompleteRegistrations?: OnCompleteRegistrationsFunction;
    waitForMsw: boolean;
    areModulesRegistered: boolean;
    areModulesReady: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isPromise<T = unknown>(value: any): value is Promise<T> {
    return !isNil(value) && !isNil(value.then) && !isNil(value.catch);
}

// Most of the bootstrapping logic has been moved to this component because AppRouter
// cannot leverage "useLocation" since it must be used in a child component of "RouterProvider".
export function BootstrappingRoute(props: BootstrappingRouteProps) {
    const {
        fallbackElement,
        onLoadPublicData,
        onLoadProtectedData,
        onCompleteRegistrations,
        waitForMsw,
        areModulesRegistered,
        areModulesReady
    } = props;

    // Initialize as loaded if no handler is provided to load the public data.
    const [isPublicDataLoaded, setIsPublicDataLoaded] = useState(!onLoadPublicData);

    // Initialize as loaded if no handler is provided to load the protected data.
    const [isProtectedDataLoaded, setIsProtectedDataLoaded] = useState(!onLoadProtectedData);

    const { showBoundary } = useErrorBoundary();

    const logger = useLogger();
    const location = useLocation();

    // Re-render the app once MSW is started, otherwise, the API calls for module routes will return a 404 status.
    const isMswStarted = useIsMswStarted(waitForMsw);

    useEffect(() => {
        // Only log these messages if MSW is enabled.
        if (waitForMsw) {
            if ((areModulesRegistered || areModulesReady) && !isMswStarted) {
                logger.debug(`[shell] Modules are ${areModulesReady ? "ready" : "registered"}, waiting for MSW to start...`);
            } else if (!areModulesRegistered && !areModulesReady && isMswStarted) {
                logger.debug("[shell] MSW is started, waiting for the modules...");
            }
        }
    }, [logger, areModulesRegistered, areModulesReady, isMswStarted, waitForMsw]);

    useEffect(() => {
        // Don't go further if no handler has been provided to load public data.
        if (onLoadPublicData) {
            if ((areModulesRegistered || areModulesReady) && isMswStarted) {
                if (!isPublicDataLoaded) {
                    logger.debug("[shell] Loading public data.");

                    const result = onLoadPublicData();

                    if (!isPromise(result)) {
                        throw Error("[squide] An AppRouter onLoadPublicData handler must return a promise object.");
                    }

                    result
                        .then(() => {
                            setIsPublicDataLoaded(true);

                            logger.debug("[shell] Public data has been loaded.");
                        })
                        .catch(error => {
                            showBoundary(error);
                        });
                }
            }
        }
    }, [logger, areModulesRegistered, areModulesReady, isMswStarted, isPublicDataLoaded, showBoundary, onLoadPublicData]);

    // Only throw when there's no match if the modules has been registered, otherwise it's expected that there are no registered routes.
    const isActiveRouteProtected = useIsRouteMatchProtected(location, { throwWhenThereIsNoMatch: areModulesReady });

    useEffect(() => {
        // Don't go further if no handler has been provided to load protected data.
        if (onLoadProtectedData) {
            if ((areModulesRegistered || areModulesReady) && isMswStarted) {
                if (isActiveRouteProtected) {
                    if (!isProtectedDataLoaded) {
                        logger.debug(`[shell] Loading protected data as "${location.pathname}" is a protected route.`);

                        const result = onLoadProtectedData();

                        if (!isPromise(result)) {
                            throw Error("[squide] An AppRouter onLoadProtectedData handler must return a promise object.");
                        }

                        result.then(() => {
                            setIsProtectedDataLoaded(true);

                            logger.debug("[shell] Protected data has been loaded.");
                        })
                            .catch(error => {
                                showBoundary(error);
                            });
                    }
                } else {
                    logger.debug(`[shell] Not loading protected data as "${location.pathname}" is a public route.`);
                }
            }
        }
    }, [logger, location, areModulesRegistered, areModulesReady, isMswStarted, isActiveRouteProtected, isProtectedDataLoaded, showBoundary, onLoadProtectedData]);

    useEffect(() => {
        // Don't go further if no handler has been provided to complete the registration.
        if (onCompleteRegistrations) {
            if (areModulesRegistered && isMswStarted && isPublicDataLoaded) {
                if (!areModulesReady) {
                    onCompleteRegistrations();
                }
            }
        }
    }, [areModulesRegistered, areModulesReady, isMswStarted, isPublicDataLoaded, onCompleteRegistrations]);

    if (!areModulesReady || !isMswStarted || !isPublicDataLoaded || (isActiveRouteProtected && !isProtectedDataLoaded)) {
        return fallbackElement;
    }

    return (
        <Outlet />
    );
}

export type RenderRouterProviderFunction = (routes: Route[], providerProps: Omit<RouterProviderProps, "router">) => ReactElement;

export interface AppRouterProps {
    fallbackElement: ReactElement;
    errorElement: ReactElement;
    onLoadPublicData?: OnLoadPublicDataFunction;
    onLoadProtectedData?: OnLoadProtectedDataFunction;
    onCompleteRegistrations?: OnCompleteRegistrationsFunction;
    waitForMsw: boolean;
    children: RenderRouterProviderFunction;
}

export function AppRouter(props: AppRouterProps) {
    const {
        fallbackElement,
        errorElement,
        onLoadPublicData,
        onLoadProtectedData,
        onCompleteRegistrations,
        waitForMsw,
        children: renderRouterProvider
    } = props;

    // Re-render the app once all the remote modules are registered, otherwise the remote modules routes won't be added to the router.
    const areModulesRegistered = useAreModulesRegistered();

    // Re-render the app once all the remote modules are ready, otherwise the deferred remote modules routes won't be added to the router.
    const areModulesReady = useAreModulesReady();

    const routes = useRoutes();

    const errorRenderer = useCallback(({ error }: { error: unknown }) => {
        return cloneElement(errorElement, {
            error
        });
    }, [errorElement]);

    return useMemo(() => {
        return renderRouterProvider([
            {
                element: (
                    <ErrorBoundary fallbackRender={errorRenderer}>
                        <BootstrappingRoute
                            fallbackElement={fallbackElement}
                            onLoadPublicData={onLoadPublicData}
                            onLoadProtectedData={onLoadProtectedData}
                            onCompleteRegistrations={onCompleteRegistrations}
                            waitForMsw={waitForMsw}
                            areModulesRegistered={areModulesRegistered}
                            areModulesReady={areModulesReady}
                        />
                    </ErrorBoundary>
                ),
                children: routes
            }
        ], {});
    }, [areModulesRegistered, areModulesReady, routes, onLoadPublicData, onLoadProtectedData, onCompleteRegistrations, waitForMsw, errorRenderer, fallbackElement, renderRouterProvider]);
}
