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
    private _items: RootNavigationItem[];

    constructor() {
        this._items = [];
    }

    add(navigationItems: RootNavigationItem[]) {
        // Create a new array so the navigation items array is immutable.
        this._items = [...this._items, ...navigationItems];
    }

    get items() {
        return this._items;
    }
}
