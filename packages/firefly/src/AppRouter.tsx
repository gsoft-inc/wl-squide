import { useIsMswStarted } from "@squide/msw";
import { useIsRouteMatchProtected, useLogger, useRoutes, useRuntime, type Logger } from "@squide/react-router";
import { completeModuleRegistrations, useAreModulesReady, useAreModulesRegistered } from "@squide/webpack-module-federation";
import { useEffect, useMemo, useState } from "react";
import { Outlet, RouterProvider, createBrowserRouter, useLocation } from "react-router-dom";

/*
AppRouter
    - loader - fallback would be better
    - onFetchInitialData -> (doit passer un "signal") - Fetch c'est un peu bad car ça pourrait être in memory - onRetrieveInitialData ?!?! - onLoadInitialData - La valeur par défaut est Promise.resolve
        -> onLoadPublicData
    - onFetchSession -> onLoadSession
    - onFetchProtectedData -> Si fournie, est inclus dans le isReady - (doit passer un "signal") -> onLoadProtectedData
    - waitForMsw
    - rootRoute - Si fournis est-ce le parent de la root route du AppRouter?
    - routerProviderOptions
*/

/*

import { AppRouter as FireflyAppRouter } from "@squide/firefly";

export function AppRouter() {
    const [subscription, setSubscription] = useState<Subscription>();

    onFetchProtectedData() {
        ....


    }

    return (
        <TelemetryContext.Provider value={}>
            <SubcriptionContext.Provider value={subscription}
                <FireflyAppRouter onFetchProtectedData={onFetchProtectedData} />
            </SubcriptionContext.Provider >
        </TelemetryContext.Provider value={}>
    )
}

*/


interface RootRouteProps {
    waitForMsw: boolean;
    areModulesRegistered: boolean;
    areModulesReady: boolean;
}

// Most of the bootstrapping logic has been moved to this component because AppRouter
// cannot leverage "useLocation" since it's depend on "RouterProvider".
export function RootRoute({ waitForMsw, areModulesRegistered, areModulesReady }: RootRouteProps) {
    const [isPublicDataLoaded, setIsPublicDataLoaded] = useState(false);
    const [isProtectedDataLoaded, setIsProtectedDataLoaded] = useState(false);

    const runtime = useRuntime();
    const logger = useLogger();
    const location = useLocation();

    // Re-render the app once MSW is started, otherwise, the API calls for module routes will return a 404 status.
    const isMswStarted = useIsMswStarted(waitForMsw);

    const isActiveRouteProtected = useIsRouteMatchProtected(location);

    useEffect(() => {
        if ((areModulesRegistered || areModulesReady) && !isMswStarted) {
            logger.debug(`[firefly] Modules are ${areModulesReady ? "ready" : "registered"}, waiting for MSW to start...`);
        }

        if (!areModulesRegistered && !areModulesReady && isMswStarted) {
            logger.debug("[firefly] MSW is started, waiting for the modules...");
        }
    }, [logger, areModulesRegistered, areModulesReady, isMswStarted]);

    useEffect(() => {
        if ((areModulesRegistered || areModulesReady) && isMswStarted) {
            if (!isPublicDataLoaded) {
                logger.debug("[firefly] Fetching public data.");

                // fetchPublicData(setFeatureFlags, logger).finally(() => {
                //     setIsPublicDataLoaded(true);
                // });
            }
        }
    }, [logger, areModulesRegistered, areModulesReady, isMswStarted, isPublicDataLoaded]);

    useEffect(() => {
        if ((areModulesRegistered || areModulesReady) && isMswStarted) {
            if (isActiveRouteProtected) {
                if (!isProtectedDataLoaded) {
                    logger.debug(`[firefly] Fetching protected data as "${location.pathname}" is a protected route.`);

                    // onLoadSession

                    // fetchProtectedData(setSession, setSubscription, logger).finally(() => {
                    //     setIsProtectedDataLoaded(true);
                    // });
                }
            } else {
                logger.debug(`[firefly] Not fetching protected data as "${location.pathname}" is a public route.`);
            }
        }
    }, [logger, location, areModulesRegistered, areModulesReady, isMswStarted, isActiveRouteProtected, isProtectedDataLoaded]);

    useEffect(() => {
        if (areModulesRegistered && isMswStarted && isPublicDataLoaded) {
            if (!areModulesReady) {
                // TBD: The completion data should be everything that has been fetched (will the component have access to this?!?!)
                // - Otherwise, there could also have something like an onLoadCompletionData
                // - Or there could simply be a "registrationCompletionData" prop
                // - Or deferredRegistrationData <---- this one is better

                // completeModuleRegistrations(runtime, {
                //     featureFlags
                // });
            }
        }
    }, [runtime, areModulesRegistered, areModulesReady, isMswStarted, isPublicDataLoaded]);

    if (!areModulesReady || !isMswStarted || !isPublicDataLoaded || (isActiveRouteProtected && !isProtectedDataLoaded)) {
        return <div>Loading...</div>;
    }

    return (
        <Outlet />
    );
}

export interface AppRouterProps {
    waitForMsw: boolean;
}

export function AppRouter({ waitForMsw }: AppRouterProps) {
    // Re-render the app once all the remote modules are registered, otherwise the remote modules routes won't be added to the router.
    const areModulesRegistered = useAreModulesRegistered();

    // Re-render the app once all the remote modules are ready, otherwise the deferred remote modules routes won't be added to the router.
    const areModulesReady = useAreModulesReady();

    const routes = useRoutes();

    const router = useMemo(() => {
        return createBrowserRouter([
            {
                element: (
                    <RootRoute
                        waitForMsw={waitForMsw}
                        areModulesRegistered={areModulesRegistered}
                        areModulesReady={areModulesReady}
                    />
                ),
                children: routes
            }
        ]);
    }, [areModulesRegistered, areModulesReady, routes, waitForMsw]);

    return (
        <RouterProvider router={router} />
    );
}
