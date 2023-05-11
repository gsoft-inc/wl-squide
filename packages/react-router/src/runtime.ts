import { AbstractRuntime } from "@squide/core";
import { NavigationItemRegistry } from "./navigationItemRegistry.ts";
import type { RootNavigationItem } from "./navigationItemRegistry.ts";
import type { RootRoute } from "./routeRegistry.ts";
import { RouteRegistry } from "./routeRegistry.ts";

export class Runtime extends AbstractRuntime<RootRoute, RootNavigationItem> {
    readonly #routeRegistry = new RouteRegistry();
    readonly #navigationItemRegistry = new NavigationItemRegistry();

    registerRoutes(routes: RootRoute[]) {
        this.#routeRegistry.add(routes);

        this._logger.debug(`[squide] The following route${routes.length !== 1 ? "s" : ""} has been registered.`, routes);
    }

    get routes() {
        return this.#routeRegistry.routes;
    }

    registerNavigationItems(navigationItems: RootNavigationItem[]) {
        this.#navigationItemRegistry.add(navigationItems);

        this._logger.debug(`[squide] The following navigation item${navigationItems.length !== 1 ? "s" : ""} has been registered.`, navigationItems);
    }

    get navigationItems() {
        return this.#navigationItemRegistry.items;
    }
}
