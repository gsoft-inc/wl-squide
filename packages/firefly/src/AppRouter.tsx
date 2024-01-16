import { isNil, useLogOnceLogger } from "@squide/core";
import { useIsMswStarted } from "@squide/msw";
import { useIsRouteMatchProtected, useRoutes, type Route } from "@squide/react-router";
import { useAreModulesReady, useAreModulesRegistered } from "@squide/webpack-module-federation";
import { cloneElement, useCallback, useEffect, useMemo, type ReactElement, type ReactNode } from "react";
import { ErrorBoundary, useErrorBoundary } from "react-error-boundary";
import { Outlet, useLocation, type RouterProviderProps } from "react-router-dom";

export type OnLoadPublicDataFunction = (signal: AbortSignal) => Promise<unknown>;

export type OnLoadProtectedDataFunction = (signal: AbortSignal) => Promise<unknown>;

export type OnCompleteRegistrationsFunction = () => Promise<unknown>;

function useLoadPublicData(areModulesRegistered: boolean, areModulesReady: boolean, isMswStarted: boolean, isLoaded: boolean, onLoadData?: OnLoadPublicDataFunction) {
    const logger = useLogOnceLogger();

    const { showBoundary } = useErrorBoundary<Error>();

    useEffect(() => {
        // Don't go further if no handler has been provided to load public data.
        if (onLoadData && !isLoaded) {
            if ((areModulesRegistered || areModulesReady) && isMswStarted) {
                // Prevent logging twice because of React strict mode.
                logger.debugOnce("loading-public-data", "[shell] Loading public data.");

                const abortController = new AbortController();

                const result = onLoadData(abortController.signal);

                if (!isPromise(result)) {
                    throw Error("[squide] An AppRouter onLoadPublicData handler must return a promise object.");
                }

                result
                    .then(() => {
                        // Prevent logging twice because of React strict mode.
                        logger.debugOnce("public-data-loaded", "[shell] Public data has been loaded.");
                    })
                    .catch(error => {
                        showBoundary(error);
                    });

                return () => {
                    abortController.abort();
                };
            }
        }
    }, [areModulesRegistered, areModulesReady, isMswStarted, isLoaded, showBoundary, onLoadData, logger]);
}

function useLoadProtectedData(areModulesRegistered: boolean, areModulesReady: boolean, isMswStarted: boolean, isActiveRouteProtected: boolean, isLoaded: boolean, onLoadData?: OnLoadProtectedDataFunction) {
    const logger = useLogOnceLogger();

    const { showBoundary } = useErrorBoundary<Error>();

    useEffect(() => {
        // Don't go further if no handler has been provided to load protected data.
        if (onLoadData && !isLoaded) {
            if ((areModulesRegistered || areModulesReady) && isMswStarted) {
                if (isActiveRouteProtected) {
                    // Prevent logging twice because of React strict mode.
                    logger.debugOnce("loading-protected-data", `[shell] Loading protected data as "${location.pathname}" is a protected route.`);

                    const abortController = new AbortController();

                    const result = onLoadData(abortController.signal);

                    if (!isPromise(result)) {
                        throw Error("[squide] An AppRouter onLoadProtectedData handler must return a promise object.");
                    }

                    result
                        .then(() => {
                            // Prevent logging twice because of React strict mode.
                            logger.debugOnce("protected-data-loaded", "[shell] Protected data has been loaded.");
                        })
                        .catch(error => {
                            showBoundary(error);
                        });

                    return () => {
                        abortController.abort();
                    };
                    // }
                } else {
                    // Prevent logging twice because of React strict mode.
                    logger.debugOnce("is-a-public-route", `[shell] Not loading protected data as "${location.pathname}" is a public route.`);
                }
            }
        }
    }, [areModulesRegistered, areModulesReady, isMswStarted, isActiveRouteProtected, isLoaded, showBoundary, onLoadData, logger]);
}

interface BootstrappingRouteProps {
    fallbackElement: ReactElement;
    onLoadPublicData?: OnLoadPublicDataFunction;
    onLoadProtectedData?: OnLoadProtectedDataFunction;
    isPublicDataLoaded: boolean;
    isProtectedDataLoaded: boolean;
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
        isPublicDataLoaded,
        isProtectedDataLoaded,
        onCompleteRegistrations,
        waitForMsw,
        areModulesRegistered,
        areModulesReady
    } = props;

    const logger = useLogOnceLogger();
    const location = useLocation();

    // Re-render the app once MSW is started, otherwise, the API calls for module routes will return a 404 status.
    const isMswStarted = useIsMswStarted(waitForMsw);

    useEffect(() => {
        // Only log these messages if MSW is enabled.
        if (waitForMsw) {
            if ((areModulesRegistered || areModulesReady) && !isMswStarted) {
                // Prevent logging twice because of React strict mode.
                logger.debugOnce("waiting-for-msw", `[shell] Modules are ${areModulesReady ? "ready" : "registered"}, waiting for MSW to start...`);
            } else if (!areModulesRegistered && !areModulesReady && isMswStarted) {
                // Prevent logging twice because of React strict mode.
                logger.debugOnce("waiting-for-modules", "[shell] MSW is started, waiting for the modules...");
            }
        }
    }, [logger, areModulesRegistered, areModulesReady, isMswStarted, waitForMsw]);

    // Try to load the public data if an handler is defined.
    useLoadPublicData(areModulesRegistered, areModulesReady, isMswStarted, isPublicDataLoaded, onLoadPublicData);

    // Only throw when there's no match if the modules has been registered, otherwise it's expected that there are no registered routes.
    const isActiveRouteProtected = useIsRouteMatchProtected(location, { throwWhenThereIsNoMatch: areModulesReady });

    // Try to load the protected data if an handler is defined.
    useLoadProtectedData(areModulesRegistered, areModulesReady, isMswStarted, isActiveRouteProtected, isProtectedDataLoaded, onLoadProtectedData);

    useEffect(() => {
        // Don't go further if no handler has been provided to complete the registration.
        if (onCompleteRegistrations) {
            if (areModulesRegistered && isMswStarted && isPublicDataLoaded && (!isActiveRouteProtected || isProtectedDataLoaded)) {
                if (!areModulesReady) {
                    onCompleteRegistrations();
                }
            }
        }
    }, [areModulesRegistered, areModulesReady, isMswStarted, isPublicDataLoaded, isProtectedDataLoaded, isActiveRouteProtected, onCompleteRegistrations]);

    if (!areModulesReady || !isMswStarted || !isPublicDataLoaded || (isActiveRouteProtected && !isProtectedDataLoaded)) {
        return fallbackElement;
    }

    return (
        <Outlet />
    );
}

export type RenderRouterProviderFunction = (routes: Route[], providerProps: Omit<RouterProviderProps, "router">) => ReactNode;

export interface AppRouterProps {
    fallbackElement: ReactElement;
    errorElement: ReactElement;
    onLoadPublicData?: OnLoadPublicDataFunction;
    onLoadProtectedData?: OnLoadProtectedDataFunction;
    isPublicDataLoaded?: boolean;
    isProtectedDataLoaded?: boolean;
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
        isPublicDataLoaded = true,
        isProtectedDataLoaded = true,
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
                            isPublicDataLoaded={isPublicDataLoaded}
                            isProtectedDataLoaded={isProtectedDataLoaded}
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
    }, [areModulesRegistered, areModulesReady, routes, onLoadPublicData, onLoadProtectedData, isPublicDataLoaded, isProtectedDataLoaded, onCompleteRegistrations, waitForMsw, errorRenderer, fallbackElement, renderRouterProvider]);
}
