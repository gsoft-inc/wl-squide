import { SubscriptionContext, TelemetryServiceContext, useTelemetryService, type Session, type SessionManager, type Subscription, type TelemetryService } from "@endpoints/shared";
import { useIsMswStarted } from "@squide/msw";
import { useIsAuthenticated, useIsRouteMatchProtected, useLogger, useRoutes, type Logger } from "@squide/react-router";
import { useAreModulesReady } from "@squide/webpack-module-federation";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Outlet, RouterProvider, createBrowserRouter, useLocation } from "react-router-dom";

/*
AppRouter
    - loader
    - onFetchInitialData -> (doit passer un "signal")
    - onFetchSession
    - onFetchProtectedData -> Si fournie, est inclus dans le isReady - (doit passer un "signal")
    - waitForMsw
    - rootRoute - Si fournis est-ce le parent de la root route du AppRouter?
    - routerProviderOptions
*/

/*

import { AppRouter as SquideAppRouter } from "@squide/shell";

export function AppRouter() {
    const [subscription, setSubscription] = useState<Subscription>();

    onFetchProtectedData() {
        ....


    }

    return (
        <TelemetryContext.Provider value={}>
            <SubcriptionContext.Provider value={subscription}
                <SquideAppRouter onFetchProtectedData={onFetchProtectedData} />
            </SubcriptionContext.Provider >
        </TelemetryContext.Provider value={}>
    )
}

*/

async function fetchProtectedData(
    setSession: (session: Session) => void,
    setSubscription: (subscription: Subscription) => void,
    logger: Logger
) {
    const sessionPromise = axios.get("/api/session")
        .then(({ data }) => {
            const session: Session = {
                user: {
                    id: data.userId,
                    name: data.username
                }
            };

            logger.debug("[shell] %cSession is ready%c:", "color: white; background-color: green;", "", session);

            setSession(session);
        });

    const subscriptionPromise = axios.get("/api/subscription")
        .then(({ data }) => {
            const subscription: Subscription = {
                company: data.company,
                contact: data.contact,
                status: data.status
            };

            logger.debug("[shell] %cSubscription is ready%c:", "color: white; background-color: green;", "", subscription);

            setSubscription(subscription);
        });

    return Promise.all([sessionPromise, subscriptionPromise])
        .catch((error: unknown) => {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                // The authentication boundary will redirect to the login page.
                return;
            }

            throw error;
        });
}

interface RootRouteProps {
    waitForMsw: boolean;
    sessionManager: SessionManager;
    areModulesReady: boolean;
}

// Most of the bootstrapping logic has been moved to this component because AppRouter
// cannot leverage "useLocation" since it's depend on "RouterProvider".
export function RootRoute({ waitForMsw, sessionManager, areModulesReady }: RootRouteProps) {
    const [isProtectedDataLoaded, setIsProtectedDataLoaded] = useState(false);

    // Could be done with a ref (https://react.dev/reference/react/useRef) to save a re-render but for this sample
    // it seemed unnecessary. If your application loads a lot of data at bootstrapping, it should be considered.
    const [subscription, setSubscription] = useState<Subscription>();

    const logger = useLogger();
    const location = useLocation();
    const telemetryService = useTelemetryService();

    // Re-render the app once MSW is started, otherwise, the API calls for module routes will return a 404 status.
    const isMswStarted = useIsMswStarted(waitForMsw);

    const isActiveRouteProtected = useIsRouteMatchProtected(location);
    const isAuthenticated = useIsAuthenticated();

    useEffect(() => {
        if (areModulesReady && !isMswStarted) {
            logger.debug("[shell] Modules are ready, waiting for MSW to start.");
        }

        if (!areModulesReady && isMswStarted) {
            logger.debug("[shell] MSW is started, waiting for the modules to be ready.");
        }

        if (areModulesReady && isMswStarted) {
            if (isActiveRouteProtected) {
                if (!isAuthenticated) {
                    logger.debug(`[shell] Fetching protected data as "${location.pathname}" is a protected route.`);

                    const setSession = (session: Session) => {
                        sessionManager.setSession(session);
                    };

                    fetchProtectedData(setSession, setSubscription, logger).finally(() => {
                        setIsProtectedDataLoaded(true);
                    });
                }
            } else {
                logger.debug(`[shell] Passing through as "${location.pathname}" is a public route.`);
            }
        }
    }, [logger, location, sessionManager, areModulesReady, isMswStarted, isActiveRouteProtected, isAuthenticated]);

    useEffect(() => {
        telemetryService?.track(`Navigated to the "${location.pathname}" page.`);
    }, [location, telemetryService]);

    if (!areModulesReady || !isMswStarted || (isActiveRouteProtected && !isProtectedDataLoaded)) {
        return <div>Loading...</div>;
    }

    return (
        <SubscriptionContext.Provider value={subscription}>
            <Outlet />
        </SubscriptionContext.Provider>
    );
}

export interface AppRouterProps {
    waitForMsw: boolean;
    sessionManager: SessionManager;
    telemetryService: TelemetryService;
}

export function AppRouter({ waitForMsw, sessionManager, telemetryService }: AppRouterProps) {
    // Re-render the app once all the remotes are registered, otherwise the remotes routes won't be added to the router.
    const areModulesReady = useAreModulesReady();

    const routes = useRoutes();

    const router = useMemo(() => {
        return createBrowserRouter([
            {
                element: (
                    <RootRoute
                        waitForMsw={waitForMsw}
                        sessionManager={sessionManager}
                        areModulesReady={areModulesReady}
                    />
                ),
                children: routes
            }
        ]);
    }, [areModulesReady, routes, waitForMsw, sessionManager]);

    return (
        <TelemetryServiceContext.Provider value={telemetryService}>
            <RouterProvider router={router} />
        </TelemetryServiceContext.Provider>
    );
}
