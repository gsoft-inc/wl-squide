import { Link, Outlet, useNavigate } from "react-router-dom";
import type { RenderItemFunction, RenderSectionFunction } from "@squide/react-router";
import { Suspense, useCallback } from "react";
import { useEventBusListener, useNavigationItems, useRenderedNavigationItems } from "@squide/react-router";

import { sessionManager } from "./session.ts";

export default function AuthenticatedLayout() {
    const navigate = useNavigate();

    const handleModulesMessage = useCallback((data: unknown) => {
        console.log("[sample] Message received from a module: ", data);
    }, []);

    useEventBusListener("speak-to-host", handleModulesMessage);

    const handleDisconnect = useCallback(() => {
        sessionManager.clearSession();

        navigate("/login");
    }, [navigate]);

    const navigationItems = useNavigationItems();

    const renderItem: RenderItemFunction = useCallback(({ content, linkProps, additionalProps: { highlight, ...additionalProps } }, index, level) => {
        return (
            <li key={`${level}-${index}`} style={{ fontWeight: highlight ? "bold" : "normal", listStyleType: "none" }}>
                <Link {...linkProps} {...additionalProps}>
                    {content}
                </Link>
            </li>
        );
    }, []);

    const renderSection: RenderSectionFunction = useCallback((itemElements, index, level) => {
        return (
            <ul key={`${level}-${index}`} style={{ display: "flex", gap: "10px", padding: 0 }}>
                {itemElements}
            </ul>
        );
    }, []);

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
            <Suspense fallback="Loading...">
                <Outlet />
            </Suspense>
        </>
    );
}
