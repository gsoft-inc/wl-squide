import { FeatureFlagsContext, SubscriptionContext, TelemetryServiceContext, fetchJson, type FeatureFlags, type Session, type SessionManager, type Subscription, type TelemetryService } from "@endpoints/shared";
import { AppRouter as FireflyAppRouter, completeModuleRegistrations, useCompleteDeferredRegistrationsCallback, useIsAppReady, useLogger, useProtectedData, usePublicData, useRuntime, useTanstackQueryProtectedData } from "@squide/firefly";
import { useChangeLanguage, useI18nextInstance } from "@squide/i18next";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import { RootErrorBoundary } from "./RootErrorBoundary.tsx";
import { i18NextInstanceKey } from "./i18next.ts";

function Loading() {
    const i18nextInstance = useI18nextInstance(i18NextInstanceKey);
    const { t } = useTranslation("AppRouter", { i18n: i18nextInstance });

    return (
        <div>{t("loadingMessage")}</div>
    );
}

interface BootstrappingRouteProps {
    sessionManager: SessionManager;
    telemetryService: TelemetryService;
}

function BootstrappingRoute(props: BootstrappingRouteProps) {
    const {
        sessionManager,
        telemetryService
    } = props;

    const logger = useLogger();
    const runtime = useRuntime();

    const changeLanguage = useChangeLanguage();

    const { canFetchPublicData, setPublicDataAsReady } = usePublicData();
    const { queryOptions, setProtectedDataAsReady } = useTanstackQueryProtectedData();

    const { data: featureFlags } = useQuery({
        queryKey: ["/api/feature-flags"],
        queryFn: async () => {
            const data = await fetchJson("/api/feature-flags");

            return data as FeatureFlags;
        },
        enabled: canFetchPublicData,
        throwOnError: true
        // throwOnError: canFetchPublicData
        // retryOnMount: false
    });

    useEffect(() => {
        if (featureFlags) {
            logger.debug("[shell] %cFeature flags has been fetched%c:", "color: white; background-color: green;", "", featureFlags);

            setPublicDataAsReady();
        }
    }, [featureFlags, setPublicDataAsReady, logger]);

    const { data: session } = useQuery({
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
        },
        ...queryOptions
    });

    const { data: subscription } = useQuery({
        queryKey: ["/api/subscription"],
        queryFn: async () => {
            const data = await fetchJson("/api/subscription");

            return data as Subscription;
        },
        ...queryOptions
    });

    useEffect(() => {
        if (session) {
            logger.debug("[shell] %cSession has been fetched%c:", "color: white; background-color: green;", "", session);

            // TODO: Remove this API from Squide and replace by in consumer side by a context.
            sessionManager.setSession(session);

            // When the session has been retrieved, update the language to match the user
            // preferred language.
            changeLanguage(session.user.preferredLanguage);
        }
    }, [session, sessionManager, changeLanguage, logger]);

    useEffect(() => {
        if (subscription) {
            logger.debug("[shell] %cSubscription has been fetched%c:", "color: white; background-color: green;", "", subscription);
        }
    }, [subscription, logger]);

    useEffect(() => {
        if (session && subscription) {
            setProtectedDataAsReady();
        }
    }, [session, subscription, setProtectedDataAsReady]);

    useCompleteDeferredRegistrationsCallback(useCallback(() => {
        completeModuleRegistrations(runtime, {
            featureFlags,
            session
        });
    }, [featureFlags, session, runtime]));

    if (!useIsAppReady()) {
        return <Loading />;
    }

    return (
        <FeatureFlagsContext.Provider value={featureFlags}>
            <SubscriptionContext.Provider value={subscription}>
                <TelemetryServiceContext.Provider value={telemetryService}>
                    <Outlet />
                </TelemetryServiceContext.Provider>
            </SubscriptionContext.Provider>
        </FeatureFlagsContext.Provider>
    );
}

export interface AppRouterProps {
    waitForMsw: boolean;
    sessionManager: SessionManager;
    telemetryService: TelemetryService;
}

export function AppRouter(props: AppRouterProps) {
    const {
        waitForMsw,
        sessionManager,
        telemetryService
    } = props;

    return (
        <FireflyAppRouter waitForMsw={waitForMsw} waitForPublicData waitForProtectedData>
            {(rootRoute, registeredRoutes) => (
                <RouterProvider
                    router={createBrowserRouter([
                        {
                            element: rootRoute,
                            children: [
                                {
                                    errorElement: <RootErrorBoundary />,
                                    children: [
                                        {
                                            element: (
                                                <BootstrappingRoute
                                                    sessionManager={sessionManager}
                                                    telemetryService={telemetryService}
                                                />
                                            ),
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
