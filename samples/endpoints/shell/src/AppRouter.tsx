import {
    FeatureFlagsContext,
    SessionManagerContext,
    SubscriptionContext,
    TelemetryServiceContext,
    fetchJson,
    isApiError,
    type FeatureFlags,
    type OgFeatureFlags,
    type OtherFeatureFlags,
    type Session,
    type Subscription,
    type TelemetryService
} from "@endpoints/shared";
import { useEnvironmentVariables } from "@squide/env-vars";
import { AppRouter as FireflyAppRouter, useDeferredRegistrations, useIsBootstrapping, useLogger, useProtectedDataQueries, usePublicDataQueries } from "@squide/firefly";
import { setGlobalSpanAttributes } from "@squide/firefly-honeycomb";
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
    const environmentVariables = useEnvironmentVariables();

    const [ogFeatureFlags, otherFeatureFlags] = usePublicDataQueries([
        {
            queryKey: [`${environmentVariables.featureFlagsApiBaseUrl}getAll`],
            queryFn: async () => {
                const data = await fetchJson(`${environmentVariables.featureFlagsApiBaseUrl}getAll`);

                return data as OgFeatureFlags;
            }
        },
        {
            queryKey: [environmentVariables.otherFeatureFlagsApiUrl],
            queryFn: async () => {
                let data: OtherFeatureFlags = {
                    otherA: false,
                    otherB: false
                };

                try {
                    data = (await fetchJson(environmentVariables.otherFeatureFlagsApiUrl)) as OtherFeatureFlags;
                } catch (error: unknown) {
                    if (isApiError(error)) {
                        if (error.status !== 404) {
                            throw error;
                        }
                    }
                }

                return data;
            }
        }
    ]);

    const featureFlags = useMemo(() => {
        return {
            ...ogFeatureFlags,
            ...otherFeatureFlags
        } satisfies FeatureFlags;
    }, [ogFeatureFlags, otherFeatureFlags]);

    useEffect(() => {
        if (featureFlags) {
            logger.debug("[shell] %cFeature flags has been fetched%c:", "color: white; background-color: green;", "", featureFlags);
        }
    }, [featureFlags, logger]);

    const [session, subscription] = useProtectedDataQueries([
        {
            queryKey: [`${environmentVariables.sessionApiBaseUrl}getSession`],
            queryFn: async () => {
                const data = await fetchJson(`${environmentVariables.sessionApiBaseUrl}getSession`);

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
            queryKey: [`${environmentVariables.subscriptionApiBaseUrl}getSubscription`],
            queryFn: async () => {
                const data = await fetchJson(`${environmentVariables.subscriptionApiBaseUrl}getSubscription`);

                return data as Subscription;
            }
        }
    ], error => isApiError(error) && error.status === 401);

    const changeLanguage = useChangeLanguage();

    useEffect(() => {
        if (session) {
            logger.debug("[shell] %cSession has been fetched%c:", "color: white; background-color: green;", "", session);

            // Update telemetry global attributes.
            setGlobalSpanAttributes({
                "app.user_id": session.user.id,
                "app.user_prefered_language": session.user.preferredLanguage
            });

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
    const logger = useLogger();

    const {
        waitForMsw,
        telemetryService
    } = props;

    return (
        <FireflyAppRouter waitForMsw={waitForMsw} waitForPublicData waitForProtectedData>
            {({ rootRoute, registeredRoutes, routerProviderProps }) => {
                logger.debug("[shell] React Router will be rendered with the following route definitions: ", registeredRoutes);

                return (
                    <RouterProvider
                        router={createBrowserRouter([
                            {
                                element: rootRoute,
                                errorElement: <RootErrorBoundary />,
                                children: [
                                    {
                                        element: <BootstrappingRoute telemetryService={telemetryService} />,
                                        children: registeredRoutes
                                    }
                                ]
                            }
                        ])}
                        {...routerProviderProps}
                    />
                );
            }}
        </FireflyAppRouter>
    );
}
