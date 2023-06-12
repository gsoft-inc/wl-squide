import { useMemo, type ReactNode } from "react";
import { isLinkItem, type NavigationItem, type NavigationLink, type NavigationSection, type RootNavigationItem } from "./navigationItemRegistry.ts";

import { isNil } from "@squide/core";
import type { LinkProps } from "react-router-dom";

export interface NavigationLinkRenderProps {
    label: ReactNode;
    linkProps: Omit<LinkProps, "children">;
    additionalProps: Record<string, unknown>;
}

export interface NavigationSectionRenderProps {
    label: ReactNode;
    section: ReactNode;
    additionalProps: Record<string, unknown>;
}

export type NavigationItemRenderProps = NavigationLinkRenderProps | NavigationSectionRenderProps;

export function isNavigationLink(item: NavigationItemRenderProps): item is NavigationLinkRenderProps {
    return !isNil((item as NavigationLinkRenderProps).linkProps);
}

export type RenderItemFunction = (item: NavigationItemRenderProps, index: number, level: number) => ReactNode;

export type RenderSectionFunction = (elements: ReactNode[], index: number, level: number) => ReactNode;

function toLinkProps({ label, additionalProps, ...linkProps }: NavigationLink): NavigationLinkRenderProps {
    return {
        label,
        linkProps,
        additionalProps: additionalProps ?? {}
    };
}

function toMenuProps({ label, additionalProps }: NavigationSection, sectionElement: ReactNode): NavigationSectionRenderProps {
    return {
        label,
        section: sectionElement,
        additionalProps: additionalProps ?? {}
    };
}

function renderItems(items: NavigationItem[], renderItem: RenderItemFunction, renderSection: RenderSectionFunction, index: number, level: number) {
    const itemElements = items.map((x, itemIndex) => {
        let itemElement: ReactNode;

        if (isLinkItem(x)) {
            itemElement = renderItem(toLinkProps(x), itemIndex, level);
        } else {
            const sectionElement = renderItems(x.children, renderItem, renderSection, 0, level + 1);

            itemElement = renderItem(toMenuProps(x, sectionElement), itemIndex, level);
        }

        return itemElement;
    });

    return renderSection(itemElements, index, level);
}

export function useRenderedNavigationItems(
    navigationItems: RootNavigationItem[],
    renderItem: RenderItemFunction,
    renderSection: RenderSectionFunction
) {
    return useMemo(() => {
        // Highest priority is rendered first.
        const sortedItems = [...navigationItems]
            .sort((x, y) => {
                // Default an item priority to 0 to support negative priority.
                const xp = x.priority ?? 0;
                const yp = y.priority ?? 0;

                if (xp === yp) {
                    return 0;
                }

                return xp! > yp! ? -1 : 1;
            })
            // priority is intentionally omitted.
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .map(({ priority, ...itemProps }) => itemProps);

        return renderItems(sortedItems, renderItem, renderSection, 0, 0);
    }, [navigationItems, renderItem, renderSection]);
}
