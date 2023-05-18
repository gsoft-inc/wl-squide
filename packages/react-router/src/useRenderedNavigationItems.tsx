import { type NavigationItem, type RootNavigationItem, isLinkItem, type NavigationLink, type NavigationSection } from "./navigationItemRegistry.ts";
import { useMemo, type ReactElement, type ReactNode } from "react";

import type { LinkProps } from "react-router-dom";
import { isNil } from "@squide/core";

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

export type RenderSectionFunction = (elements: ReactElement[], index: number, level: number) => ReactElement;

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
                if (x.priority === y.priority) {
                    return 0;
                }

                if (isNil(x.priority) && y.priority) {
                    return 1;
                }

                if (x.priority && isNil(y.priority)) {
                    return -1;
                }

                return x.priority! > y.priority! ? -1 : 1;
            })
            // priority is intentionally omitted.
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .map(({ priority, ...itemProps }) => ({
                ...itemProps
            }));

        return renderItems(sortedItems, renderItem, renderSection, 0, 0);
    }, [navigationItems, renderItem, renderSection]);
}
