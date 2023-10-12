import { toSubscriptionStatusLabel, useApplicationEventBusListener, useSubscription, type Session, type SessionManager } from "@sample/shared";
import { isNavigationLink, useLogger, useNavigationItems, useRenderedNavigationItems, useSession, type NavigationLinkRenderProps, type NavigationSectionRenderProps, type RenderItemFunction, type RenderSectionFunction } from "@squide/react-router";
import axios from "axios";
import { Suspense, useCallback, type MouseEvent, type ReactNode } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

type RenderLinkItemFunction = (item: NavigationLinkRenderProps, index: number, level: number) => ReactNode;

type RenderSectionItemFunction = (item: NavigationSectionRenderProps, index: number, level: number) => ReactNode;

const renderLinkItem: RenderLinkItemFunction = ({ label, linkProps, additionalProps: { highlight, ...additionalProps } }, index, level) => {
    return (
        <li key={`${level}-${index}`} style={{ fontWeight: highlight ? "bold" : "normal" }}>
            <Link {...linkProps} {...additionalProps}>
                {label}
            </Link>
        </li>
    );
};

const renderSectionItem: RenderSectionItemFunction = ({ label, section }, index, level) => {
    return (
        <li key={`${level}-${index}`} style={{ display: "flex", gap: "5px" }}>
            {label}
            <div style={{ display: "flex", alignItems: "center", fontSize: "12px" }}>
                ({section})
            </div>
        </li>
    );
};

const renderItem: RenderItemFunction = (item, index, level) => {
    return isNavigationLink(item) ? renderLinkItem(item, index, level) : renderSectionItem(item, index, level);
};

const renderSection: RenderSectionFunction = (elements, index, level) => {
    return (
        <ul key={`${level}-${index}`} style={{ display: "flex", gap: "10px", padding: 0, listStyleType: "none" }}>
            {elements}
        </ul>
    );
};

export interface AuthenticatedLayoutProps {
    sessionManager: SessionManager;
}

export function AuthenticatedLayout({ sessionManager }: AuthenticatedLayoutProps) {
    const logger = useLogger();

    const session = useSession() as Session;
    const subscription = useSubscription();

    const navigate = useNavigate();

    const handleModulesMessage = useCallback((data: unknown) => {
        console.log("[sample] Message received from a module: ", data);
    }, []);

    useApplicationEventBusListener("write-to-host", handleModulesMessage);

    const onDisconnect = useCallback(async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        axios.post("/logout")
            .then(() => {
                sessionManager.clearSession();

                logger.debug("[shell] The user session has been cleared.");

                navigate("/logout");
            })
            .catch(() => {
                throw new Error("An unknown error happened while disconnecting the user.");
            });
    }, [logger, navigate, sessionManager]);

    const navigationItems = useNavigationItems();
    const renderedNavigationItems = useRenderedNavigationItems(navigationItems, renderItem, renderSection);

    return (
        <>
            <div style={{ display: "flex", alignItems: "center" }}>
                <nav style={{ width: "100%" }}>
                    {renderedNavigationItems}
                </nav>
                <div style={{ whiteSpace: "nowrap", marginRight: "20px" }}>
                    {/* Must check for a null session because when the disconnect button is clicked, it will clear the session and rerender this layout. */}
                    (Subscription: <span style={{ fontWeight: "bold" }}>{toSubscriptionStatusLabel(subscription?.status)}</span><span style={{ marginLeft: "10px", marginRight: "10px" }}>-</span>User: <span style={{ fontWeight: "bold" }}>{session?.user?.name}</span>)
                </div>
                <div>
                    <button type="button" onClick={onDisconnect}>Disconnect</button>
                </div>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
                <Outlet />
            </Suspense>
        </>
    );
}
