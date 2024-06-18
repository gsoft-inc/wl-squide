import { FeatureFlagsContext, SessionManagerContext, SubscriptionContext, TelemetryServiceContext, fetchJson, isApiError, type FeatureFlags, type Session, type Subscription, type TelemetryService } from "@endpoints/shared";
import { AppRouter as FireflyAppRouter, useDeferredRegistrations, useIsBootstrapping, useLogger, useProtectedDataQueries, usePublicDataQueries } from "@squide/firefly";
import { useChangeLanguage } from "@squide/i18next";
import { useEffect, useMemo } from "react";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import { Loading } from "./Loading.tsx";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";
import { useSessionManagerInstance } from "./useSessionManagerInstance.ts";

interface BootstrappingRouteProps {
    telemetryService: TelemetryService;
}

function BootstrappingRoute({ telemetryService }: BootstrappingRouteProps) {
    const logger = useLogger();

    const [featureFlags] = usePublicDataQueries([
        {
            queryKey: ["/api/feature-flags"],
            queryFn: async () => {
                const data = await fetchJson("/api/feature-flags");

                return data as FeatureFlags;
            }
        }
    ]);

    useEffect(() => {
        if (featureFlags) {
            logger.debug("[shell] %cFeature flags has been fetched%c:", "color: white; background-color: green;", "", featureFlags);
        }
    }, [featureFlags, logger]);

    const [session, subscription] = useProtectedDataQueries([
        {
            queryKey: ["/api/session"],
            queryFn: async () => {
                const data = await fetchJson("/api/session");

                const result: Session = {
                    user: {
                        id: data.userId,
                        name: data.username,
                        preferredLanguage: data.preferredLanguage
                    }
                };

                return result;
            }
        },
        {
            queryKey: ["/api/subscription"],
            queryFn: async () => {
                const data = await fetchJson("/api/subscription");

                return data as Subscription;
            }
        }
    ], (error: unknown) => isApiError(error) && error.status === 401);

    const changeLanguage = useChangeLanguage();

    useEffect(() => {
        if (session) {
            logger.debug("[shell] %cSession has been fetched%c:", "color: white; background-color: green;", "", session);

            // When the session has been retrieved, update the language to match the user
            // preferred language.
            changeLanguage(session.user.preferredLanguage);
        }
    }, [session, changeLanguage, logger]);

    useEffect(() => {
        if (subscription) {
            logger.debug("[shell] %cSubscription has been fetched%c:", "color: white; background-color: green;", "", subscription);
        }
    }, [subscription, logger]);

    useDeferredRegistrations(useMemo(() => ({
        featureFlags,
        session
    }), [featureFlags, session]));

    const sessionManager = useSessionManagerInstance(session!);

    if (useIsBootstrapping()) {
        return <Loading />;
    }

    return (
        <FeatureFlagsContext.Provider value={featureFlags}>
            <SessionManagerContext.Provider value={sessionManager}>
                <SubscriptionContext.Provider value={subscription}>
                    <TelemetryServiceContext.Provider value={telemetryService}>
                        <Outlet />
                    </TelemetryServiceContext.Provider>
                </SubscriptionContext.Provider>
            </SessionManagerContext.Provider>
        </FeatureFlagsContext.Provider>
    );
}

export interface AppRouterProps {
    waitForMsw: boolean;
    telemetryService: TelemetryService;
}

export function AppRouter(props: AppRouterProps) {
    const {
        waitForMsw,
        telemetryService
    } = props;

    return (
        <FireflyAppRouter waitForMsw={waitForMsw} waitForPublicData waitForProtectedData>
            {({ rootRoute, registeredRoutes }) => (
                <RouterProvider
                    router={createBrowserRouter([
                        {
                            element: rootRoute,
                            children: [
                                {
                                    errorElement: <RootErrorBoundary />,
                                    children: [
                                        {
                                            element: <BootstrappingRoute telemetryService={telemetryService} />,
                                            children: registeredRoutes
                                        }
                                    ]
                                }
                            ]
                        }
                    ])}
                />
            )}
        </FireflyAppRouter>
    );
}
