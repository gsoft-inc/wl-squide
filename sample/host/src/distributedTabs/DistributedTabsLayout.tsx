import { useNavigationItems, useRenderedNavigationItems, type NavigationLinkRenderProps, type RenderItemFunction, type RenderSectionFunction } from "@squide/react-router";
import { Link, Outlet } from "react-router-dom";

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

export default function DistributedTabsLayout() {
    const navigationItems = useNavigationItems("/distributed-tabs");

    const renderedTabs = useRenderedNavigationItems(navigationItems, renderItem, renderSection);

    return (
        <div>
            <div>
                <p>Every tab is registered by a different module and is lazy loaded.</p>
                {renderedTabs}
                <div style={{ padding: "20px" }}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}


