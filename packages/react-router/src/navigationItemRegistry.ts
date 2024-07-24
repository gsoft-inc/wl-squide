import { isNil } from "@squide/core";
import memoize, { memoizeClear } from "memoize";
import type { ReactNode } from "react";
import type { LinkProps } from "react-router-dom";

export interface NavigationLink extends Omit<LinkProps, "children"> {
    $key?: string;
    $label: ReactNode;
    $additionalProps?: Record<string, unknown>;
    $canRender?: (obj?: unknown) => boolean;
    children?: never;
}

export interface NavigationSection {
    $key?: string;
    $label: ReactNode;
    $additionalProps?: Record<string, unknown>;
    $canRender?: (obj?: unknown) => boolean;
    children: NavigationItem[];
    to?: never;
}

export type NavigationItem = NavigationLink | NavigationSection;

// Will be exposed externally but is only expected to be used internally.
export function isLinkItem(item: NavigationItem): item is NavigationLink {
    return !isNil((item as NavigationLink).to);
}

export type RootNavigationItem = NavigationItem & {
    // Highest priority is rendered first.
    $priority?: number;
};

export type NavigationItemRegistrationType = "static" | "deferred";

export interface RegistryItem {
    menuId: string;
    registrationType: NavigationItemRegistrationType;
    item: RootNavigationItem;
}

export class NavigationItemDeferredRegistrationScope {
    readonly _registry: NavigationItemRegistry;

    constructor(registry: NavigationItemRegistry) {
        this._registry = registry;
    }

    addItem(menuId: string, navigationItem: RootNavigationItem) {
        this._registry.add(menuId, "deferred", navigationItem);
    }

    getItems(menuId: string) {
        return this._registry.getItems(menuId);
    }

    complete() {}
}

export class NavigationItemDeferredRegistrationTransactionalScope extends NavigationItemDeferredRegistrationScope {
    readonly #activeItems: Map<string, RegistryItem[]> = new Map();

    addItem(menuId: string, navigationItem: RootNavigationItem) {
        this.#activeItems.set(menuId, [
            ...(this.#activeItems.get(menuId) ?? []),
            {
                menuId,
                registrationType: "deferred",
                item: navigationItem
            }
        ]);
    }

    getItems(menuId: string) {
        return this.#activeItems.get(menuId)?.map(x => x.item) ?? [];
    }

    complete() {
        this._registry.clearDeferredItems();

        this.#activeItems.forEach(items => {
            items.forEach(x => {
                this._registry.add(x.menuId, x.registrationType, x.item);
            });
        });

        this.#activeItems.clear();
    }
}

export class NavigationItemRegistry {
    // <menuId, RegistryItem[]>
    readonly #menus: Map<string, RegistryItem[]> = new Map();

    // Since the "getItems" function is transforming the menus items from registry items to navigation items, the result of
    // the transformation is memoized to ensure the returned array is immutable and can be use in React closures.
    readonly #memoizedGetItems = memoize((menuId: string) => this.#menus.get(menuId)?.map(x => x.item) ?? []);

    #setItems(menuId: string, items: RegistryItem[]) {
        this.#menus.set(menuId, items);

        memoizeClear(this.#memoizedGetItems);
    }

    add(menuId: string, registrationType: NavigationItemRegistrationType, navigationItem: RootNavigationItem) {
        // Create a new array so the navigation items array is immutable.
        const items = [
            ...(this.#menus.get(menuId) ?? []),
            {
                menuId,
                registrationType,
                item: navigationItem
            }
        ];

        this.#setItems(menuId, items);
    }

    getItems(menuId: string) {
        return this.#memoizedGetItems(menuId);
    }

    clearDeferredItems() {
        const keys = this.#menus.keys();

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const next = keys.next();

            if (next.done) {
                break;
            }

            const key = next.value;
            const registryItems = this.#menus.get(key)!;

            // Keep the "getItems" function immutable by only updating the menu arrays if the items actually changed.
            if (registryItems.some(x => x.registrationType === "deferred")) {
                this.#setItems(key, registryItems.filter(x => x.registrationType !== "deferred"));
            }
        }
    }
}
