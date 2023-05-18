import { Link, Outlet, useNavigate } from "react-router-dom";
import { type ReactNode, Suspense, useCallback } from "react";
import { useEventBusListener, useNavigationItems, useRenderedNavigationItems, type RenderItemFunction, type RenderSectionFunction, isNavigationLink, type NavigationLinkRenderProps, type NavigationSectionRenderProps } from "@squide/react-router";

import { sessionManager } from "./session.ts";

type RenderLinkItemFunction = (item: NavigationLinkRenderProps, index: number, level: number) => ReactNode;

type RenderSectionItemFunction = (item: NavigationSectionRenderProps, index: number, level: number) => ReactNode;

const renderLinkItem: RenderLinkItemFunction = ({ label, linkProps, additionalProps: { highlight, ...additionalProps } }, index, level) => {
    return (
        <li key={`${level}-${index}`} style={{ fontWeight: highlight ? "bold" : "normal", listStyleType: "none" }}>
            <Link {...linkProps} {...additionalProps}>
                {label}
            </Link>
        </li>
    );
};

const renderSectionItem: RenderSectionItemFunction = ({ label, section }, index, level) => {
    return (
        <li key={`${level}-${index}`} style={{ listStyleType: "none", display: "flex", gap: "5px" }}>
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
        <ul key={`${level}-${index}`} style={{ display: "flex", gap: "10px", padding: 0 }}>
            {elements}
        </ul>
    );
};

export default function AuthenticatedLayout() {
    const navigate = useNavigate();

    const handleModulesMessage = useCallback((data: unknown) => {
        console.log("[sample] Message received from a module: ", data);
    }, []);

    useEventBusListener("write-to-host", handleModulesMessage);

    const handleDisconnect = useCallback(() => {
        sessionManager.clearSession();

        navigate("/login");
    }, [navigate]);

    const navigationItems = useNavigationItems();

    const renderedNavigationItems = useRenderedNavigationItems(navigationItems, renderItem, renderSection);

    return (
        <>
            <div style={{ display: "flex", alignItems: "center" }}>
                <nav style={{ width: "100%" }}>
                    {renderedNavigationItems}
                </nav>
                <div>
                    <button type="button" onClick={handleDisconnect}>Disconnect</button>
                </div>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
                <Outlet />
            </Suspense>
        </>
    );
}
