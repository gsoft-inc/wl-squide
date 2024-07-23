import { postJson, toSubscriptionStatusLabel, useSessionManager, useSubscription } from "@endpoints/shared";
import { isNavigationLink, useFireflyNavigationItems, useLogger, useRenderedNavigationItems, type NavigationLinkRenderProps, type NavigationSectionRenderProps, type RenderItemFunction, type RenderSectionFunction } from "@squide/firefly";
import { useI18nextInstance } from "@squide/i18next";
import { Suspense, useCallback, type MouseEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Loading } from "./Loading.tsx";
import { i18NextInstanceKey } from "./i18next.ts";

type RenderLinkItemFunction = (item: NavigationLinkRenderProps, key: string) => ReactNode;

type RenderSectionItemFunction = (item: NavigationSectionRenderProps, key: string) => ReactNode;

const renderLinkItem: RenderLinkItemFunction = ({ label, linkProps, additionalProps: { highlight, ...additionalProps } }, key) => {
    return (
        <li key={key} style={{ fontWeight: highlight ? "bold" : "normal" }}>
            <Link {...linkProps} {...additionalProps}>
                {label}
            </Link>
        </li>
    );
};

const renderSectionItem: RenderSectionItemFunction = ({ label, section }, key) => {
    return (
        <li key={key} style={{ display: "flex", gap: "5px" }}>
            {label}
            <div style={{ display: "flex", alignItems: "center", fontSize: "12px" }}>
                ({section})
            </div>
        </li>
    );
};

const renderItem: RenderItemFunction = (item, key) => {
    return isNavigationLink(item) ? renderLinkItem(item, key) : renderSectionItem(item, key);
};

const renderSection: RenderSectionFunction = (elements, key) => {
    return (
        <ul key={key} style={{ display: "flex", gap: "10px", padding: 0, listStyleType: "none" }}>
            {elements}
        </ul>
    );
};

export function AuthenticatedLayout() {
    const i18nextInstance = useI18nextInstance(i18NextInstanceKey);
    const { t } = useTranslation("AuthenticatedLayout", { i18n: i18nextInstance });

    const logger = useLogger();
    const sessionManager = useSessionManager();
    const session = sessionManager?.getSession();
    const subscription = useSubscription();

    const subscriptionStatusLabel = toSubscriptionStatusLabel(subscription!.status, {
        trialLabel: t("trialLabel"),
        paidLabel: t("paidLabel"),
        notPaidLabel: t("notPaidLabel")
    });

    const navigate = useNavigate();

    const handleDisconnect = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        postJson("/api/logout")
            .then(() => {
                sessionManager?.clearSession();

                logger.debug("[shell] The user session has been cleared.");

                navigate("/logout");
            })
            .catch(() => {
                throw new Error("An unknown error happened while disconnecting the user.");
            });
    }, [logger, navigate, sessionManager]);

    const handleUpdateSession = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        postJson("/api/update-session")
            .then(() => {
                logger.debug("[shell] Updated the user session.");
            });
    }, [logger]);

    const handleShuffleFeatureFlags = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        postJson("/api/shuffle-feature-flags")
            .then(() => {
                logger.debug("[shell] Shuffled the feature flags.");
            });
    }, [logger]);

    const handleDeactivateFeatureB = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        postJson("/api/deactivate-feature-b")
            .then(() => {
                logger.debug("[shell] Deactivated feature B.");
            });
    }, [logger]);

    const navigationItems = useFireflyNavigationItems();
    const renderedNavigationItems = useRenderedNavigationItems(navigationItems, renderItem, renderSection);

    return (
        <>
            <div style={{ display: "flex", alignItems: "center" }}>
                <nav style={{ width: "100%" }}>
                    {renderedNavigationItems}
                </nav>
                <div style={{ whiteSpace: "nowrap", marginRight: "20px" }}>
                    {/* Must check for a null session because when the disconnect button is clicked, it will clear the session and rerender this layout. */}
                    {/* eslint-disable-next-line max-len */}
                    ({t("subscriptionLabel")}: <span style={{ fontWeight: "bold" }}>{subscriptionStatusLabel}</span><span style={{ marginLeft: "10px", marginRight: "10px" }}>-</span>{t("userLabel")}: <span style={{ fontWeight: "bold" }}>{session?.user?.name}/{session?.user?.preferredLanguage}</span>)
                </div>
                <div>
                    <button type="button" onClick={handleUpdateSession} style={{ whiteSpace: "nowrap", marginRight: "10px" }}>
                        {t("updateSessionButtonLabel")}
                    </button>
                </div>
                <div>
                    <button type="button" onClick={handleShuffleFeatureFlags} style={{ whiteSpace: "nowrap", marginRight: "10px" }}>
                        {t("shuffleFeatureFlagsLabel")}
                    </button>
                </div>
                <div>
                    <button type="button" onClick={handleDeactivateFeatureB} style={{ whiteSpace: "nowrap", marginRight: "10px" }}>
                        {t("deactivateFeatureBLabel")}
                    </button>
                </div>
                <div>
                    <button type="button" onClick={handleDisconnect} style={{ whiteSpace: "nowrap" }}>
                        {t("disconnectButtonLabel")}
                    </button>
                </div>
            </div>
            <Suspense fallback={<Loading />}>
                <Outlet />
            </Suspense>
        </>
    );
}

/** @alias */
export const Component = AuthenticatedLayout;
