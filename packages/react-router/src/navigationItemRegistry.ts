import { isNil } from "@squide/core";
import type { ReactNode } from "react";
import type { LinkProps } from "react-router-dom";

export interface NavigationLink extends Omit<LinkProps, "children"> {
    label: ReactNode;
    additionalProps?: Record<string, unknown>;
    children?: never;
}

export interface NavigationSection {
    label: ReactNode;
    children: NavigationItem[];
    additionalProps?: Record<string, unknown>;
    to?: never;
}

export type NavigationItem = NavigationLink | NavigationSection;

// Will be exposed externally but is only expected to be used internally.
export function isLinkItem(item: NavigationItem): item is NavigationLink {
    return !isNil((item as NavigationLink).to);
}

export type RootNavigationItem = NavigationItem & {
    // Highest priority is rendered first.
    priority?: number;
};

export class NavigationItemRegistry {
    #items: RootNavigationItem[];

    constructor() {
        this.#items = [];
    }

    add(navigationItems: RootNavigationItem[]) {
        // Create a new array so the navigation items array is immutable.
        this.#items = [...this.#items, ...navigationItems];
    }

    get items() {
        return this.#items;
    }
}
