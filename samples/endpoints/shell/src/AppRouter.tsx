import { SubscriptionContext, TelemetryServiceContext, useTelemetryService, type Session, type SessionManager, type Subscription, type TelemetryService } from "@endpoints/shared";
import { useIsMswStarted } from "@squide/msw";
import { useIsAuthenticated, useIsRouteMatchProtected, useLogger, useRoutes, type Logger } from "@squide/react-router";
import { useAreModulesReady } from "@squide/webpack-module-federation";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, RouterProvider, createBrowserRouter, useLocation } from "react-router-dom";

type SetSession = (session: Session) => void;
type SetSubscription = (subscription: Subscription) => void;

async function fetchProtectedData(
    setSession: SetSession,
    setSubscription: SetSubscription,
    logger: Logger
) {
    logger.debug(`[shell] Fetching session data as "${window.location}" is a protected route.`);

    const sessionPromise = axios.get("/api/session")
        .then(({ data }) => {
            const session: Session = {
                user: {
                    id: data.userId,
                    name: data.username
                }
            };

            logger.debug("[shell] %cSession is ready%c:", "color: white; background-color: green;", "", session);

            setSession(data);
        });

    const subscriptionPromise = axios.get("/api/subscription")
        .then(({ data }) => {
            const subscription: Subscription = {
                company: data.company,
                contact: data.contact,
                status: data.status
            };

            logger.debug("[shell] %cSubscription is ready%c:", "color: white; background-color: green;", "", subscription);

            setSubscription(data);
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
    setSession: SetSession;
    setSubscription: SetSubscription;
}

export function RootRoute({ setSession, setSubscription }: RootRouteProps) {
    const logger = useLogger();

    const location = useLocation();
    const telemetryService = useTelemetryService();

    const isAuthenticated = useIsAuthenticated();
    const isActiveRouteProtected = useIsRouteMatchProtected(location);

    const [isReady, setIsReady] = useState(!isActiveRouteProtected || isAuthenticated);

    useEffect(() => {
        telemetryService?.track(`Navigated to the "${location.pathname}" page.`);

        // If the user is already authenticated and come back later with a direct hit to a public page,
        // without this code, once the user attempt to navigate to a protected page, the user will be asked
        // to login again because the AppRouter code is not re-rendered when the location change.
        if (isActiveRouteProtected && !isAuthenticated) {
            setIsReady(false);

            fetchProtectedData(setSession, setSubscription, logger).finally(() => {
                setIsReady(true);
            });
        }
    }, [location, telemetryService, logger, isAuthenticated, isActiveRouteProtected, setSession, setSubscription]);

    if (!isReady) {
        return <div>Loading...</div>;
    }

    return (
        <Outlet />
    );
}

export interface AppRouterProps {
    waitForMsw: boolean;
    sessionManager: SessionManager;
    telemetryService: TelemetryService;
}

export function AppRouter({ waitForMsw, sessionManager, telemetryService }: AppRouterProps) {
    const [isReady, setIsReady] = useState(false);

    // Could be done with a ref (https://react.dev/reference/react/useRef) to save a re-render but for this sample
    // it seemed unnecessary. If your application loads a lot of data at bootstrapping, it should be considered.
    const [subscription, setSubscription] = useState<Subscription>();

    const logger = useLogger();
    const routes = useRoutes();

    // Re-render the app once all the remotes are registered, otherwise the remotes routes won't be added to the router.
    const areModulesReady = useAreModulesReady();

    // Re-render the app once MSW is started, otherwise, the API calls for module routes will return a 404 status.
    const isMswStarted = useIsMswStarted(waitForMsw);

    // Ideally "useLocation" would be used so the component re-renderer everytime the location change but it doesn't
    // seem feasible (at least not easily) as public and private routes go through this component and we expect to show the same
    // loading through the whole bootstrapping process.
    // Anyhow, since all the Workleap apps will authenticate through a third party authentication provider, it
    // doesn't seems like a big deal as the application will be reloaded anyway after the user logged in on the third party.
    const isActiveRouteProtected = useIsRouteMatchProtected(window.location);

    const setSession = useCallback((session: Session) => {
        sessionManager.setSession(session);
    }, [sessionManager]);

    useEffect(() => {
        if (areModulesReady && !isMswStarted) {
            logger.debug("[shell] Modules are ready, waiting for MSW to start.");
        }

        if (!areModulesReady && isMswStarted) {
            logger.debug("[shell] MSW is started, waiting for the modules to be ready.");
        }

        if (areModulesReady && isMswStarted) {
            if (isActiveRouteProtected) {
                fetchProtectedData(setSession, setSubscription, logger).finally(() => {
                    setIsReady(true);
                });
            } else {
                logger.debug(`[shell] Passing through as "${window.location}" is a public route.`);

                setIsReady(true);
            }
        }
    }, [logger, areModulesReady, isMswStarted, isActiveRouteProtected, setSession]);

    const router = useMemo(() => {
        return createBrowserRouter([
            {
                element: <RootRoute setSession={setSession} setSubscription={setSubscription} />,
                children: routes
            }
        ]);
    }, [routes, setSession, setSubscription]);

    if (!isReady) {
        return <div>Loading...</div>;
    }

    return (
        <TelemetryServiceContext.Provider value={telemetryService}>
            <SubscriptionContext.Provider value={subscription}>
                <RouterProvider router={router} />
            </SubscriptionContext.Provider>
        </TelemetryServiceContext.Provider>
    );
}


// import { SubscriptionContext, TelemetryServiceContext, useTelemetryService, type Session, type SessionManager, type Subscription, type TelemetryService } from "@endpoints/shared";
// import { useIsMswStarted } from "@squide/msw";
// import { useIsRouteMatchProtected, useLogger, useRoutes } from "@squide/react-router";
// import { useAreModulesReady } from "@squide/webpack-module-federation";
// import axios from "axios";
// import { useEffect, useMemo, useState } from "react";
// import { Outlet, RouterProvider, createBrowserRouter, useLocation } from "react-router-dom";

// export function RootRoute() {
//     const location = useLocation();
//     const telemetryService = useTelemetryService();

//     useEffect(() => {
//         telemetryService?.track(`Navigated to the "${location.pathname}" page.`);
//     }, [location, telemetryService]);

//     return (
//         <Outlet />
//     );
// }

// export interface AppRouterProps {
//     waitForMsw: boolean;
//     sessionManager: SessionManager;
//     telemetryService: TelemetryService;
// }

// export function AppRouter({ waitForMsw, sessionManager, telemetryService }: AppRouterProps) {
//     const [isReady, setIsReady] = useState(false);

//     // Could be done with a ref (https://react.dev/reference/react/useRef) to save a re-render but for this sample
//     // it seemed unnecessary. If your application loads a lot of data at bootstrapping, it should be considered.
//     const [subscription, setSubscription] = useState<Subscription>();

//     const logger = useLogger();
//     const routes = useRoutes();

//     // Re-render the app once all the remotes are registered, otherwise the remotes routes won't be added to the router.
//     const areModulesReady = useAreModulesReady();

//     // Re-render the app once MSW is started, otherwise, the API calls for module routes will return a 404 status.
//     const isMswStarted = useIsMswStarted(waitForMsw);

//     // Ideally "useLocation" would be used so the component re-renderer everytime the location change but it doesn't
//     // seem feasible (at least not easily) as public and private routes go through this component.
//     // Anyhow, since all the Workleap apps will authenticate through a third party authentication provider, it
//     // doesn't seems like a big deal as the application will be reloaded anyway after the user logged in on the third party.
//     const isActiveRouteProtected = useIsRouteMatchProtected(window.location);

//     useEffect(() => {
//         if (areModulesReady && !isMswStarted) {
//             logger.debug("[shell] Modules are ready, waiting for MSW to start.");
//         }

//         if (!areModulesReady && isMswStarted) {
//             logger.debug("[shell] MSW is started, waiting for the modules to be ready.");
//         }

//         if (areModulesReady && isMswStarted) {
//             if (isActiveRouteProtected) {
//                 logger.debug(`[shell] Fetching session data as "${window.location}" is a protected route.`);

//                 const sessionPromise = axios.get("/api/session")
//                     .then(({ data }) => {
//                         const session: Session = {
//                             user: {
//                                 id: data.userId,
//                                 name: data.username
//                             }
//                         };

//                         logger.debug("[shell] %cSession is ready%c:", "color: white; background-color: green;", "", session);

//                         sessionManager.setSession(session);
//                     });

//                 const subscriptionPromise = axios.get("/api/subscription")
//                     .then(({ data }) => {
//                         const _subscription: Subscription = {
//                             company: data.company,
//                             contact: data.contact,
//                             status: data.status
//                         };

//                         logger.debug("[shell] %cSubscription is ready%c:", "color: white; background-color: green;", "", _subscription);

//                         setSubscription(_subscription);
//                     });

//                 Promise.all([sessionPromise, subscriptionPromise])
//                     .catch((error: unknown) => {
//                         if (axios.isAxiosError(error) && error.response?.status === 401) {
//                             // The authentication boundary will redirect to the login page.
//                             return;
//                         }

//                         throw error;
//                     })
//                     .finally(() => {
//                         setIsReady(true);
//                     });
//             } else {
//                 logger.debug(`[shell] Passing through as "${window.location}" is a public route.`);

//                 setIsReady(true);
//             }
//         }
//     }, [areModulesReady, isMswStarted, isActiveRouteProtected, logger, sessionManager]);

//     const router = useMemo(() => {
//         return createBrowserRouter([
//             {
//                 element: <RootRoute />,
//                 children: routes
//             }
//         ]);
//     }, [routes]);

//     if (!isReady) {
//         return <div>Loading...</div>;
//     }

//     return (
//         <TelemetryServiceContext.Provider value={telemetryService}>
//             <SubscriptionContext.Provider value={subscription}>
//                 <RouterProvider router={router} />
//             </SubscriptionContext.Provider>
//         </TelemetryServiceContext.Provider>
//     );
// }
