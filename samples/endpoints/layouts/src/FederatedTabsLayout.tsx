import { useNavigationItems, useRenderedNavigationItems, type NavigationLinkRenderProps, type RenderItemFunction, type RenderSectionFunction } from "@squide/firefly";
import { Suspense, useCallback, type MouseEvent } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Link, Outlet, useNavigate } from "react-router-dom";

export interface FederatedTabsLayoutProps {
    host?: string;
}

const renderItem: RenderItemFunction = (item, index, level) => {
    const { label, linkProps } = item as NavigationLinkRenderProps;

    return (
        <li key={`${level}-${index}`}>
            <Link {...linkProps}>
                {label}
            </Link>
        </li>
    );
};

const renderSection: RenderSectionFunction = elements => {
    return (
        <ul style={{ listStyleType: "none", margin: 0, padding: 0, display: "flex", gap: "20px" }}>
            {elements}
        </ul>
    );
};

function TabsError() {
    const navigate = useNavigate();

    const handleTryAgain = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        // Reload the page to reset the error boundary.
        navigate(0);
    }, [navigate]);

    return (
        <div>
            <div style={{ color: "red", marginBottom: "10px" }}>
                An error occured while rendering the tab.
            </div>
            <button type="button" onClick={handleTryAgain}>Try again</button>
        </div>
    );
}

export function FederatedTabsLayout({ host }: FederatedTabsLayoutProps) {
    const navigationItems = useNavigationItems("/federated-tabs");
    const renderedTabs = useRenderedNavigationItems(navigationItems, renderItem, renderSection);

    return (
        <>
            <h1>Tabs</h1>
            {host && <p style={{ backgroundColor: "blue", color: "white", width: "fit-content" }}>This layout is served by <code>{host}</code></p>}
            {renderedTabs}
            <div style={{ paddingTop: "20px" }}>
                <ErrorBoundary FallbackComponent={TabsError}>
                    <Suspense fallback={<div>Loading...</div>}>
                        <Outlet />
                    </Suspense>
                </ErrorBoundary>
            </div>
        </>
    );
}


