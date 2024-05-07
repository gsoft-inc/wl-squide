import { FeatureFlagsContext, SubscriptionContext, TelemetryServiceContext, fetchJson, isApiError, type FeatureFlags, type Session, type SessionManager, type Subscription, type TelemetryService } from "@endpoints/shared";
import { AppRouter as FireflyAppRouter, completeModuleRegistrations, useLogger, useRuntime, type Logger } from "@squide/firefly";
import { useChangeLanguage, useI18nextInstance } from "@squide/i18next";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AppRouterErrorBoundary } from "./AppRouterErrorBoundary.tsx";
import { i18NextInstanceKey } from "./i18next.ts";
import { useRefState } from "./useRefState.tsx";

export interface AppRouterProps {
    waitForMsw: boolean;
    sessionManager: SessionManager;
    telemetryService: TelemetryService;
}

async function fetchPublicData(setFeatureFlags: (featureFlags: FeatureFlags) => void, signal: AbortSignal, logger: Logger) {
    const data = await fetchJson("/api/feature-flags", {
        signal
    });

    logger.debug("[shell] %cFeature flags are ready%c:", "color: white; background-color: green;", "", data);

    setFeatureFlags(data);
}

async function fetchSession(signal: AbortSignal) {
    const data = await fetchJson("/api/session", {
        signal
    });

    const session: Session = {
        user: {
            id: data.userId,
            name: data.username,
            preferredLanguage: data.preferredLanguage
        }
    };

    return session;
}

async function fetchSubscription(signal: AbortSignal) {
    const data = await fetchJson("/api/subscription", {
        signal
    });

    return data as Subscription;
}

function fetchProtectedData(
    setSession: (session: Session) => void,
    setSubscription: (subscription: Subscription) => void,
    setIsProtectedDataLoaded: (isProtectedDataLoaded: boolean) => void,
    signal: AbortSignal,
    logger: Logger
) {
    const sessionPromise = fetchSession(signal);
    const subscriptionPromise = fetchSubscription(signal);

    return Promise.all([sessionPromise, subscriptionPromise])
        .then(([session, subscription]) => {
            logger.debug("[shell] %cSession is ready%c:", "color: white; background-color: green;", "", session);

            setSession(session);

            logger.debug("[shell] %cSubscription is ready%c:", "color: white; background-color: green;", "", subscription);

            setSubscription(subscription);
            setIsProtectedDataLoaded(true);
        })
        .catch((error: unknown) => {
            if (isApiError(error) && error.status === 401) {
                setIsProtectedDataLoaded(true);

                // The authentication boundary will redirect to the login page.
                return;
            }

            throw error;
        });
}

function Loading() {
    const i18nextInstance = useI18nextInstance(i18NextInstanceKey);
    const { t } = useTranslation("AppRouter", { i18n: i18nextInstance });

    return (
        <div>{t("loadingMessage")}</div>
    );
}

export function AppRouter({ waitForMsw, sessionManager, telemetryService }: AppRouterProps) {
    const [featureFlags, setFeatureFlags] = useState<FeatureFlags>();

    const [subscriptionRef, setSubscription] = useRefState<Subscription>();
    const [isProtectedDataLoaded, setIsProtectedDataLoaded] = useState(false);

    const logger = useLogger();
    const runtime = useRuntime();

    const changeLanguage = useChangeLanguage();

    const handleLoadPublicData = useCallback((signal: AbortSignal) => {
        return fetchPublicData(setFeatureFlags, signal, logger);
    }, [logger]);

    const handleLoadProtectedData = useCallback((signal: AbortSignal) => {
        const setSession = (session: Session) => {
            sessionManager.setSession(session);

            // When the session has been retrieved, update the language to match the user
            // preferred language.
            changeLanguage(session.user.preferredLanguage);
        };

        return fetchProtectedData(setSession, setSubscription, setIsProtectedDataLoaded, signal, logger);
    }, [logger, sessionManager, changeLanguage, setSubscription]);

    const handleCompleteRegistrations = useCallback(() => {
        return completeModuleRegistrations(runtime, {
            featureFlags,
            session: sessionManager.getSession()
        });
    }, [runtime, featureFlags, sessionManager]);

    return (
        <FeatureFlagsContext.Provider value={featureFlags}>
            <SubscriptionContext.Provider value={subscriptionRef.current!}>
                <TelemetryServiceContext.Provider value={telemetryService}>
                    <FireflyAppRouter
                        fallbackElement={<Loading />}
                        errorElement={<AppRouterErrorBoundary />}
                        waitForMsw={waitForMsw}
                        onLoadPublicData={handleLoadPublicData}
                        onLoadProtectedData={handleLoadProtectedData}
                        isPublicDataLoaded={!!featureFlags}
                        isProtectedDataLoaded={isProtectedDataLoaded}
                        onCompleteRegistrations={handleCompleteRegistrations}
                    >
                        {(routes, providerProps) => (
                            <RouterProvider router={createBrowserRouter(routes)} {...providerProps} />
                        )}
                    </FireflyAppRouter>
                </TelemetryServiceContext.Provider>
            </SubscriptionContext.Provider>
        </FeatureFlagsContext.Provider>
    );
}
