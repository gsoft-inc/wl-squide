import { FeatureFlagsContext, SubscriptionContext, TelemetryServiceContext, useTelemetryService, type FeatureFlags, type Session, type SessionManager, type Subscription, type TelemetryService } from "@endpoints/shared";
import { useIsMswStarted } from "@squide/msw";
import { useIsRouteMatchProtected, useLogger, useRoutes, useRuntime, type Logger } from "@squide/react-router";
import { completeModuleRegistrations, useAreModulesReady, useAreModulesRegistered } from "@squide/webpack-module-federation";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Outlet, RouterProvider, createBrowserRouter, useLocation } from "react-router-dom";

async function fetchPublicData(
    setFeatureFlags: (featureFlags: FeatureFlags) => void,
    logger: Logger
) {
    const featureFlagsPromise = axios.get("/api/feature-flags")
        .then(({ data }) => {
            const featureFlags: FeatureFlags = {
                featureA: data.featureA,
                featureB: data.featureB,
                featureC: data.featureC
            };

            logger.debug("[shell] %cFeature flags are ready%c:", "color: white; background-color: green;", "", featureFlags);

            setFeatureFlags(featureFlags);
        });

    return featureFlagsPromise;
}

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
    areModulesRegistered: boolean;
    areModulesReady: boolean;
}

export interface DeferredRegistrationData {
    featureFlags?: FeatureFlags;
}

// Most of the bootstrapping logic has been moved to this component because AppRouter
// cannot leverage "useLocation" since it's depend on "RouterProvider".
export function RootRoute({ waitForMsw, sessionManager, areModulesRegistered, areModulesReady }: RootRouteProps) {
    const [isPublicDataLoaded, setIsPublicDataLoaded] = useState(false);
    const [isProtectedDataLoaded, setIsProtectedDataLoaded] = useState(false);

    // Could be done with a ref (https://react.dev/reference/react/useRef) to save a re-render but for this sample
    // it seemed unnecessary. If your application loads a lot of data at bootstrapping, it should be considered.
    const [featureFlags, setFeatureFlags] = useState<FeatureFlags>();
    const [subscription, setSubscription] = useState<Subscription>();

    const runtime = useRuntime();
    const logger = useLogger();
    const location = useLocation();
    const telemetryService = useTelemetryService();

    // Re-render the app once MSW is started, otherwise, the API calls for module routes will return a 404 status.
    const isMswStarted = useIsMswStarted(waitForMsw);

    const isActiveRouteProtected = useIsRouteMatchProtected(location);

    useEffect(() => {
        if ((areModulesRegistered || areModulesReady) && !isMswStarted) {
            logger.debug(`[shell] Modules are ${areModulesReady ? "ready" : "registered"}, waiting for MSW to start...`);
        }

        if (!areModulesRegistered && !areModulesReady && isMswStarted) {
            logger.debug("[shell] MSW is started, waiting for the modules...");
        }
    }, [logger, areModulesRegistered, areModulesReady, isMswStarted]);

    useEffect(() => {
        if ((areModulesRegistered || areModulesReady) && isMswStarted) {
            if (!isPublicDataLoaded) {
                logger.debug("[shell] Fetching public initial data.");

                fetchPublicData(setFeatureFlags, logger).finally(() => {
                    setIsPublicDataLoaded(true);
                });
            }
        }
    }, [logger, areModulesRegistered, areModulesReady, isMswStarted, isPublicDataLoaded]);

    useEffect(() => {
        if ((areModulesRegistered || areModulesReady) && isMswStarted) {
            if (isActiveRouteProtected) {
                if (!isProtectedDataLoaded) {
                    logger.debug(`[shell] Fetching protected initial data as "${location.pathname}" is a protected route.`);

                    const setSession = (session: Session) => {
                        sessionManager.setSession(session);
                    };

                    fetchProtectedData(setSession, setSubscription, logger).finally(() => {
                        setIsProtectedDataLoaded(true);
                    });
                }
            } else {
                logger.debug(`[shell] Not fetching protected initial data as "${location.pathname}" is a public route.`);
            }
        }
    }, [logger, location, sessionManager, areModulesRegistered, areModulesReady, isMswStarted, isActiveRouteProtected, isProtectedDataLoaded]);

    useEffect(() => {
        if (areModulesRegistered && isMswStarted && isPublicDataLoaded) {
            if (!areModulesReady) {
                completeModuleRegistrations(runtime, {
                    featureFlags
                } satisfies DeferredRegistrationData);
            }
        }
    }, [runtime, areModulesRegistered, areModulesReady, isMswStarted, isPublicDataLoaded, featureFlags]);

    useEffect(() => {
        telemetryService?.track(`Navigated to the "${location.pathname}" page.`);
    }, [location, telemetryService]);

    if (!areModulesReady || !isMswStarted || !isPublicDataLoaded || (isActiveRouteProtected && !isProtectedDataLoaded)) {
        return <div>Loading...</div>;
    }

    return (
        <FeatureFlagsContext.Provider value={featureFlags}>
            <SubscriptionContext.Provider value={subscription}>
                <Outlet />
            </SubscriptionContext.Provider>
        </FeatureFlagsContext.Provider>
    );
}

export interface AppRouterProps {
    waitForMsw: boolean;
    sessionManager: SessionManager;
    telemetryService: TelemetryService;
}

export function AppRouter({ waitForMsw, sessionManager, telemetryService }: AppRouterProps) {
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
                        sessionManager={sessionManager}
                        areModulesRegistered={areModulesRegistered}
                        areModulesReady={areModulesReady}
                    />
                ),
                children: routes
            }
        ]);
    }, [areModulesRegistered, areModulesReady, routes, waitForMsw, sessionManager]);

    return (
        <TelemetryServiceContext.Provider value={telemetryService}>
            <RouterProvider router={router} />
        </TelemetryServiceContext.Provider>
    );
}
