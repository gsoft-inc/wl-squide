import type { LinkProps } from "react-router-dom";
import type { ReactNode } from "react";

export type NavigationItem = Omit<LinkProps, "children"> & {
    content: ReactNode;
    children?: NavigationItem[];
    additionalProps?: Record<string, unknown>;
};

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
