import { isNil } from "@squide/core";
import type { ReactNode } from "react";
import type { LinkProps, To } from "react-router-dom";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ToFunction = (...args: any[]) => To;

export interface NavigationLink extends Omit<LinkProps, "to" | "children"> {
    $label: ReactNode;
    $to: To | ToFunction;
    $additionalProps?: Record<string, unknown>;
    children?: never;
}

export interface NavigationSection {
    $label: ReactNode;
    $additionalProps?: Record<string, unknown>;
    children: NavigationItem[];
    $to?: never;
}

export type NavigationItem = NavigationLink | NavigationSection;

// Will be exposed externally but is only expected to be used internally.
export function isLinkItem(item: NavigationItem): item is NavigationLink {
    return !isNil((item as NavigationLink).$to);
}

export type RootNavigationItem = NavigationItem & {
    // Highest priority is rendered first.
    $priority?: number;
};

export class NavigationItemRegistry {
    readonly #menus: Map<string, RootNavigationItem[]> = new Map();

    add(menuId: string, navigationItem: RootNavigationItem) {
        // Create a new array so the navigation items array is immutable.
        const items = [
            ...(this.#menus.get(menuId) ?? []),
            navigationItem
        ];

        this.#menus.set(menuId, items);
    }

    getItems(menuId: string) {
        return this.#menus.get(menuId);
    }
}
