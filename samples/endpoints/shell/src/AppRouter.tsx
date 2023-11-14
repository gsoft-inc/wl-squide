import { FeatureFlagsContext, SubscriptionContext, TelemetryServiceContext, fetchJson, isApiError, type FeatureFlags, type Session, type SessionManager, type Subscription, type TelemetryService } from "@endpoints/shared";
import { AppRouter as FireflyAppRouter, completeModuleRegistrations, useLogger, useRuntime, type Logger } from "@squide/firefly";
import { useCallback, useState } from "react";
import { AppRouterErrorBoundary } from "./AppRouterErrorBoundary.tsx";

export interface DeferredRegistrationData {
    featureFlags?: FeatureFlags;
}

export interface AppRouterProps {
    waitForMsw: boolean;
    sessionManager: SessionManager;
    telemetryService: TelemetryService;
}

async function fetchPublicData(setFeatureFlags: (featureFlags: FeatureFlags) => void, logger: Logger) {
    const data = await fetchJson("/api/feature-flags");

    logger.debug("[shell] %cFeature flags are ready%c:", "color: white; background-color: green;", "", data);

    setFeatureFlags(data);
}

async function fetchSession(setSession: (session: Session) => void, logger: Logger) {
    const data = await fetchJson("/api/session");

    const session: Session = {
        user: {
            id: data.userId,
            name: data.username
        }
    };

    logger.debug("[shell] %cSession is ready%c:", "color: white; background-color: green;", "", session);

    setSession(session);
}

async function fetchSubscription(setSubscription: (subscription: Subscription) => void, logger: Logger) {
    const data = await fetchJson("/api/subscription");

    logger.debug("[shell] %cSubscription is ready%c:", "color: white; background-color: green;", "", data);

    setSubscription(data);
}

function fetchProtectedData(
    setSession: (session: Session) => void,
    setSubscription: (subscription: Subscription) => void,
    logger: Logger
) {
    const sessionPromise = fetchSession(setSession, logger);
    const subscriptionPromise = fetchSubscription(setSubscription, logger);

    return Promise.all([sessionPromise, subscriptionPromise])
        .catch((error: unknown) => {
            if (isApiError(error) && error.status === 401) {
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
                        errorElement={<AppRouterErrorBoundary />}
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
