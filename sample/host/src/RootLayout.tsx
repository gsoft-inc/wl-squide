import { Link, Outlet } from "react-router-dom";
import { RenderItemFunction, RenderSectionFunction, useNavigationItems, useRenderedNavigationItems } from "@squide/react-router";
import { Suspense, useCallback } from "react";

export function RootLayout() {
    const navigationItems = useNavigationItems();

    const renderItem: RenderItemFunction = useCallback(({ content, linkProps, additionalProps: { highlight, ...additionalProps } }, index, level) => {
        return (
            <li key={`${level}-${index}`} style={{ fontWeight: highlight ? "bold" : "normal" }}>
                <Link {...linkProps} {...additionalProps}>
                    {content}
                </Link>
            </li>
        );
    }, []);

    const renderSection: RenderSectionFunction = useCallback((itemElements, index, level) => {
        return (
            <ul key={`${level}-${index}`}>
                {itemElements}
            </ul>
        );
    }, []);

    const renderedNavigationItems = useRenderedNavigationItems(navigationItems, renderItem, renderSection);

    return (
        <>
            {renderedNavigationItems}
            <Suspense fallback="Loading...">
                <Outlet />
            </Suspense>
        </>
    );
}
