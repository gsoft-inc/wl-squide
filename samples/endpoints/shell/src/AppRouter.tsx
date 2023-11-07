import { FeatureFlagsContext, SubscriptionContext, TelemetryServiceContext, type FeatureFlags, type Session, type SessionManager, type Subscription, type TelemetryService } from "@endpoints/shared";
import { AppRouter as FireflyAppRouter } from "@squide/firefly";
import { useLogger, useRuntime, type Logger } from "@squide/react-router";
import { completeModuleRegistrations } from "@squide/webpack-module-federation";
import axios from "axios";
import { useCallback, useState } from "react";
import { BootstrappingErrorBoundary } from "./BootstrappingErrorBoundary.tsx";

export interface DeferredRegistrationData {
    featureFlags?: FeatureFlags;
}

export interface AppRouterProps {
    waitForMsw: boolean;
    sessionManager: SessionManager;
    telemetryService: TelemetryService;
}

function fetchPublicData(
    setFeatureFlags: (featureFlags: FeatureFlags) => void,
    logger: Logger
) {
    // React Query "queryClient.fetchQuery" could be used instead of using axios directly.
    // https://tanstack.com/query/latest/docs/react/reference/QueryClient#queryclientfetchquery
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

function fetchProtectedData(
    setSession: (session: Session) => void,
    setSubscription: (subscription: Subscription) => void,
    logger: Logger
) {
    // React Query "queryClient.fetchQuery" could be used instead of using axios directly.
    // https://tanstack.com/query/latest/docs/react/reference/QueryClient#queryclientfetchquery
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

    // React Query "queryClient.fetchQuery" could be used instead of using axios directly.
    // https://tanstack.com/query/latest/docs/react/reference/QueryClient#queryclientfetchquery
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

function Loading() {
    return (
        <div>Loading...</div>
    );
}

export function AppRouter({ waitForMsw, sessionManager, telemetryService }: AppRouterProps) {
    // Could be done with a ref (https://react.dev/reference/react/useRef) to save a re-render but for this sample
    // it seemed unnecessary. If your application loads a lot of data at bootstrapping, it should be considered.
    const [featureFlags, setFeatureFlags] = useState<FeatureFlags>();
    const [subscription, setSubscription] = useState<Subscription>();

    const logger = useLogger();
    const runtime = useRuntime();

    const handleLoadPublicData = useCallback(() => {
        return fetchPublicData(setFeatureFlags, logger);
    }, [logger]);

    const handleLoadProtectedData = useCallback(() => {
        const setSession = (session: Session) => {
            sessionManager.setSession(session);
        };

        return fetchProtectedData(setSession, setSubscription, logger);
    }, [logger, sessionManager]);

    const handleCompleteRegistrations = useCallback(() => {
        return completeModuleRegistrations(runtime, {
            featureFlags
        });
    }, [runtime, featureFlags]);

    return (
        <FeatureFlagsContext.Provider value={featureFlags}>
            <SubscriptionContext.Provider value={subscription}>
                <TelemetryServiceContext.Provider value={telemetryService}>
                    <FireflyAppRouter
                        fallbackElement={<Loading />}
                        errorElement={<BootstrappingErrorBoundary />}
                        waitForMsw={waitForMsw}
                        onLoadPublicData={handleLoadPublicData}
                        onLoadProtectedData={handleLoadProtectedData}
                        onCompleteRegistrations={handleCompleteRegistrations}
                    />
                </TelemetryServiceContext.Provider>
            </SubscriptionContext.Provider>
        </FeatureFlagsContext.Provider>
    );
}
