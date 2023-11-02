import { useIsMswStarted } from "@squide/msw";
import { useIsRouteMatchProtected, useLogger, useRoutes } from "@squide/react-router";
import { useAreModulesReady, useAreModulesRegistered } from "@squide/webpack-module-federation";
import { cloneElement, useCallback, useEffect, useMemo, useState, type ReactElement } from "react";
import { ErrorBoundary, useErrorBoundary } from "react-error-boundary";
import { Outlet, RouterProvider, createBrowserRouter, useLocation, type RouterProviderProps } from "react-router-dom";

export type OnLoadPublicDataFunction = (signal: AbortSignal) => Promise<unknown>;

export type OnLoadProtectedDataFunction = (signal: AbortSignal) => Promise<unknown>;

export type OnCompleteRegistrationFunction = () => Promise<unknown>;

interface BootstrappingRouteProps {
    fallbackElement: ReactElement;
    onLoadPublicData?: OnLoadPublicDataFunction;
    onLoadProtectedData?: OnLoadProtectedDataFunction;
    onCompleteRegistration?: OnCompleteRegistrationFunction;
    waitForMsw: boolean;
    areModulesRegistered: boolean;
    areModulesReady: boolean;
}

// Most of the bootstrapping logic has been moved to this component because AppRouter
// cannot leverage "useLocation" since it must be used in a child component of "RouterProvider".
export function BootstrappingRoute(props: BootstrappingRouteProps) {
    const {
        fallbackElement,
        onLoadPublicData,
        onLoadProtectedData,
        onCompleteRegistration,
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

                    const abordController = new AbortController();

                    onLoadPublicData(abordController.signal)
                        .then(() => {
                            setIsPublicDataLoaded(true);

                            logger.debug("[shell] Public data has been loaded.");
                        })
                        .catch(error => {
                            showBoundary(error);
                        });

                    return () => {
                        abordController.abort();
                    };
                }
            }
        }
    }, [logger, areModulesRegistered, areModulesReady, isMswStarted, isPublicDataLoaded, onLoadPublicData]);

    const isActiveRouteProtected = useIsRouteMatchProtected(location);

    useEffect(() => {
        // Don't go further if no handler has been provided to load protected data.
        if (onLoadProtectedData) {
            if ((areModulesRegistered || areModulesReady) && isMswStarted) {
                if (isActiveRouteProtected) {
                    if (!isProtectedDataLoaded) {
                        logger.debug(`[shell] Loading protected data as "${location.pathname}" is a protected route.`);

                        const abordController = new AbortController();

                        onLoadProtectedData(abordController.signal)
                            .then(() => {
                                setIsProtectedDataLoaded(true);

                                logger.debug("[shell] Protected data has been loaded.");
                            })
                            .catch(error => {
                                showBoundary(error);
                            });

                        return () => {
                            abordController.abort();
                        };
                    }
                } else {
                    logger.debug(`[shell] Not loading protected data as "${location.pathname}" is a public route.`);
                }
            }
        }
    }, [logger, location, areModulesRegistered, areModulesReady, isMswStarted, isActiveRouteProtected, isProtectedDataLoaded, onLoadProtectedData]);

    useEffect(() => {
        // Don't go further if no handler has been provided to complete the registration.
        if (onCompleteRegistration) {
            if (areModulesRegistered && isMswStarted && isPublicDataLoaded) {
                if (!areModulesReady) {
                    onCompleteRegistration();
                }
            }
        }
    }, [areModulesRegistered, areModulesReady, isMswStarted, isPublicDataLoaded, onCompleteRegistration]);

    if (!areModulesReady || !isMswStarted || !isPublicDataLoaded || (isActiveRouteProtected && !isProtectedDataLoaded)) {
        return fallbackElement;
    }

    return (
        <Outlet />
    );
}

export interface AppRouterProps {
    fallbackElement: ReactElement;
    errorElement: ReactElement;
    onLoadPublicData?: OnLoadPublicDataFunction;
    onLoadProtectedData?: OnLoadProtectedDataFunction;
    onCompleteRegistration?: OnCompleteRegistrationFunction;
    waitForMsw: boolean;
    routerProvidersProps?: RouterProviderProps;
}

export function AppRouter(props: AppRouterProps) {
    const {
        fallbackElement,
        errorElement,
        onLoadPublicData,
        onLoadProtectedData,
        onCompleteRegistration,
        waitForMsw,
        routerProvidersProps = {}
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

    const router = useMemo(() => {
        return createBrowserRouter([
            {
                element: (
                    <ErrorBoundary fallbackRender={errorRenderer}>
                        <BootstrappingRoute
                            fallbackElement={fallbackElement}
                            onLoadPublicData={onLoadPublicData}
                            onLoadProtectedData={onLoadProtectedData}
                            onCompleteRegistration={onCompleteRegistration}
                            waitForMsw={waitForMsw}
                            areModulesRegistered={areModulesRegistered}
                            areModulesReady={areModulesReady}
                        />
                    </ErrorBoundary>
                ),
                children: routes
            }
        ]);
    }, [areModulesRegistered, areModulesReady, routes, onLoadPublicData, onLoadProtectedData, onCompleteRegistration, waitForMsw]);

    return (
        <RouterProvider {...routerProvidersProps} router={router} />
    );
}
